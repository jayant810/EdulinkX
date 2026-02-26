-- Update course_lectures table for Interactive Videos and Local Uploads

ALTER TABLE course_lectures 
ADD COLUMN is_interactive BOOLEAN DEFAULT FALSE,
ADD COLUMN interactions JSON DEFAULT NULL,
ADD COLUMN video_type ENUM('url', 'local') DEFAULT 'url';
