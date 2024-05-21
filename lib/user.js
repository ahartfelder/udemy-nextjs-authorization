import db from "./db";

export function createUser(email, password) {
  const result = db
    .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
    .run(email, password);
  console.log(result);
  return result.lastInsertRowid;
}

export function getUserByEmail(email, password) {
  const result = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  console.log(result);
  return result;
}
