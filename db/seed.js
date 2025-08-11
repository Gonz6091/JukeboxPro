
import db from "#db/client";
import bcrypt from "bcrypt";

import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  // Create users
  const password1 = await bcrypt.hash("password1", 10);
  const password2 = await bcrypt.hash("password2", 10);
  const {
    rows: [user1],
  } = await db.query(
    `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
    ["alice", password1]
  );
  const {
    rows: [user2],
  } = await db.query(
    `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
    ["bob", password2]
  );

  // Create tracks
  const trackIds = [];
  for (let i = 1; i <= 10; i++) {
    const track = await createTrack(`Track ${i}`, i * 50000);
    trackIds.push(track.id);
  }

  // Each user gets a playlist with 5 tracks
  const playlist1 = await createPlaylist("Alice's Playlist", "Alice's favorite tracks", user1.id);
  const playlist2 = await createPlaylist("Bob's Playlist", "Bob's favorite tracks", user2.id);

  for (let i = 0; i < 5; i++) {
    await createPlaylistTrack(playlist1.id, trackIds[i]);
    await createPlaylistTrack(playlist2.id, trackIds[i + 5]);
  }
}
