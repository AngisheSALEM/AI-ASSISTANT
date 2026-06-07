import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve(process.env.USERPROFILE, '.n8n', 'database.sqlite');
const db = new DatabaseSync(dbPath);

console.log("TABLE COLUMNS FOR workflow_published_version:");
try {
  const columns = db.prepare("PRAGMA table_info(workflow_published_version)").all();
  console.log(columns);
} catch (e) {
  console.error("Error columns:", e.message);
}

console.log("\nROWS IN workflow_published_version:");
try {
  const rows = db.prepare("SELECT * FROM workflow_published_version").all();
  console.log(rows.map(r => ({
    ...r,
    nodes: r.nodes ? r.nodes.substring(0, 50) + "..." : null,
    connections: r.connections ? r.connections.substring(0, 50) + "..." : null
  })));
} catch (e) {
  console.error("Error rows:", e.message);
}
