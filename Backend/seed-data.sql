-- Seed Data for 25 Students and 10 Teachers

-- 1. Create Courses
INSERT IGNORE INTO courses (id, course_name, course_code, credits, course_timing) VALUES 
(1, 'Advanced Data Structures', 'CS301', 4, '09:00 AM - 10:30 AM'),
(2, 'Relational Databases', 'CS302', 4, '11:00 AM - 12:30 PM'),
(3, 'Computer Networks', 'CS303', 3, '02:00 PM - 03:30 PM'),
(4, 'Operating Systems', 'CS304', 4, '09:00 AM - 10:30 AM'),
(5, 'Software Engineering', 'CS305', 3, '11:00 AM - 12:30 PM'),
(6, 'Artificial Intelligence', 'CS401', 4, '02:00 PM - 03:30 PM'),
(7, 'Machine Learning', 'CS402', 4, '09:00 AM - 10:30 AM'),
(8, 'Cloud Computing', 'CS403', 3, '11:00 AM - 12:30 PM'),
(9, 'Cyber Security', 'CS404', 3, '02:00 PM - 03:30 PM'),
(10, 'Mobile App Development', 'CS405', 3, '04:00 PM - 05:30 PM');

-- 2. Create Teachers (FAC2024001 to FAC2024010)
-- Password for all: password123
SET @pass = '$2b$10$vrlGhm4.jCB1tPp8BtA9FueATzpUa4z2U9Lj5OtwMP8tu4m7tIkcC'; 

INSERT IGNORE INTO users (id, name, email, password_hash, role, employee_code) VALUES 
(101, 'Dr. Patricia Lee', 'patricia.lee@faculty.edu', @pass, 'teacher', 'FAC2024001'),
(102, 'Prof. James Wilson', 'james.wilson@faculty.edu', @pass, 'teacher', 'FAC2024002'),
(103, 'Dr. Emily Chen', 'emily.chen@faculty.edu', @pass, 'teacher', 'FAC2024003'),
(104, 'Prof. Michael Brown', 'michael.brown@faculty.edu', @pass, 'teacher', 'FAC2024004'),
(105, 'Dr. Sarah Davis', 'sarah.davis@faculty.edu', @pass, 'teacher', 'FAC2024005'),
(106, 'Dr. Robert Miller', 'robert.miller@faculty.edu', @pass, 'teacher', 'FAC2024006'),
(107, 'Prof. Linda Garcia', 'linda.garcia@faculty.edu', @pass, 'teacher', 'FAC2024007'),
(108, 'Dr. William Taylor', 'william.taylor@faculty.edu', @pass, 'teacher', 'FAC2024008'),
(109, 'Prof. Elizabeth Moore', 'elizabeth.moore@faculty.edu', @pass, 'teacher', 'FAC2024009'),
(110, 'Dr. David Thomas', 'david.thomas@faculty.edu', @pass, 'teacher', 'FAC2024010');

-- 3. Assign Teachers to Courses
INSERT IGNORE INTO course_teachers (course_id, teacher_user_id) VALUES 
(1, 101), (2, 102), (3, 103), (4, 104), (5, 105), (6, 106), (7, 107), (8, 108), (9, 109), (10, 110);

-- 4. Create Students (STU2024001 to STU2024025)
INSERT IGNORE INTO users (id, name, email, password_hash, role, student_id) VALUES 
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

