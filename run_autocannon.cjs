const autocannon = require('autocannon');

async function runTest() {
  const result = await autocannon({
    url: 'https://lmslite.shiksak.com/api/login',
    connections: 50,
    duration: 60,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      email: 'teacher@example.com',
      password: 'Teacher@123'
    })
  });

  console.log('--- LOAD TEST COMPLETE: lmslite.shiksak.com ---');
  console.log('Total Requests:', result.requests.total);
  console.log('Average Latency:', result.latency.average, 'ms');
  console.log('Requests/Sec:', result.requests.average);
  console.log('2xx Responses:', result['2xx']);
  console.log('Non-2xx Responses:', result.non2xx);
  console.log('Errors (Timeouts/Conn):', result.errors);
}

runTest();
