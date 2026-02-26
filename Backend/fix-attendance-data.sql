-- Data Cleanup and Robust Enrollment Script
-- Run this if your Attendance page shows "No students found"

-- 1. Ensure all test students (201-225) are correctly in the users table
-- Password: password123
SET @pass = '$2b$10$vrlGhm4.jCB1tPp8BtA9FueATzpUa4z2U9Lj5OtwMP8tu4m7tIkcC';

REPLACE INTO users (id, name, email, password_hash, role, student_id) VALUES 
(201, 'Alice Johnson', 'alice.j@student.edu', @pass, 'student', 'STU2024001'),
(202, 'Bob Smith', 'bob.s@student.edu', @pass, 'student', 'STU2024002'),
(203, 'Carol White', 'carol.w@student.edu', @pass, 'student', 'STU2024003'),
(204, 'David Brown', 'david.b@student.edu', @pass, 'student', 'STU2024004'),
(205, 'Emma Davis', 'emma.d@student.edu', @pass, 'student', 'STU2024005'),
(206, 'Frank Miller', 'frank.m@student.edu', @pass, 'student', 'STU2024006'),
(207, 'Grace Wilson', 'grace.w@student.edu', @pass, 'student', 'STU2024007'),
(208, 'Henry Taylor', 'henry.t@student.edu', @pass, 'student', 'STU2024008'),
(209, 'Ivy Martinez', 'ivy.m@student.edu', @pass, 'student', 'STU2024009'),
(210, 'Jack Anderson', 'jack.a@student.edu', @pass, 'student', 'STU2024010'),
(211, 'Kelly Thomas', 'kelly.t@student.edu', @pass, 'student', 'STU2024011'),
(212, 'Liam White', 'liam.w@student.edu', @pass, 'student', 'STU2024012'),
(213, 'Mona Harris', 'mona.h@student.edu', @pass, 'student', 'STU2024013'),
(214, 'Noah Clark', 'noah.c@student.edu', @pass, 'student', 'STU2024014'),
(215, 'Olivia Lewis', 'olivia.l@student.edu', @pass, 'student', 'STU2024015'),
(216, 'Peter Walker', 'peter.w@student.edu', @pass, 'student', 'STU2024016'),
(217, 'Quinn Young', 'quinn.y@student.edu', @pass, 'student', 'STU2024017'),
(218, 'Rose Hall', 'rose.h@student.edu', @pass, 'student', 'STU2024018'),
(219, 'Sam Allen', 'sam.a@student.edu', @pass, 'student', 'STU2024019'),
(220, 'Tina Sanchez', 'tina.s@student.edu', @pass, 'student', 'STU2024020'),
(221, 'Umar Wright', 'umar.w@student.edu', @pass, 'student', 'STU2024021'),
(222, 'Vera Scott', 'vera.s@student.edu', @pass, 'student', 'STU2024022'),
(223, 'Will Green', 'will.g@student.edu', @pass, 'student', 'STU2024023'),
(224, 'Xena Baker', 'xena.b@student.edu', @pass, 'student', 'STU2024024'),
(225, 'Yara Adams', 'yara.a@student.edu', @pass, 'student', 'STU2024025');

-- 2. Clear old enrollments for these test students to avoid conflicts
DELETE FROM course_students WHERE student_user_id BETWEEN 201 AND 225;

-- 3. Enroll ALL 25 students into EVERY course (1-10) for maximum visibility during testing
INSERT INTO course_students (course_id, student_user_id)
SELECT c.id, u.id 
FROM courses c, users u 
WHERE c.id BETWEEN 1 AND 10 
AND u.id BETWEEN 201 AND 225;

-- 4. Verify that student profiles also exist
REPLACE INTO student_profiles (user_id, student_id, full_name, department, semester, section, batch, admission_year, current_cgpa)
SELECT id, student_id, name, 'CS', 6, 'A', '2021-2025', 2021, 8.5
FROM users WHERE id BETWEEN 201 AND 225;