-- 5. Create Student Profiles
INSERT IGNORE INTO student_profiles (user_id, student_id, full_name, department, semester, section, batch, admission_year, current_cgpa) VALUES 
(201, 'STU2024001', 'Alice Johnson', 'CS', 6, 'A', '2021-2025', 2021, 8.5),
(202, 'STU2024002', 'Bob Smith', 'CS', 6, 'A', '2021-2025', 2021, 7.8),
(203, 'STU2024003', 'Carol White', 'CS', 6, 'A', '2021-2025', 2021, 9.2),
(204, 'STU2024004', 'David Brown', 'CS', 6, 'A', '2021-2025', 2021, 8.1),
(205, 'STU2024005', 'Emma Davis', 'CS', 6, 'A', '2021-2025', 2021, 8.9),
(206, 'STU2024006', 'Frank Miller', 'CS', 6, 'B', '2021-2025', 2021, 7.5),
(207, 'STU2024007', 'Grace Wilson', 'CS', 6, 'B', '2021-2025', 2021, 8.4),
(208, 'STU2024008', 'Henry Taylor', 'CS', 6, 'B', '2021-2025', 2021, 7.9),
(209, 'STU2024009', 'Ivy Martinez', 'CS', 6, 'B', '2021-2025', 2021, 9.0),
(210, 'STU2024010', 'Jack Anderson', 'CS', 6, 'B', '2021-2025', 2021, 8.2),
(211, 'STU2024011', 'Kelly Thomas', 'IT', 4, 'A', '2022-2026', 2022, 8.7),
(212, 'STU2024012', 'Liam White', 'IT', 4, 'A', '2022-2026', 2022, 7.6),
(213, 'STU2024013', 'Mona Harris', 'IT', 4, 'A', '2022-2026', 2022, 8.3),
(214, 'STU2024014', 'Noah Clark', 'IT', 4, 'A', '2022-2026', 2022, 8.0),
(215, 'STU2024015', 'Olivia Lewis', 'IT', 4, 'A', '2022-2026', 2022, 9.5),
(216, 'STU2024016', 'Peter Walker', 'IT', 4, 'B', '2022-2026', 2022, 7.2),
(217, 'STU2024017', 'Quinn Young', 'IT', 4, 'B', '2022-2026', 2022, 8.6),
(218, 'STU2024018', 'Rose Hall', 'IT', 4, 'B', '2022-2026', 2022, 7.4),
(219, 'STU2024019', 'Sam Allen', 'IT', 4, 'B', '2022-2026', 2022, 8.8),
(220, 'STU2024020', 'Tina Sanchez', 'IT', 4, 'B', '2022-2026', 2022, 8.1),
(221, 'STU2024021', 'Umar Wright', 'ECE', 2, 'A', '2023-2027', 2023, 8.5),
(222, 'STU2024022', 'Vera Scott', 'ECE', 2, 'A', '2023-2027', 2023, 7.9),
(223, 'STU2024023', 'Will Green', 'ECE', 2, 'A', '2023-2027', 2023, 9.1),
(224, 'STU2024024', 'Xena Baker', 'ECE', 2, 'A', '2023-2027', 2023, 8.0),
(225, 'STU2024025', 'Yara Adams', 'ECE', 2, 'A', '2023-2027', 2023, 8.4);

-- 6. Enroll Students in Courses (Random assignments)
-- Alice, Bob, Carol, David, Emma in Courses 1, 2, 3
INSERT IGNORE INTO course_students (course_id, student_user_id) VALUES 
(1, 201), (2, 201), (3, 201),
(1, 202), (2, 202), (3, 202),
(1, 203), (2, 203), (3, 203),
(1, 204), (2, 204), (3, 204),
(1, 205), (2, 205), (3, 205);

-- Frank, Grace, Henry, Ivy, Jack in Courses 4, 5, 6
INSERT IGNORE INTO course_students (course_id, student_user_id) VALUES 
(4, 206), (5, 206), (6, 206),
(4, 207), (5, 207), (6, 207),
(4, 208), (5, 208), (6, 208),
(4, 209), (5, 209), (6, 209),
(4, 210), (5, 210), (6, 210);

-- Kelly, Liam, Mona, Noah, Olivia in Courses 7, 8
INSERT IGNORE INTO course_students (course_id, student_user_id) VALUES 
(7, 211), (8, 211),
(7, 212), (8, 212),
(7, 213), (8, 213),
(7, 214), (8, 214),
(7, 215), (8, 215);

-- Remaining students in Course 9, 10
INSERT IGNORE INTO course_students (course_id, student_user_id) VALUES 
(9, 216), (10, 216),
(9, 217), (10, 217),
(9, 218), (10, 218),
(9, 219), (10, 219),
(9, 220), (10, 220),
(9, 221), (10, 221),
(9, 222), (10, 222),
(9, 223), (10, 223),
(9, 224), (10, 224),
(9, 225), (10, 225);
