const { pool } = require('./db.cjs');

async function run() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS course_contents (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_url VARCHAR(255) NOT NULL,
        file_name VARCHAR(255),
        file_size INT,
        mime_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
    console.log('Table created');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
