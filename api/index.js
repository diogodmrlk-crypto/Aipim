import express from "express"
import { v4 as uuid } from "uuid"
import crypto from "crypto"
import db from "../db.js"

const app = express()
app.use(express.json())

// 🔐 TOKEN ADMIN (MUDE ISSO)
const ADMIN_TOKEN = "FERRAO_ADMIN_123"

// 🔑 Gerar Key
app.post("/generate", (req, res) => {
  const token = req.headers["authorization"]

  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: "Acesso negado" })
  }

  const { days } = req.body

  const key = crypto.randomBytes(24).toString("hex")
  const now = Date.now()
  const expiresAt = now + (days * 24 * 60 * 60 * 1000)

  db.prepare(`
    INSERT INTO keys (id, key, expiresAt, createdAt)
    VALUES (?, ?, ?, ?)
  `).run(uuid(), key, expiresAt, now)

  res.json({
    key,
    expiresAt
  })
})

// ✅ Verificar Key (ROBLOX USA ISSO)
app.get("/verify", (req, res) => {
  const { key } = req.query

  if (!key) {
    return res.json({ valid: false })
  }

  const data = db.prepare(`
    SELECT * FROM keys WHERE key = ?
  `).get(key)

  if (!data) {
    return res.json({ valid: false })
  }

  if (Date.now() > data.expiresAt) {
    return res.json({
      valid: false,
      expired: true
    })
  }

  res.json({
    valid: true,
    expiresAt: data.expiresAt
  })
})

// 🧪 Listar Keys (admin)
app.get("/keys", (req, res) => {
  const token = req.headers["authorization"]

  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: "Acesso negado" })
  }

  const keys = db.prepare(`SELECT * FROM keys`).all()
  res.json(keys)
})

export default app
