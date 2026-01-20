import Database from "better-sqlite3"

const db = new Database("keys.db")

db.prepare(`
  CREATE TABLE IF NOT EXISTS keys (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE,
    expiresAt INTEGER,
    createdAt INTEGER
  )
`).run()

export default db
