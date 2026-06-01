async function testLogin(email, password) {
  try {
    const response = await fetch('https://edulinkx.jayantsadhwani.me/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`SUCCESS: ${email} / ${password}`);
      return true;
    }
  } catch (error) {}
  return false;
}

async function run() {
  const emails = ['student@edulink.com', 'student@edulinkx.com', 'student@gmail.com'];
  const passwords = ['student', 'student123', 'password123'];
  
  for (const e of emails) {
    for (const p of passwords) {
      console.log(`Trying ${e} / ${p}...`);
      if (await testLogin(e, p)) return;
    }
  }
  console.log("All combinations failed.");
}

run();
