import db from "#db/client";

export async function getUserById(id) {
  const { rows: [user] } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return user;
}
