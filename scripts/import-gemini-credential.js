import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Load .env content manually to get the key
function loadEnvKey(envPath) {
  if (!fs.existsSync(envPath)) return null;
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/^GOOGLE_GENERATIVE_AI_API_KEY=["']?(.*?)["']?$/m);
  return match ? match[1] : null;
}

const workspaceDir = 'c:\\Users\\Salem\\Documents\\projet\\AI-ASSISTANT';
const envPath = path.join(workspaceDir, '.env');
const envProdPath = path.join(workspaceDir, '.env.production.local');

let apiKey = loadEnvKey(envPath) || loadEnvKey(envProdPath) || 'AIza_placeholder_key_please_replace';

if (apiKey === 'AIza...' || !apiKey) {
  apiKey = 'AIza_placeholder_key_please_replace';
  console.log("⚠️ Using placeholder Gemini API Key. Please replace it in n8n UI or .env.");
} else {
  console.log("✅ Found Gemini API Key in environment variables!");
}

const credentialData = [
  {
    "id": "google-gemini-api-credential-id",
    "name": "Google Gemini API Key",
    "type": "googlePalmApi",
    "data": {
      "apiKey": apiKey
    }
  }
];

const tempFilePath = path.join(workspaceDir, 'temp-credentials.json');
fs.writeFileSync(tempFilePath, JSON.stringify(credentialData, null, 2), 'utf-8');

try {
  console.log("Importing credential into n8n...");
  const cmd = `cmd /c npx n8n import:credentials --input="${tempFilePath}" --projectId="UhDDsQRnOFrEpBPv"`;
  const output = execSync(cmd, { encoding: 'utf-8' });
  console.log(output);
  console.log("🎉 Credential successfully imported!");
} catch (error) {
  console.error("❌ Failed to import credential:", error.message);
  if (error.stdout) console.error("stdout:", error.stdout);
  if (error.stderr) console.error("stderr:", error.stderr);
} finally {
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
}
