import http from 'http';

const payload = JSON.stringify({
  agencyId: "test-agency",
  agentId: "comptable",
  templateId: "comptable",
  systemPrompt: "Test prompt",
  agentName: "Test Agent",
  agentRole: "Test Role",
  temperature: 0.7,
  inputData: { prompt: "Test user prompt" },
  isAutomation: false,
  callbackUrl: "http://localhost:3000/api/webhook/n8n-callback"
});

const req = http.request({
  hostname: 'localhost',
  port: 5678,
  path: '/webhook/1/webhook/kin-opere-router',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Local Webhook Response (Status: ${res.statusCode}):`);
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error("Local request failed:", e.message);
});

req.write(payload);
req.end();
