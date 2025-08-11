
import express from "express";
const router = express.Router();
export default router;

import { getTracks, getTrackById } from "#db/queries/tracks";
import db from "../db/client.js";
import { requireUser } from "../middleware/requireUser.js";

router.route("/").get(async (req, res) => {
  const tracks = await getTracks();
  res.send(tracks);
});

router.route("/:id").get(async (req, res) => {
  const track = await getTrackById(req.params.id);
  if (!track) return res.status(404).send("Track not found.");
  res.send(track);
});

// Protected: GET /tracks/:id/playlists
router.get("/:id/playlists", requireUser, async (req, res) => {
  const userId = req.user.id;
  const trackId = req.params.id;
  // Check if track exists
  const { rows: [track] } = await db.query("SELECT * FROM tracks WHERE id = $1", [trackId]);
  if (!track) return res.status(404).send("Track not found.");
  // Only playlists owned by the user that contain this track
  const { rows: playlists } = await db.query(
    `SELECT p.* FROM playlists p
      JOIN playlists_tracks pt ON pt.playlist_id = p.id
      WHERE pt.track_id = $1 AND p.user_id = $2`,
    [trackId, userId]
  );
  res.send(playlists);
});
