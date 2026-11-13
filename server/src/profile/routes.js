/** Primary owner: NIHAL AHMED, with interface integration by AHSAS ZAIDI. */
import express from "express";
import { requireAuth } from "../auth/auth.js";
import { getOne, run } from "../database/db.js";

export const profileRouter = express.Router();
profileRouter.use(requireAuth);

profileRouter.get("/", (req, res) => {
  const profile = getOne("SELECT id, name, email, role, bio, major, interests, created_at FROM users WHERE id = ?", [req.user.id]);
  res.json({ profile });
});

profileRouter.put("/", (req, res) => {
  const name = String(req.body.name || "").trim();
  const major = String(req.body.major || "").trim();
  const bio = String(req.body.bio || "").trim();
  const interests = String(req.body.interests || "").trim();
  if (name.length < 2) return res.status(400).json({ message: "Name must contain at least 2 characters." });
  run("UPDATE users SET name = ?, major = ?, bio = ?, interests = ? WHERE id = ?", [name, major, bio, interests, req.user.id]);
  const profile = getOne("SELECT id, name, email, role, bio, major, interests, created_at FROM users WHERE id = ?", [req.user.id]);
  res.json({ message: "Profile updated.", profile });
});
