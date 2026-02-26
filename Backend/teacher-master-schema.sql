-- Master SQL Schema for Teacher Section

-- 1. Exams table
CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  exam_type ENUM('mcq', 'short', 'pdf') NOT NULL,
  duration_minutes INT NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  instructions TEXT,
  total_marks INT DEFAULT 100,
  status ENUM('draft', 'published', 'completed') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Exam Questions (for MCQ and Short Answer)
CREATE TABLE IF NOT EXISTS exam_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  question_text TEXT NOT NULL,
  options JSON, -- NULL for short answer
  correct_answer TEXT, -- Index for MCQ, text for short
  marks INT DEFAULT 1,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- 3. Exam Submissions
CREATE TABLE IF NOT EXISTS exam_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  answers JSON NOT NULL,
  score INT DEFAULT 0,
  status ENUM('submitted', 'graded') DEFAULT 'submitted',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Classes/Schedule Table (for Dashboard "Today's Classes")
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_user_id INT NOT NULL,
  section VARCHAR(50) NOT NULL,
  room VARCHAR(50),
  class_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Seed Data for Teacher Testing
-- Create a teacher user (if not exists)
INSERT IGNORE INTO users (id, name, email, password_hash, role, employee_code) VALUES 
(2, 'Dr. Patricia Lee', 'patricia.lee@faculty.edu', '$2b$10$vrlGhm4.jCB1tPp8BtA9FueATzpUa4z2U9Lj5OtwMP8tu4m7tIkcC', 'teacher', 'FAC2024001');

-- Link Dr. Lee to existing courses
INSERT IGNORE INTO course_teachers (course_id, teacher_user_id) VALUES (1, 2), (2, 2);

-- Add some classes for Today/Tomorrow
INSERT IGNORE INTO classes (course_id, teacher_user_id, section, room, class_date, start_time, end_time) VALUES 
(1, 2, 'CS-A', 'Room 301', CURDATE(), '09:00:00', '10:00:00'),
(2, 2, 'CS-B', 'Room 302', CURDATE(), '11:00:00', '12:00:00'),
(1, 2, 'CS-A', 'Lab 105', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:00:00');

-- Add some dummy submissions for "Recent Submissions"
-- Assuming John Smith (ID 1) submitted something
INSERT IGNORE INTO assignment_submissions (assignment_id, student_user_id, status, submitted_at) VALUES 
(1, 1, 'submitted', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 1, 'submitted', DATE_SUB(NOW(), INTERVAL 4 HOUR));
