-- Add ai_summary column to course_lectures
ALTER TABLE course_lectures ADD COLUMN ai_summary TEXT DEFAULT NULL;
