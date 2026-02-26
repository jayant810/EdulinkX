
SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


CREATE TABLE `attendance_records` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `student_user_id` int(11) NOT NULL,
  `status` enum('present','absent','holiday') NOT NULL,
  `marked_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `attendance_records` (`id`, `session_id`, `student_user_id`, `status`, `marked_at`) VALUES
(1, 1, 3, 'present', '2026-01-18 16:51:29'),
(2, 2, 3, 'present', '2026-01-18 16:51:29'),
(3, 3, 3, 'absent', '2026-01-18 16:51:29'),
(4, 4, 3, 'present', '2026-01-18 16:51:29'),
(5, 5, 3, 'present', '2026-01-18 16:51:29'),
(6, 6, 3, 'present', '2026-01-18 16:51:29'),
(7, 7, 3, 'absent', '2026-01-18 16:51:29'),
(8, 8, 3, 'present', '2026-01-18 16:51:29'),
(9, 9, 3, 'present', '2026-01-18 16:51:29');


CREATE TABLE `attendance_sessions` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_user_id` int(11) NOT NULL,
  `class_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `attendance_sessions` (`id`, `course_id`, `teacher_user_id`, `class_date`, `start_time`, `end_time`, `section`, `created_at`) VALUES
(1, 1, 4, '2024-12-01', '10:00:00', '11:00:00', 'CS-A', '2026-01-18 16:51:12'),
(2, 1, 4, '2024-12-02', '10:00:00', '11:00:00', 'CS-A', '2026-01-18 16:51:12'),
(3, 1, 4, '2024-12-03', '10:00:00', '11:00:00', 'CS-A', '2026-01-18 16:51:12'),
(4, 2, 4, '2024-12-01', '11:00:00', '12:00:00', 'CS-A', '2026-01-18 16:51:12'),
(5, 2, 4, '2024-12-02', '11:00:00', '12:00:00', 'CS-A', '2026-01-18 16:51:12'),
(6, 2, 4, '2024-12-03', '11:00:00', '12:00:00', 'CS-A', '2026-01-18 16:51:12'),
(7, 3, 4, '2024-12-01', '12:00:00', '13:00:00', 'CS-A', '2026-01-18 16:51:12'),
(8, 3, 4, '2024-12-02', '12:00:00', '13:00:00', 'CS-A', '2026-01-18 16:51:12'),
(9, 3, 4, '2024-12-03', '12:00:00', '13:00:00', 'CS-A', '2026-01-18 16:51:12');


CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_user_id` int(11) NOT NULL,
  `class_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `classes` (`id`, `course_id`, `teacher_user_id`, `class_date`, `start_time`, `end_time`, `room`, `section`) VALUES
(1, 1, 4, '2025-12-15', '09:00:00', '10:00:00', 'Room 301', 'CS-A'),
(2, 2, 4, '2025-12-15', '11:00:00', '12:00:00', 'Room 302', 'CS-B'),
(3, 1, 4, '2025-12-16', '10:00:00', '11:00:00', 'Lab 105', 'CS-A');


CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `course_code` varchar(50) NOT NULL,
  `course_name` varchar(150) NOT NULL,
  `course_timing` varchar(100) DEFAULT NULL,
  `created_by_admin_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `courses` (`id`, `course_code`, `course_name`, `course_timing`, `created_by_admin_id`, `created_at`) VALUES
(1, 'CS301', 'Data Structures', '6 months', 5, '2025-12-14 22:18:57'),
(2, 'CS302', 'Algorithms', '3 months', 5, '2025-12-14 22:18:57'),
(3, 'CS303', 'Databases', 'Mon–Fri 2:00 PM – 3:00 PM', 5, '2025-12-14 22:18:57');


CREATE TABLE `course_lectures` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `sub_title` varchar(300) DEFAULT NULL,
  `video_url` text NOT NULL,
  `notes_url` text DEFAULT NULL,
  `lecture_order` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `course_lectures` (`id`, `course_id`, `title`, `sub_title`, `video_url`, `notes_url`, `lecture_order`, `created_at`) VALUES
