
import express from "express";
import bcrypt from "bcrypt";
import { sign } from "../utils/jwt.js";
import db from "../db/client.js";
import { requireBody } from "../middleware/requireBody.js";
import { getUserById } from "../db/queries/users.js";

const router = express.Router();

// POST /users/register
router.post("/register", requireBody(["username", "password"]), async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if user exists
    const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (rows.length > 0) return res.status(400).send("Username already exists");

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    const { rows: [user] } = await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
      [username, hashed]
    );
  const token = sign({ id: user.id });
  res.status(201).send(token);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// POST /users/login
router.post("/login", requireBody(["username", "password"]), async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows: [user] } = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (!user) return res.status(400).send("Invalid credentials");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).send("Invalid credentials");
  const token = sign({ id: user.id });
  res.send(token);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

export default router;
