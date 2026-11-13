/**
 * Primary owner: SHAZIB BOSU
 * Study-group creation, search, membership, capacity, and ownership rules.
 */
import express from "express";
import { requireAuth } from "../auth/auth.js";
import { getAll, getOne, run } from "../database/db.js";

export const groupsRouter = express.Router();
groupsRouter.use(requireAuth);

const groupSelect = `
  SELECT g.*, u.name AS creator_name,
    (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count,
    EXISTS(SELECT 1 FROM group_members gm WHERE gm.group_id = g.id AND gm.user_id = ?) AS joined
  FROM study_groups g JOIN users u ON u.id = g.creator_id`;

function validateGroup(body) {
  const group = {
    title: String(body.title || "").trim(), courseCode: String(body.courseCode || "").trim().toUpperCase(),
    description: String(body.description || "").trim(), meetingDate: String(body.meetingDate || "").trim(),
    meetingTime: String(body.meetingTime || "").trim(), location: String(body.location || "").trim(),
    capacity: Number(body.capacity || 0)
  };
  if (!group.title || !group.courseCode || !group.description || !group.meetingDate || !group.meetingTime || !group.location) return { error: "Complete every required group field." };
  if (!Number.isInteger(group.capacity) || group.capacity < 2 || group.capacity > 100) return { error: "Capacity must be between 2 and 100." };
  return { group };
}

groupsRouter.get("/", (req, res) => {
  const search = String(req.query.search || "").trim();
  const params = [req.user.id];
  let where = "";
  if (search) { where = " WHERE g.title LIKE ? OR g.course_code LIKE ? OR g.description LIKE ?"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  const groups = getAll(`${groupSelect}${where} ORDER BY g.meeting_date, g.meeting_time`, params);
  res.json({ groups });
});

groupsRouter.get("/:id", (req, res) => {
  const group = getOne(`${groupSelect} WHERE g.id = ?`, [req.user.id, Number(req.params.id)]);
  if (!group) return res.status(404).json({ message: "Study group not found." });
  const members = getAll("SELECT u.id, u.name, u.email FROM group_members gm JOIN users u ON u.id = gm.user_id WHERE gm.group_id = ? ORDER BY u.name", [group.id]);
  res.json({ group, members });
});

groupsRouter.post("/", (req, res) => {
  const { group, error } = validateGroup(req.body); if (error) return res.status(400).json({ message: error });
  const result = run(`INSERT INTO study_groups (title, course_code, description, meeting_date, meeting_time, location, capacity, creator_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [group.title, group.courseCode, group.description, group.meetingDate, group.meetingTime, group.location, group.capacity, req.user.id]);
  run("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", [result.id, req.user.id]);
  res.status(201).json({ message: "Study group created.", id: result.id });
});

groupsRouter.put("/:id", (req, res) => {
  const existing = getOne("SELECT * FROM study_groups WHERE id = ?", [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ message: "Study group not found." });
  if (existing.creator_id !== req.user.id && req.user.role !== "admin") return res.status(403).json({ message: "Only the creator can edit this group." });
  const { group, error } = validateGroup(req.body); if (error) return res.status(400).json({ message: error });
  const memberCount = getOne("SELECT COUNT(*) AS count FROM group_members WHERE group_id = ?", [existing.id]).count;
  if (group.capacity < memberCount) return res.status(400).json({ message: `Capacity cannot be below the current ${memberCount} members.` });
  run(`UPDATE study_groups SET title=?, course_code=?, description=?, meeting_date=?, meeting_time=?, location=?, capacity=? WHERE id=?`,
    [group.title, group.courseCode, group.description, group.meetingDate, group.meetingTime, group.location, group.capacity, existing.id]);
  res.json({ message: "Study group updated." });
});

groupsRouter.delete("/:id", (req, res) => {
  const group = getOne("SELECT * FROM study_groups WHERE id = ?", [Number(req.params.id)]);
  if (!group) return res.status(404).json({ message: "Study group not found." });
  if (group.creator_id !== req.user.id && req.user.role !== "admin") return res.status(403).json({ message: "Only the creator or an administrator can delete this group." });
  run("DELETE FROM study_groups WHERE id = ?", [group.id]);
  res.json({ message: "Study group deleted." });
});

groupsRouter.post("/:id/join", (req, res) => {
  const id = Number(req.params.id);
  const group = getOne("SELECT * FROM study_groups WHERE id = ?", [id]);
  if (!group) return res.status(404).json({ message: "Study group not found." });
  if (getOne("SELECT 1 AS found FROM group_members WHERE group_id = ? AND user_id = ?", [id, req.user.id])) return res.status(409).json({ message: "You already joined this group." });
  const count = getOne("SELECT COUNT(*) AS count FROM group_members WHERE group_id = ?", [id]).count;
  if (count >= group.capacity) return res.status(409).json({ message: "This study group is full." });
  run("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", [id, req.user.id]);
  res.json({ message: "You joined the study group." });
});

groupsRouter.delete("/:id/join", (req, res) => {
  const id = Number(req.params.id);
  const group = getOne("SELECT * FROM study_groups WHERE id = ?", [id]);
  if (!group) return res.status(404).json({ message: "Study group not found." });
  if (group.creator_id === req.user.id) return res.status(400).json({ message: "The creator cannot leave their own group. Delete the group instead." });
  run("DELETE FROM group_members WHERE group_id = ? AND user_id = ?", [id, req.user.id]);
  res.json({ message: "You left the study group." });
});
