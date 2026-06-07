import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.env.USERPROFILE, '.n8n', 'database.sqlite');
console.log("Connecting to n8n SQLite Database at:", dbPath);

if (!fs.existsSync(dbPath)) {
  console.error("n8n SQLite database not found.");
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
  console.log("Wiping duplicate and old workflows in n8n database...");
  // Break circular foreign keys by setting activeVersionId to NULL first
  try {
    db.prepare("UPDATE workflow_entity SET activeVersionId = NULL").run();
  } catch (e) {
    console.log("Pre-cleanup update failed:", e.message);
  }

  db.prepare("DELETE FROM shared_workflow").run();
  db.prepare("DELETE FROM webhook_entity").run(); // Clear webhook registrations so n8n can recreate them cleanly
  db.prepare("DELETE FROM workflow_published_version").run();
  db.prepare("DELETE FROM workflow_history").run();
  db.prepare("DELETE FROM workflow_entity").run();
  console.log("Database wiped clean!");
  process.exit(0);

  // List of workflows to import
  const workflowsToImport = [
    {
      file: 'kin_opere_router.json',
      name: 'Kin Opere — Routeur Principal & Auto-Remboursement'
    },
    {
      file: 'kin_opere_dynamic_agent.json',
      name: 'Kin Opere — Agent IA Dynamique & Multi-Tenant'
    },
    {
      file: 'automation_pdf_receipt.json',
      name: 'Kin Opere — Automatisation Reçu & A2UI Table'
    }
  ];

  for (const wfInfo of workflowsToImport) {
    const wfPath = path.resolve('n8n', 'workflows', wfInfo.file);
    if (!fs.existsSync(wfPath)) {
      console.warn(`Warning: Workflow file ${wfInfo.file} not found at ${wfPath}`);
      continue;
    }

    const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
    
    // We override name to guarantee match
    const name = wfInfo.name;
    const nodes = JSON.stringify(wf.nodes);
    const connections = JSON.stringify(wf.connections);
    const active = 1; // Mark active!
    const settings = JSON.stringify(wf.settings || {});
    const id = generateId();
    const versionId = generateUuid();

    console.log(`Inserting clean workflow: "${name}" (ID: ${id}, Version ID: ${versionId})...`);
    // Step 1: Insert into workflow_entity with activeVersionId = NULL (breaks circular dependency)
    db.prepare(`
      INSERT INTO workflow_entity (id, name, active, nodes, connections, settings, versionId, activeVersionId)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    `).run(id, name, active, nodes, connections, settings, versionId);

    // Step 2: Insert into workflow_history (references workflow_entity.id)
    db.prepare(`
      INSERT INTO workflow_history (versionId, workflowId, authors, nodes, connections, name, autosaved, description, nodeGroups)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(versionId, id, '["system"]', nodes, connections, name, 0, wf.description || null, '[]');

    // Step 3: Update workflow_entity to set activeVersionId (references workflow_history.versionId)
    db.prepare(`
      UPDATE workflow_entity
      SET activeVersionId = ?
      WHERE id = ?
    `).run(versionId, id);

    // Step 4: Populate workflow_published_version to prevent 404 Active version not found error in n8n
    db.prepare(`
      INSERT OR REPLACE INTO workflow_published_version (workflowId, publishedVersionId)
      VALUES (?, ?)
    `).run(id, versionId);

    // Step 5: Associate workflow with the default project in shared_workflow
    const projectRow = db.prepare("SELECT id FROM project LIMIT 1").get();
    if (projectRow) {
      console.log(`Associating workflow with project ID: ${projectRow.id}`);
      db.prepare(`
        INSERT OR REPLACE INTO shared_workflow (workflowId, projectId, role)
        VALUES (?, ?, ?)
      `).run(id, projectRow.id, 'workflow:owner');
    } else {
      console.warn("Warning: No project found in n8n database. shared_workflow association skipped.");
    }
  }

  console.log("\nInspecting new database entries:");
  const entries = db.prepare("SELECT id, name, active FROM workflow_entity").all();
  console.log(entries);
  
  console.log("\nInspecting shared_workflow entries:");
  try {
    const sw = db.prepare("SELECT * FROM shared_workflow").all();
    console.log(sw);
  } catch (e) {
    console.error("Failed to inspect shared_workflow:", e.message);
  }

  console.log("\nCleanup and fresh import completed successfully!");
}

try {
  main();
} catch (err) {
  console.error("Error executing cleanup:", err);
}
