-- Master SQL Schema for Student Section

-- 1. Users table (already exists but for reference)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher', 'admin') NOT NULL,
  student_id VARCHAR(50) UNIQUE,
  employee_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
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
  current_cgpa DECIMAL(4,2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Courses & Enrollment
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_description TEXT,
  credits INT DEFAULT 0,
  course_timing VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS course_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  student_user_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_user_id INT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Lectures & Progress
CREATE TABLE IF NOT EXISTS course_lectures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  sub_title VARCHAR(255),
  video_url VARCHAR(255),
  notes_url VARCHAR(255),
  lecture_order INT DEFAULT 1,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_lecture_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_user_id INT NOT NULL,
  lecture_id INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lecture_id) REFERENCES course_lectures(id) ON DELETE CASCADE,
  UNIQUE KEY (student_user_id, lecture_id)
);

CREATE TABLE IF NOT EXISTS course_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255),
  file_url VARCHAR(255),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 5. Attendance
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_user_id INT NOT NULL,
  class_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  student_user_id INT NOT NULL,
  status ENUM('present', 'absent', 'late') DEFAULT 'present',
  FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('pdf', 'short', 'mcq') DEFAULT 'pdf',
  due_date DATETIME,
  max_score INT DEFAULT 100,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignment_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  question_text TEXT NOT NULL,
  options JSON, -- for MCQ
  correct_answer TEXT,
  marks INT DEFAULT 1,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_user_id INT NOT NULL,
  submission_text TEXT,
  file_url VARCHAR(255),
  status ENUM('submitted', 'reviewed', 'graded') DEFAULT 'submitted',
  score INT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Community
CREATE TABLE IF NOT EXISTS community_questions (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  tags JSON,
  author_id INT NOT NULL,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS community_answers (
  id CHAR(36) PRIMARY KEY,
  question_id CHAR(36) NOT NULL,
  author_id INT NOT NULL,
  body TEXT NOT NULL,
  accepted BOOLEAN DEFAULT FALSE,
  votes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES community_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Seed Data for Testing (Real data simulation)
-- Students
INSERT IGNORE INTO users (id, name, email, password_hash, role, student_id) VALUES 
(1, 'John Smith', 'john.smith@student.edu', '$2b$10$vrlGhm4.jCB1tPp8BtA9FueATzpUa4z2U9Lj5OtwMP8tu4m7tIkcC', 'student', 'STU2024001');

INSERT IGNORE INTO student_profiles (user_id, student_id, full_name, department, semester, section, batch, admission_year, current_cgpa) VALUES 
(1, 'STU2024001', 'John Smith', 'Computer Science Engineering', 6, 'A', '2021-2025', 2021, 8.5);

-- Courses
INSERT IGNORE INTO courses (id, course_name, course_code, credits) VALUES 
(1, 'Data Structures & Algorithms', 'CS301', 4),
(2, 'Database Management Systems', 'CS302', 4);

-- Enrollment
INSERT IGNORE INTO course_students (course_id, student_user_id) VALUES (1, 1), (2, 1);

-- Lectures
INSERT IGNORE INTO course_lectures (course_id, title, video_url, lecture_order) VALUES 
(1, 'Introduction to Linked Lists', 'http://example.com/video1.mp4', 1),
(1, 'Binary Search Trees', 'http://example.com/video2.mp4', 2);

-- Assignments
INSERT IGNORE INTO assignments (id, course_id, title, type, due_date) VALUES 
(1, 1, 'Algorithm Analysis Report', 'pdf', '2024-12-12 23:59:59'),
(2, 2, 'SQL Query Practice', 'pdf', '2024-12-10 23:59:59');
