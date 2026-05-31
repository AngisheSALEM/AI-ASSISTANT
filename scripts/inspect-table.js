import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve(process.env.USERPROFILE, '.n8n', 'database.sqlite');
const db = new DatabaseSync(dbPath);

console.log("TABLE COLUMNS:");
const columns = db.prepare("PRAGMA table_info(workflow_entity)").all();
console.log(columns);

console.log("\nSAMPLE ROW:");
const sample = db.prepare("SELECT * FROM workflow_entity LIMIT 1").get();
if (sample) {
  // Let's print keys and some sample values (truncated if too long)
  const safeSample = {};
  for (const [k, v] of Object.entries(sample)) {
    safeSample[k] = typeof v === 'string' && v.length > 100 ? v.substring(0, 100) + '...' : v;
  }
  console.log(safeSample);
}
