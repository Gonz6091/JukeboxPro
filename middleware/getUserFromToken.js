import { getUserById } from "#db/queries/users";
import { verifyToken } from "#utils/jwt";


/** Attaches the user to the request if a valid token is provided */
export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) return next();

  const token = authorization.split(" ")[1];
  try {
    const { id } = verifyToken(token);
    const user = await getUserById(id);
    if (user) req.user = user;
  } catch {
    // Do not attach user if token is invalid
  }
  next();
}
