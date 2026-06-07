import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.env.USERPROFILE, '.n8n', 'database.sqlite');
console.log("Connecting to n8n SQLite Database at:", dbPath);

if (!fs.existsSync(dbPath)) {
  console.error("n8n SQLite database not found.");
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

async function main() {
  console.log("Activating imported workflows...");
  
  const workflowsToActivate = ['1', '2', '3'];

  for (const id of workflowsToActivate) {
    const row = db.prepare("SELECT id, name, versionId FROM workflow_entity WHERE id = ?").get(id);
    if (!row) {
      console.warn(`Warning: Workflow with ID ${id} not found in database.`);
      continue;
    }

    const versionId = row.versionId;
    console.log(`Activating workflow: "${row.name}" (ID: ${id}, Version ID: ${versionId})...`);

    // Step 1: Update workflow_entity to mark active and set activeVersionId
    db.prepare(`
      UPDATE workflow_entity
      SET active = 1, activeVersionId = ?
      WHERE id = ?
    `).run(versionId, id);

    // Step 2: Populate workflow_published_version
    db.prepare(`
      INSERT OR REPLACE INTO workflow_published_version (workflowId, publishedVersionId)
      VALUES (?, ?)
    `).run(id, versionId);
  }

  // Clear any existing custom manual entries in webhook_entity to allow fresh startup
  console.log("Cleaning manual entries in webhook_entity...");
  db.prepare("DELETE FROM webhook_entity").run();

  console.log("\nInspecting active database entries:");
  const entries = db.prepare("SELECT id, name, active, activeVersionId FROM workflow_entity").all();
  console.log(entries);

  console.log("\nInspecting workflow_published_version:");
  const pub = db.prepare("SELECT * FROM workflow_published_version").all();
  console.log(pub);

  console.log("\nWorkflows successfully activated in SQLite!");
}

try {
  main();
} catch (err) {
  console.error("Error activating workflows:", err);
}
