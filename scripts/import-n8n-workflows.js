import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.env.USERPROFILE, '.n8n', 'database.sqlite');
console.log("Connecting to n8n SQLite Database at:", dbPath);

if (!fs.existsSync(dbPath)) {
  console.error("n8n SQLite database not found at", dbPath);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function main() {
  // Read our workflows
  const routerPath = path.resolve('n8n', 'workflows', 'kin_opere_router.json');
  const dynamicAgentPath = path.resolve('n8n', 'workflows', 'kin_opere_dynamic_agent.json');

  if (!fs.existsSync(routerPath) || !fs.existsSync(dynamicAgentPath)) {
    console.error("Workflow JSON files are missing.");
    process.exit(1);
  }

  const routerWorkflow = JSON.parse(fs.readFileSync(routerPath, 'utf8'));
  const dynamicAgentWorkflow = JSON.parse(fs.readFileSync(dynamicAgentPath, 'utf8'));

  // Let's inspect existing workflows
  console.log("Existing workflows in n8n database:");
  const existing = db.prepare("SELECT id, name, active FROM workflow_entity").all();
  console.log(existing);

  // We want to insert or update
  // Let's check if they exist by name
  for (const wf of [routerWorkflow, dynamicAgentWorkflow]) {
    const name = wf.name;
    const nodes = JSON.stringify(wf.nodes);
    const connections = JSON.stringify(wf.connections);
    const active = 1; // Mark active!
    const settings = JSON.stringify(wf.settings || {});

    // Check if exists
    const row = db.prepare("SELECT id FROM workflow_entity WHERE name = ?").get(name);

    if (row) {
      console.log(`Workflow "${name}" exists. Updating and activating...`);
      db.prepare(`
        UPDATE workflow_entity 
        SET nodes = ?, connections = ?, active = ?, settings = ?, updatedAt = datetime('now')
        WHERE id = ?
      `).run(nodes, connections, active, settings, row.id);
    } else {
      console.log(`Workflow "${name}" does not exist. Creating and activating...`);
      const id = generateId();
      const versionId = generateUuid();
      db.prepare(`
        INSERT INTO workflow_entity (id, name, active, nodes, connections, settings, versionId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, active, nodes, connections, settings, versionId);
    }
  }

  console.log("Workflows successfully imported and activated in n8n SQLite!");
}

try {
  main();
} catch (err) {
  console.error("Error executing n8n import:", err);
}
