import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve(process.env.USERPROFILE, '.n8n', 'database.sqlite');
const db = new DatabaseSync(dbPath);

console.log("USERS:");
try {
  const users = db.prepare("SELECT id, email, firstName, lastName FROM user").all();
  console.log(users);
} catch (e) {
  console.error("Error reading users:", e.message);
}

console.log("\nPROJECTS:");
try {
  const projects = db.prepare("SELECT id, name, type FROM project").all();
  console.log(projects);
} catch (e) {
  console.error("Error reading projects:", e.message);
}
