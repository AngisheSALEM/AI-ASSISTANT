import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve(process.env.USERPROFILE, '.n8n', 'database.sqlite');
const db = new DatabaseSync(dbPath);

console.log("WEBHOOK_ENTITY COLUMNS:");
const columns = db.prepare("PRAGMA table_info(webhook_entity)").all();
console.log(columns);

console.log("\nWEBHOOK_ENTITY ROWS:");
const rows = db.prepare("SELECT * FROM webhook_entity").all();
console.log(rows);
