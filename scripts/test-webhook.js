const url = "https://5e5b6cc0c5f43acf-41-243-14-142.serveousercontent.com/webhook/1/webhook/kin-opere-router";

async function test() {
  console.log("Sending POST to:", url);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        templateId: "finance-agent",
        agencyId: "ec8f8bf3-3edb-4120-9aaa-777c12501148",
        agentId: "test-agent",
        callbackUrl: "http://localhost:3000/api/webhook/n8n-callback",
        inputData: {
          prompt: "Fais une analyse financière de l'entreprise KP.",
          timestamp: new Date().toISOString(),
          agentRole: "Expert Financier",
          agentName: "Kin Finance Agent"
        }
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

test();