(1, 1, 'Introduction to Data Structures', 'What are data structures and why we need them', 'https://www.youtube.com/watch?v=HBcHlWCDOT0', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 1, '2026-01-18 20:16:59'),
(2, 1, 'Arrays and Linked Lists', 'Understanding linear data structures', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 2, '2026-01-18 20:16:59'),
(3, 1, 'Stacks and Queues', 'LIFO and FIFO structures explained', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', NULL, 3, '2026-01-18 20:16:59'),
(4, 2, 'Introduction to Algorithms', 'Algorithm basics and complexity', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 1, '2026-01-18 20:16:59'),
(5, 2, 'Sorting Algorithms', 'Bubble, Merge and Quick sort', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', NULL, 2, '2026-01-18 20:16:59'),
(6, 3, 'Introduction to Databases', 'What is DBMS and RDBMS', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 1, '2026-01-18 20:16:59'),
(7, 3, 'SQL Basics', 'Writing SELECT, INSERT, UPDATE queries', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', NULL, 2, '2026-01-18 20:16:59');


CREATE TABLE `course_materials` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `file_url` text NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `course_materials` (`id`, `course_id`, `title`, `file_url`, `uploaded_at`) VALUES
(1, 1, 'Data Structures Complete Notes', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '2026-01-18 20:17:09'),
(2, 2, 'Algorithms Quick Reference', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '2026-01-18 20:17:09'),
(3, 3, 'Database SQL Handbook', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '2026-01-18 20:17:09');


CREATE TABLE `course_students` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `student_user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `course_students` (`id`, `course_id`, `student_user_id`) VALUES
(1, 1, 3),
(2, 2, 3),
(3, 3, 3);


CREATE TABLE `course_teachers` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `course_teachers` (`id`, `course_id`, `teacher_user_id`) VALUES
(7, 1, 4),
(8, 2, 4),
(9, 3, 4);


CREATE TABLE `lecture_chat_messages` (
  `id` int(11) NOT NULL,
  `lecture_id` int(11) NOT NULL,
  `student_user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `reply` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `lecture_chat_messages` (`id`, `lecture_id`, `student_user_id`, `message`, `reply`, `created_at`) VALUES
(1, 1, 3, 'What is the difference between data and information?', 'Data is raw facts, while information is processed data that is meaningful.', '2026-01-18 20:17:26'),
(2, 4, 3, 'What is time complexity?', 'Time complexity measures how running time grows with input size.', '2026-01-18 20:17:26');


CREATE TABLE `student_lecture_progress` (
  `id` int(11) NOT NULL,
  `student_user_id` int(11) NOT NULL,
  `lecture_id` int(11) NOT NULL,
  `completed` tinyint(1) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `student_lecture_progress` (`id`, `student_user_id`, `lecture_id`, `completed`, `completed_at`) VALUES
(1, 3, 1, 1, '2026-01-18 20:17:18'),
(2, 3, 2, 1, '2026-01-18 20:17:18'),
(3, 3, 4, 1, '2026-01-18 20:17:18');


CREATE TABLE `student_profiles` (
  `user_id` int(11) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `program` varchar(50) DEFAULT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL,
  `batch` varchar(50) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `father_name` varchar(150) DEFAULT NULL,
  `father_phone` varchar(20) DEFAULT NULL,
  `mother_name` varchar(150) DEFAULT NULL,
  `mother_phone` varchar(20) DEFAULT NULL,
  `guardian_email` varchar(255) DEFAULT NULL,
  `roll_number` varchar(50) DEFAULT NULL,
  `registration_number` varchar(50) DEFAULT NULL,
  `admission_year` year(4) DEFAULT NULL,
  `current_cgpa` decimal(3,2) DEFAULT NULL,
  `academic_status` enum('Active','Inactive','Graduated','Suspended') DEFAULT 'Active',
  `mentor_name` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `student_profiles` (`user_id`, `student_id`, `full_name`, `department`, `program`, `semester`, `section`, `batch`, `date_of_birth`, `gender`, `blood_group`, `email`, `phone`, `address`, `father_name`, `father_phone`, `mother_name`, `mother_phone`, `guardian_email`, `roll_number`, `registration_number`, `admission_year`, `current_cgpa`, `academic_status`, `mentor_name`, `created_at`, `updated_at`) VALUES
(3, 'STU2025001', 'Test Student', 'Computer Science Engineering', 'B.Tech', 'Semester 6', 'A', '2021-2025', '2003-03-15', 'Male', 'O+', 'test.student1@student.edu', '+91-9000000001', '123 College Road, City, State 12345', 'Test Parent1', '+91-9000000002', 'Test Parent2', '+91-9000000003', 'test.parent@email.com', '21CS101', 'REG2021CS0156', '2021', 8.50, 'Active', 'Test Mentor', '2025-12-14 21:11:21', '2026-01-18 19:42:27');


CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `employee_code` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `student_id`, `employee_code`, `created_at`) VALUES
(3, 'Test Student', 'student1@college.edu', '$2b$12$R9y2RZ2wWHZdeGJKx/211.5QwLkSSQInZ33SCoEUxhGI6hQpFVmPu', 'student', 'STU2025001', NULL, '2025-12-10 20:43:36'),
(4, 'Test teacher', 'teacher@college.edu', '$2b$12$KfaSSaT6Kpt0LlIl/4zsC.OzXjaOvaO7iqy4sjOAPg1s.7fu6.wCO', 'teacher', NULL, 'TEACHER2025001', '2025-12-10 20:43:36'),
(5, 'Test admin', 'admin@college.edu', '$2b$12$SwxkdzK2upSMB0/5YazqjOFGIg7NdWGko.KA3dpo39iG2U6KSqOiW', 'admin', NULL, 'ADM2025001', '2025-12-10 20:43:36');


ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `student_user_id` (`student_user_id`);


ALTER TABLE `attendance_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `teacher_user_id` (`teacher_user_id`);


ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `teacher_user_id` (`teacher_user_id`);


ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_code` (`course_code`),
  ADD KEY `created_by_admin_id` (`created_by_admin_id`);


ALTER TABLE `course_lectures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);


ALTER TABLE `course_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);


ALTER TABLE `course_students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_id` (`course_id`,`student_user_id`),
  ADD KEY `student_user_id` (`student_user_id`);


ALTER TABLE `course_teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_id` (`course_id`,`teacher_user_id`),
  ADD KEY `teacher_user_id` (`teacher_user_id`);


ALTER TABLE `lecture_chat_messages`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `student_lecture_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_user_id` (`student_user_id`,`lecture_id`),
  ADD KEY `lecture_id` (`lecture_id`);


ALTER TABLE `student_profiles`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `student_id` (`student_id`);


ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);


ALTER TABLE `attendance_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;


ALTER TABLE `attendance_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;


ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;


ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;


ALTER TABLE `course_lectures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;


ALTER TABLE `course_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;


ALTER TABLE `course_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;


ALTER TABLE `course_teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;


ALTER TABLE `lecture_chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;


ALTER TABLE `student_lecture_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;


ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;


ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions` (`id`),
  ADD CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`student_user_id`) REFERENCES `users` (`id`);


ALTER TABLE `attendance_sessions`
  ADD CONSTRAINT `attendance_sessions_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `attendance_sessions_ibfk_2` FOREIGN KEY (`teacher_user_id`) REFERENCES `users` (`id`);


ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`teacher_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;


ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`created_by_admin_id`) REFERENCES `users` (`id`);


ALTER TABLE `course_lectures`
  ADD CONSTRAINT `course_lectures_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);


ALTER TABLE `course_materials`
  ADD CONSTRAINT `course_materials_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);


ALTER TABLE `course_students`
  ADD CONSTRAINT `course_students_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_students_ibfk_2` FOREIGN KEY (`student_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;


ALTER TABLE `course_teachers`
  ADD CONSTRAINT `course_teachers_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_teachers_ibfk_2` FOREIGN KEY (`teacher_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;


ALTER TABLE `student_lecture_progress`
  ADD CONSTRAINT `student_lecture_progress_ibfk_1` FOREIGN KEY (`student_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `student_lecture_progress_ibfk_2` FOREIGN KEY (`lecture_id`) REFERENCES `course_lectures` (`id`);


ALTER TABLE `student_profiles`
  ADD CONSTRAINT `fk_student_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
SET FOREIGN_KEY_CHECKS=1;
COMMIT;


CREATE TABLE assignments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('pdf','short') NOT NULL,
  total_marks INT DEFAULT 0,
  due_date DATETIME NOT NULL,
  duration_minutes INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE assignment_questions (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  question_text TEXT NOT NULL,
  marks INT DEFAULT 1,

  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

CREATE TABLE assignment_submissions (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_user_id INT NOT NULL,
  submission_type ENUM('pdf','short') NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('submitted','graded') DEFAULT 'submitted',
  total_score INT DEFAULT NULL,

  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE,

  UNIQUE KEY unique_submission (assignment_id, student_user_id)
);

CREATE TABLE assignment_pdf_submissions (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  pdf_file_path VARCHAR(255) NOT NULL,

  FOREIGN KEY (submission_id) 
  REFERENCES assignment_submissions(id) 
  ON DELETE CASCADE
);

CREATE TABLE assignment_short_answers (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  question_id INT NOT NULL,
  answer_text TEXT,
  marks_awarded INT DEFAULT NULL,

  FOREIGN KEY (submission_id) 
    REFERENCES assignment_submissions(id) 
    ON DELETE CASCADE,

  FOREIGN KEY (question_id) 
    REFERENCES assignment_questions(id) 
    ON DELETE CASCADE
);




INSERT INTO assignments 
(course_id, teacher_user_id, title, description, type, total_marks, due_date, duration_minutes)
VALUES
(1, 4, 
 'Algorithm Analysis Report',
 'Analyze time and space complexity of sorting algorithms discussed in class. Submit a detailed PDF report.',
 'pdf',
 20,
 DATE_ADD(NOW(), INTERVAL 5 DAY),
 NULL
),

(2, 4,
 'Graph Theory Short Answer Test',
 'Answer short theoretical questions on Graph Theory.',
 'short',
 15,
 DATE_ADD(NOW(), INTERVAL 3 DAY),
 15
),

(3, 4,
 'SQL Query Practice Assignment',
 'Write SQL queries based on given problem statements and submit PDF.',
 'pdf',
 10,
 DATE_ADD(NOW(), INTERVAL 7 DAY),
 NULL
),

(1, 4,
 'Data Structures Short Questions',
 'Timed short answer test on Stack, Queue and Trees.',
 'short',
 20,
 DATE_ADD(NOW(), INTERVAL 2 DAY),
 20
);


INSERT INTO assignment_questions (assignment_id, question_text, marks)
VALUES
-- For Graph Theory Short Test (assignment_id = 2)
(2, 'Define a graph and its components.', 3),
(2, 'Explain difference between directed and undirected graphs.', 3),
(2, 'What is a spanning tree?', 3),
(2, 'Explain BFS algorithm.', 3),
(2, 'Explain DFS algorithm.', 3),

-- For Data Structures Short Test (assignment_id = 4)
(4, 'What is a stack? Explain its operations.', 4),
(4, 'What is a queue? Explain its types.', 4),
(4, 'Explain binary tree with example.', 4),
(4, 'Difference between BST and Heap.', 4),
(4, 'What is tree traversal?', 4);

INSERT INTO assignment_submissions
(assignment_id, student_user_id, submission_type, status, total_score)
VALUES
(1, 3, 'pdf', 'graded', 18);

INSERT INTO assignment_pdf_submissions
(submission_id, pdf_file_path)
VALUES
(1, 'dummy-report.pdf');
