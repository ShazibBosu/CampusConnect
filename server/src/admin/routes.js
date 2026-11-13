/**
 * Primary owner: IHTESHAM ELAHI
 * Administrator dashboards, statistics, moderation, and account controls.
 */
import express from "express";
import { requireAdmin, requireAuth } from "../auth/auth.js";
import { getAll, getOne, run } from "../database/db.js";

export const adminRouter = express.Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/summary", (req, res) => {
  const users = getOne("SELECT COUNT(*) AS count FROM users").count;
  const groups = getOne("SELECT COUNT(*) AS count FROM study_groups").count;
  const events = getOne("SELECT COUNT(*) AS count FROM events").count;
  const memberships = getOne("SELECT COUNT(*) AS count FROM group_members").count;
  const rsvps = getOne("SELECT COUNT(*) AS count FROM event_rsvps").count;
  res.json({ summary: { users, groups, events, memberships, rsvps } });
});

adminRouter.get("/users", (req, res) => {
  res.json({ users: getAll("SELECT id, name, email, role, major, created_at FROM users ORDER BY created_at DESC") });
});

adminRouter.patch("/users/:id/role", (req, res) => {
  const id = Number(req.params.id); const role = String(req.body.role || "");
  if (!["student", "admin"].includes(role)) return res.status(400).json({ message: "Role must be student or admin." });
  if (id === req.user.id && role !== "admin") return res.status(400).json({ message: "You cannot remove your own administrator role." });
  if (!getOne("SELECT id FROM users WHERE id = ?", [id])) return res.status(404).json({ message: "User not found." });
  run("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  res.json({ message: "User role updated." });
});

adminRouter.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ message: "You cannot delete your own account." });
  run("DELETE FROM users WHERE id = ?", [id]);
  res.json({ message: "User removed." });
});
