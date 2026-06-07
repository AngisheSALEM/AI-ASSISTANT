import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve(process.env.USERPROFILE, '.n8n', 'database.sqlite');
const db = new DatabaseSync(dbPath);

console.log("FOREIGN KEYS ON workflow_entity:");
try {
  const fks = db.prepare("PRAGMA foreign_key_list(workflow_entity)").all();
  console.log(fks);
} catch (e) {
  console.error("Error:", e.message);
}

console.log("\nFOREIGN KEYS ON workflow_published_version:");
try {
  const fks = db.prepare("PRAGMA foreign_key_list(workflow_published_version)").all();
  console.log(fks);
} catch (e) {
  console.error("Error:", e.message);
}

console.log("\nFOREIGN KEYS ON webhook_entity:");
try {
  const fks = db.prepare("PRAGMA foreign_key_list(webhook_entity)").all();
  console.log(fks);
} catch (e) {
  console.error("Error:", e.message);
}

console.log("\nCOLUMNS OF workflow_history:");
try {
  const cols = db.prepare("PRAGMA table_info(workflow_history)").all();
  console.log(cols);
} catch (e) {
  console.error("Error:", e.message);
}

console.log("\nFOREIGN KEYS ON workflow_history:");
try {
  const fks = db.prepare("PRAGMA foreign_key_list(workflow_history)").all();
  console.log(fks);
} catch (e) {
  console.error("Error:", e.message);
}

console.log("\nCOLUMNS OF shared_workflow:");
try {
  const cols = db.prepare("PRAGMA table_info(shared_workflow)").all();
  console.log(cols);
} catch (e) {
  console.error("Error:", e.message);
}

console.log("\nFOREIGN KEYS ON shared_workflow:");
try {
  const fks = db.prepare("PRAGMA foreign_key_list(shared_workflow)").all();
  console.log(fks);
} catch (e) {
  console.error("Error:", e.message);
}

console.log("\nSAMPLE ROWS IN user:");
try {
  const rows = db.prepare("SELECT * FROM user").all();
  console.log(rows);
} catch (e) {
  console.error("Error:", e.message);
}

console.log("\nSAMPLE ROWS IN project:");
try {
  const rows = db.prepare("SELECT * FROM project").all();
  console.log(rows);
} catch (e) {
  console.error("Error:", e.message);
}

console.log("\nSAMPLE ROWS IN shared_workflow:");
try {
  const rows = db.prepare("SELECT * FROM shared_workflow").all();
  console.log(rows);
} catch (e) {
  console.error("Error:", e.message);
}

console.log("\nCHECKING TABLE COUNTS:");
for (const table of ['workflow_entity', 'workflow_published_version', 'webhook_entity', 'shared_workflow', 'workflow_history']) {
  try {
    const count = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get();
    console.log(`${table}: ${count.c} rows`);
  } catch (e) {
    console.error(`Error counting ${table}:`, e.message);
  }
}
