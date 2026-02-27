require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
});

// Advanced MySQL to PostgreSQL translation
pool.execute = async (sql, params = []) => {
  let pgSql = sql;
  
  // 1. Convert MySQL '?' placeholders to PostgreSQL '$1, $2, ...'
  let paramCount = 1;
  // Use a regex to find ? that are not inside quotes
  // Simple approach: loop and replace first occurrence
  while (pgSql.includes('?')) {
    pgSql = pgSql.replace('?', `$${paramCount++}`);
  }
  
  // 2. Replace common MySQL functions/syntax with PG equivalents
  // Boolean evaluation in SUM: SUM(status='present') -> SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)
  // Only replace if it doesn't already contain CASE WHEN
  if (!pgSql.toLowerCase().includes('case when')) {
    pgSql = pgSql.replace(/SUM\((.*?)\s*=\s*(.*?)\)/gi, 'SUM(CASE WHEN $1 = $2 THEN 1 ELSE 0 END)');
  }
  
  // Date functions
  pgSql = pgSql.replace(/MONTH\((.*?)\)/gi, 'EXTRACT(MONTH FROM $1)');
  pgSql = pgSql.replace(/YEAR\((.*?)\)/gi, 'EXTRACT(YEAR FROM $1)');
  pgSql = pgSql.replace(/DAY\((.*?)\)/gi, 'EXTRACT(DAY FROM $1)');
  pgSql = pgSql.replace(/CURDATE\(\)/gi, 'CURRENT_DATE');
  pgSql = pgSql.replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP');
  
  // Other keywords
  pgSql = pgSql.replace(/IFNULL/gi, 'COALESCE');
  pgSql = pgSql.replace(/JSON_EXTRACT/gi, 'JSONB_EXTRACT_PATH');
  pgSql = pgSql.replace(/IF\((.*?),(.*?),(.*?)\)/gi, 'CASE WHEN $1 THEN $2 ELSE $3 END');
  
  // LIMIT and OFFSET are same
  
  try {
    const result = await pool.query(pgSql, params);
    return [result.rows, result.fields];
  } catch (err) {
    // Log the transformed query for debugging if it fails
    console.error("PostgreSQL Query Error:", err.message);
    console.error("Transformed SQL:", pgSql);
    throw err;
  }
};

const initializeDatabase = async () => {
  if (global.dbInitialized) return;
  
  console.log("Checking and initializing database schema...");
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      
      DO $$ BEGIN
        CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        CREATE TYPE assignment_type AS ENUM ('pdf', 'short', 'mcq');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        CREATE TYPE submission_status AS ENUM ('submitted', 'reviewed', 'graded');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        CREATE TYPE exam_status AS ENUM ('draft', 'published', 'completed');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        CREATE TYPE video_type AS ENUM ('url', 'local');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // 2. Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255), -- NULL for Google Login
        role user_role NOT NULL,
        student_id VARCHAR(50) UNIQUE,
        employee_code VARCHAR(50) UNIQUE,
        google_id VARCHAR(255) UNIQUE,
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        email_notifications BOOLEAN DEFAULT TRUE,
        windows_notifications BOOLEAN DEFAULT TRUE,
        assignment_updates BOOLEAN DEFAULT TRUE,
        exam_reminders BOOLEAN DEFAULT TRUE,
        grade_updates BOOLEAN DEFAULT TRUE,
        fee_reminders BOOLEAN DEFAULT TRUE,
        attendance_alerts BOOLEAN DEFAULT TRUE,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS student_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        date_of_birth DATE,
        gender VARCHAR(20),
        blood_group VARCHAR(10),
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        father_name VARCHAR(255),
        father_phone VARCHAR(20),
        mother_name VARCHAR(255),
        mother_phone VARCHAR(20),
        guardian_email VARCHAR(255),
        department VARCHAR(100),
        program VARCHAR(100),
        semester INT,
        section VARCHAR(10),
        batch VARCHAR(50),
        admission_year INT,
        roll_number VARCHAR(50),
        registration_number VARCHAR(50),
        academic_status VARCHAR(50) DEFAULT 'Active',
        mentor_name VARCHAR(255),
        current_cgpa DECIMAL(4,2) DEFAULT 0.00
      );

      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        course_name VARCHAR(255) NOT NULL,
        course_code VARCHAR(50) UNIQUE NOT NULL,
        course_description TEXT,
        credits INT DEFAULT 0,
        course_timing VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS course_students (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        student_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS course_teachers (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        teacher_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS course_lectures (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        sub_title VARCHAR(255),
        video_url VARCHAR(255),
        notes_url VARCHAR(255),
        lecture_order INT DEFAULT 1,
        is_interactive BOOLEAN DEFAULT FALSE,
        interactions JSONB DEFAULT NULL,
        video_type video_type DEFAULT 'url',
        ai_summary TEXT DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS student_lecture_progress (
        id SERIAL PRIMARY KEY,
        student_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lecture_id INT NOT NULL REFERENCES course_lectures(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        answered_interactions JSONB DEFAULT '[]',
        UNIQUE (student_user_id, lecture_id)
      );

      CREATE TABLE IF NOT EXISTS course_materials (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255),
        file_url VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS attendance_sessions (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        teacher_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        class_date DATE NOT NULL,
        start_time TIME,
        end_time TIME
      );

      CREATE TABLE IF NOT EXISTS attendance_records (
        id SERIAL PRIMARY KEY,
        session_id INT NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
        student_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status attendance_status DEFAULT 'present'
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type assignment_type DEFAULT 'pdf',
        due_date TIMESTAMP,
        max_score INT DEFAULT 100
      );

      CREATE TABLE IF NOT EXISTS assignment_questions (
        id SERIAL PRIMARY KEY,
        assignment_id INT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options JSONB,
        correct_answer TEXT,
        marks INT DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        student_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        submission_text TEXT,
        file_url VARCHAR(255),
        status submission_status DEFAULT 'submitted',
        score INT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS exams (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        exam_type assignment_type NOT NULL,
        duration_minutes INT NOT NULL,
        exam_date DATE NOT NULL,
        start_time TIME NOT NULL,
        instructions TEXT,
        total_marks INT DEFAULT 100,
        status exam_status DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS exam_questions (
        id SERIAL PRIMARY KEY,
        exam_id INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options JSONB,
        correct_answer TEXT,
        marks INT DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS exam_submissions (
        id SERIAL PRIMARY KEY,
        exam_id INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
        student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        answers JSONB NOT NULL,
        score INT DEFAULT 0,
        status submission_status DEFAULT 'submitted',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        teacher_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        section VARCHAR(50) NOT NULL,
        room VARCHAR(50),
        class_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL
      );

      CREATE TABLE IF NOT EXISTS community_questions (
        id UUID PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        tags JSONB,
        author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS community_answers (
        id UUID PRIMARY KEY,
        question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
        author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        accepted BOOLEAN DEFAULT FALSE,
        votes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_disconnected_by_admin BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS conversation_participants (
        conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (conversation_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_slug ON community_questions(slug);
      CREATE INDEX IF NOT EXISTS idx_answers_question_id ON community_answers(question_id);
    `);

    await client.query('COMMIT');
    console.log("Database initialization complete.");
    global.dbInitialized = true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Database initialization failed:", err);
  } finally {
    client.release();
  }
};

// Start initialization automatically
initializeDatabase();

module.exports = pool;
