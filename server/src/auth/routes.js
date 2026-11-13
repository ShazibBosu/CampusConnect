/** Primary owner: NIHAL AHMED */
import express from "express";
import bcrypt from "bcryptjs";
import { createToken, requireAuth } from "./auth.js";
import { getOne, run } from "../database/db.js";

export const authRouter = express.Router();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

authRouter.post("/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (name.length < 2) return res.status(400).json({ message: "Name must contain at least 2 characters." });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
  if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters." });
  if (getOne("SELECT id FROM users WHERE email = ?", [email])) return res.status(409).json({ message: "An account with this email already exists." });

  const passwordHash = await bcrypt.hash(password, 10);
  const result = run("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [name, email, passwordHash]);
  const user = getOne("SELECT id, name, email, role FROM users WHERE id = ?", [result.id]);
  res.status(201).json({ user: publicUser(user), token: createToken(user) });
});

authRouter.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = getOne("SELECT * FROM users WHERE email = ?", [email]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }
  res.json({ user: publicUser(user), token: createToken(user) });
});

authRouter.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));
