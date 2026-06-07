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
  try {
    console.log("Checking last 5 executions in n8n database...");
    const executions = db.prepare(`
      SELECT id, workflowId, status, startedAt, stoppedAt, mode 
      FROM execution_entity 
      ORDER BY startedAt DESC 
      LIMIT 5
    `).all();
    console.log(executions);

    console.log("\nChecking last 5 execution logs/errors...");
    const details = db.prepare(`
      SELECT id, workflowId, status, errorInfo, startedAt 
      FROM execution_entity 
      WHERE errorInfo IS NOT NULL 
      ORDER BY startedAt DESC 
      LIMIT 3
    `).all();
    console.log(details);
  } catch (err) {
    console.error("SQL Error:", err.message);
  }
}

main();
