import http from 'http';

function getTunnels() {
  http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.tunnels && parsed.tunnels.length > 0) {
          const httpsTunnel = parsed.tunnels.find(t => t.proto === 'https');
          if (httpsTunnel) {
            console.log("SUCCESS_URL:" + httpsTunnel.public_url);
          } else {
            console.log("SUCCESS_URL:" + parsed.tunnels[0].public_url);
          }
        } else {
          console.log("ERROR: No tunnels found.");
        }
      } catch (e) {
        console.log("ERROR: Failed to parse JSON response:", e.message);
      }
    });
  }).on('error', (err) => {
    console.log("ERROR: Ngrok local API not reachable:", err.message);
  });
}

getTunnels();
