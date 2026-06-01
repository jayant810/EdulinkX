async function testLogin(email, password) {
  try {
    const response = await fetch('https://edulinkx.jayantsadhwani.me/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`SUCCESS for ${email}: Token received`);
      return data.token;
    } else {
      console.log(`FAILED for ${email}:`, data);
    }
  } catch (error) {
    console.log(`ERROR for ${email}:`, error.message);
  }
  return null;
}

async function run() {
  console.log("Testing alice.j@student.edu / password123");
  const token = await testLogin('alice.j@student.edu', 'password123');
  if (token) {
    console.log("TOKEN:", token);
  }
}

run();
