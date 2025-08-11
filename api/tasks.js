import express from "express";
const router = express.Router();
export default router;
import {
  createPlaylist as createTask,
  getPlaylistById as getTaskById,
  getPlaylistsByUserId as getTasksByUserId,
} from "#db/queries/playlists";
import { requireUser } from "../middleware/requireUser.js";
import db from "../db/client.js";
router.use(requireUser);
router.get("/", async (req, res) => {
  const tasks = await getTasksByUserId(req.user.id);
  res.send(tasks);
});
router.post("/", async (req, res) => {
  if (!req.body) return res.status(400).send("Request body is required.");
  const { name, description } = req.body;
  if (!name || !description)
    return res.status(400).send("Request body requires: name, description");
  const task = await createTask(name, description, req.user.id);
  res.status(201).send(task);
});
router.param("id", async (req, res, next, id) => {
  const task = await getTaskById(id);
  if (!task) return res.status(404).send("Task not found.");
  req.task = task;
  next();
});
router.get("/:id", (req, res) => {
  if (req.task.user_id !== req.user.id) {
    return res.status(403).send("Forbidden: Not your task");
  }
  res.send(req.task);
});
router.put("/:id", async (req, res) => {
  if (req.task.user_id !== req.user.id) {
    return res.status(403).send("Forbidden: Not your task");
  }
  const { name, description } = req.body;
  if (!name && !description) {
    return res.status(400).send("Request body requires: name or description");
  }
  const fields = [];
  const values = [];
  let idx = 1;
  if (name) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (description) {
    fields.push(`description = $${idx++}`);
    values.push(description);
  }
  values.push(req.task.id);
  const sql = `UPDATE playlists SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
  const { rows: [updated] } = await db.query(sql, values);
  res.send(updated);
});
router.delete("/:id", async (req, res) => {
  if (req.task.user_id !== req.user.id) {
    return res.status(403).send("Forbidden: Not your task");
  }
  await db.query("DELETE FROM playlists WHERE id = $1", [req.task.id]);
  res.sendStatus(204);
});
