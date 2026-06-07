import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const dbPath = path.resolve(process.env.USERPROFILE, '.n8n', 'database.sqlite');
console.log("Connecting to n8n SQLite Database at:", dbPath);

if (!fs.existsSync(dbPath)) {
  console.error("n8n SQLite database not found.");
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

async function main() {
  console.log("Cleaning webhook_entity...");
  db.prepare("DELETE FROM webhook_entity").run();

  // We find the ID of the router workflow in the database
  const routerRow = db.prepare("SELECT id FROM workflow_entity WHERE name = ?").get('Kin Opere — Routeur Principal & Auto-Remboursement');

  if (!routerRow) {
    console.error("Router workflow not found in database. Please run clean-n8n-db.js first.");
    process.exit(1);
  }

  const routerId = routerRow.id;
  console.log(`Router Workflow found with ID: ${routerId}`);

  // We insert the active webhook row for the router workflow
  console.log("Inserting webhook registration in webhook_entity...");
  db.prepare(`
    INSERT INTO webhook_entity (workflowId, webhookPath, method, node, webhookId, pathLength)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(routerId, 'kin-opere-router', 'POST', 'Webhook', null, 17);

  console.log("Webhook successfully registered in database!");

  console.log("\nInspecting webhook_entity table:");
  const webhooks = db.prepare("SELECT * FROM webhook_entity").all();
  console.log(webhooks);
}

try {
  main();
} catch (err) {
  console.error("Error activating webhooks:", err);
}
