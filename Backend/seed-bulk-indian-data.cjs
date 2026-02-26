const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function seedBulkData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase for bulk seeding...");

    const firstNames = ['Aarav', 'Vihaan', 'Advait', 'Aryan', 'Ishaan', 'Arjun', 'Kabir', 'Aaryan', 'Rohan', 'Ananya', 'Saanvi', 'Ishani', 'Myra', 'Anika', 'Aavya', 'Diya', 'Prisha', 'Aditi', 'Rahul', 'Vivek', 'Siddharth', 'Amit', 'Priya', 'Neha', 'Sneha', 'Anjali', 'Kunal', 'Manish', 'Pooja', 'Ritu', 'Akash', 'Varun', 'Deepak', 'Sanjay', 'Geeta', 'Kavita', 'Sunita', 'Rajesh', 'Vikram', 'Anil'];
    const lastNames = ['Sharma', 'Gupta', 'Verma', 'Iyer', 'Nair', 'Patel', 'Reddy', 'Singh', 'Choudhury', 'Das', 'Mishra', 'Pandey', 'Joshi', 'Kulkarni', 'Deshmukh', 'Bose', 'Chatterjee', 'Banerjee', 'Mehta', 'Shah', 'Aggarwal', 'Malhotra', 'Kapoor', 'Khanna', 'Gill', 'Dhillon', 'Yadav', 'Yadav', 'Rao', 'Reddy', 'Murthy', 'Menon', 'Pillai', 'Saxena', 'Srivastava'];
    const departments = ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'];
    
    const courseNames = [
      'Data Structures & Algorithms', 'Machine Learning', 'Artificial Intelligence', 'Database Management Systems',
      'Operating Systems', 'Computer Networks', 'Software Engineering', 'VLSI Design', 'Digital Signal Processing',
      'Microprocessors & Microcontrollers', 'Control Systems', 'Thermodynamics', 'Fluid Mechanics', 'Strength of Materials',
      'Structural Analysis', 'Reinforced Concrete Design', 'Surveying', 'Power Systems', 'Electrical Machines',
      'Analog Electronics', 'Discrete Mathematics', 'Theory of Computation', 'Cyber Security', 'Cloud Computing', 'Big Data Analytics'
    ];

    const passStu = await bcrypt.hash('student123', 10);
    const passTea = await bcrypt.hash('teacher123', 10);

    console.log("Seeding Teachers...");
    const teacherIds = [];
    for (let i = 1; i <= 20; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@college.edu`;
      const empCode = `FAC2024${String(i).padStart(3, '0')}`;
      
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, employee_code) 
         VALUES ($1, $2, $3, 'teacher', $4) 
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name 
         RETURNING id`,
        [`Prof. ${fn} ${ln}`, email, passTea, empCode]
      );
      teacherIds.push(res.rows[0].id);
    }

    console.log("Seeding Courses...");
    const courseIds = [];
    for (let i = 0; i < 25; i++) {
      const code = `ENG${String(i + 101)}`;
      const res = await client.query(
        `INSERT INTO courses (course_name, course_code, course_description, credits) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (course_code) DO UPDATE SET course_name = EXCLUDED.course_name 
         RETURNING id`,
        [courseNames[i], code, `Comprehensive study of ${courseNames[i]} within the Indian engineering curriculum.`, 4]
      );
      courseIds.push(res.rows[0].id);
    }

    console.log("Linking Teachers to Courses...");
    for (const cid of courseIds) {
      // Assign 1-2 random teachers to each course
      const numTeachers = Math.floor(Math.random() * 2) + 1;
      const shuffled = [...teacherIds].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numTeachers);
      for (const tid of selected) {
        await client.query("INSERT INTO course_teachers (course_id, teacher_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [cid, tid]);
      }
    }

    console.log("Seeding 150 Students and Profiles...");
    for (let i = 1; i <= 150; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}.stu${i}@college.edu`;
      const stuId = `STU2024${String(i).padStart(3, '0')}`;
      const dept = departments[Math.floor(Math.random() * departments.length)];
      
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, student_id) 
         VALUES ($1, $2, $3, 'student', $4) 
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name 
         RETURNING id`,
        [`${fn} ${ln}`, email, passStu, stuId]
      );
      const userId = res.rows[0].id;

      // Profile
      await client.query(
        `INSERT INTO student_profiles (user_id, student_id, full_name, email, department, semester, section, batch, admission_year, current_cgpa, academic_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Active')
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, stuId, `${fn} ${ln}`, email, dept, 4, 'A', '2022-2026', 2022, (7 + Math.random() * 2).toFixed(2)]
      );

      // Enroll in 3-5 random courses
      const numC = Math.floor(Math.random() * 3) + 3;
      const shuffledC = [...courseIds].sort(() => 0.5 - Math.random());
      const selectedC = shuffledC.slice(0, numC);
      for (const cid of selectedC) {
        await client.query("INSERT INTO course_students (course_id, student_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [cid, userId]);
      }

      if (i % 50 === 0) console.log(`Processed ${i} students...`);
    }

    console.log("✅ Bulk seeding complete!");
    console.log("Summary: 150 Students, 20 Teachers, 25 Courses, and random enrollments added.");

  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.end();
  }
}

seedBulkData();
