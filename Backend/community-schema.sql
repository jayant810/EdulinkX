-- SQL Schema for Community Features

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

-- Indexing for performance
CREATE INDEX idx_questions_slug ON community_questions(slug);
CREATE INDEX idx_answers_question_id ON community_answers(question_id);
