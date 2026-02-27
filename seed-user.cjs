// seed-user.cjs
require('dotenv').config({ path: './Backend/.env' });
const pool = require("./Backend/db.cjs");
const bcrypt = require("bcrypt");

async function seed() {
  const name = "Jayant Sadhwani";
  const email = "jayantsadhwani@gmail.com";
  const role = "admin";
  const password = "password123"; // You can change this later in settings

  try {
    const [exists] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length > 0) {
      console.log(`User ${email} already exists.`);
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, hash, role]
    );

    console.log(`Successfully added ${email} as ${role}.`);
    console.log(`Password: ${password}`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    process.exit(0);
  }
}

seed();
