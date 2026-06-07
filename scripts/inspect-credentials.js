import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve(process.env.USERPROFILE, '.n8n', 'database.sqlite');
const db = new DatabaseSync(dbPath);

console.log("CREDENTIALS_ENTITY COLUMNS:");
const columns = db.prepare("PRAGMA table_info(credentials_entity)").all();
console.log(columns.map(c => c.name));

console.log("\nCREDENTIALS_ENTITY ROWS:");
const rows = db.prepare("SELECT id, name, type, createdAt FROM credentials_entity").all();
console.log(rows);
