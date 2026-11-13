/**
 * Primary owner: NIHAL AHMED
 * Password verification, JWT creation, and authentication middleware.
 */
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { getOne } from "../database/db.js";

export function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, config.jwtSecret, { expiresIn: "8h" });
}

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required." });

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = getOne("SELECT id, name, email, role FROM users WHERE id = ?", [payload.id]);
    if (!user) return res.status(401).json({ message: "Account no longer exists." });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Your session is invalid or expired." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Administrator access required." });
  next();
}
