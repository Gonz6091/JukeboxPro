
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "devsecret";

/** Creates a token with the given payload */
export function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

/** Extracts the payload from a token */
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
