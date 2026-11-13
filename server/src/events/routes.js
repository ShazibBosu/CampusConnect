/**
 * Primary owner: IHTESHAM ELAHI
 * Campus-event management, RSVP workflows, and capacity rules.
 */
import express from "express";
import { requireAuth } from "../auth/auth.js";
import { getAll, getOne, run } from "../database/db.js";

export const eventsRouter = express.Router();
eventsRouter.use(requireAuth);

const eventSelect = `SELECT e.*, u.name AS creator_name,
  (SELECT COUNT(*) FROM event_rsvps r WHERE r.event_id = e.id) AS rsvp_count,
  EXISTS(SELECT 1 FROM event_rsvps r WHERE r.event_id = e.id AND r.user_id = ?) AS attending
  FROM events e JOIN users u ON u.id = e.creator_id`;

function validateEvent(body) {
  const event = { title: String(body.title || "").trim(), description: String(body.description || "").trim(),
    eventDate: String(body.eventDate || "").trim(), eventTime: String(body.eventTime || "").trim(),
    location: String(body.location || "").trim(), capacity: Number(body.capacity || 0) };
  if (!event.title || !event.description || !event.eventDate || !event.eventTime || !event.location) return { error: "Complete every required event field." };
  if (!Number.isInteger(event.capacity) || event.capacity < 1 || event.capacity > 1000) return { error: "Capacity must be between 1 and 1000." };
  return { event };
}

eventsRouter.get("/", (req, res) => res.json({ events: getAll(`${eventSelect} ORDER BY e.event_date, e.event_time`, [req.user.id]) }));

eventsRouter.get("/:id", (req, res) => {
  const event = getOne(`${eventSelect} WHERE e.id = ?`, [req.user.id, Number(req.params.id)]);
  if (!event) return res.status(404).json({ message: "Event not found." });
  res.json({ event });
});

eventsRouter.post("/", (req, res) => {
  const { event, error } = validateEvent(req.body); if (error) return res.status(400).json({ message: error });
  const result = run(`INSERT INTO events (title, description, event_date, event_time, location, capacity, creator_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`, [event.title, event.description, event.eventDate, event.eventTime, event.location, event.capacity, req.user.id]);
  res.status(201).json({ message: "Event created.", id: result.id });
});

eventsRouter.put("/:id", (req, res) => {
  const existing = getOne("SELECT * FROM events WHERE id = ?", [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ message: "Event not found." });
  if (existing.creator_id !== req.user.id && req.user.role !== "admin") return res.status(403).json({ message: "Only the creator can edit this event." });
  const { event, error } = validateEvent(req.body); if (error) return res.status(400).json({ message: error });
  const count = getOne("SELECT COUNT(*) AS count FROM event_rsvps WHERE event_id = ?", [existing.id]).count;
  if (event.capacity < count) return res.status(400).json({ message: `Capacity cannot be below the current ${count} RSVPs.` });
  run("UPDATE events SET title=?, description=?, event_date=?, event_time=?, location=?, capacity=? WHERE id=?",
    [event.title, event.description, event.eventDate, event.eventTime, event.location, event.capacity, existing.id]);
  res.json({ message: "Event updated." });
});

eventsRouter.delete("/:id", (req, res) => {
  const event = getOne("SELECT * FROM events WHERE id = ?", [Number(req.params.id)]);
  if (!event) return res.status(404).json({ message: "Event not found." });
  if (event.creator_id !== req.user.id && req.user.role !== "admin") return res.status(403).json({ message: "Only the creator or an administrator can delete this event." });
  run("DELETE FROM events WHERE id = ?", [event.id]);
  res.json({ message: "Event deleted." });
});

eventsRouter.post("/:id/rsvp", (req, res) => {
  const id = Number(req.params.id);
  const event = getOne("SELECT * FROM events WHERE id = ?", [id]);
  if (!event) return res.status(404).json({ message: "Event not found." });
  if (getOne("SELECT 1 AS found FROM event_rsvps WHERE event_id = ? AND user_id = ?", [id, req.user.id])) return res.status(409).json({ message: "You already RSVP'd to this event." });
  const count = getOne("SELECT COUNT(*) AS count FROM event_rsvps WHERE event_id = ?", [id]).count;
  if (count >= event.capacity) return res.status(409).json({ message: "This event has reached capacity." });
  run("INSERT INTO event_rsvps (event_id, user_id) VALUES (?, ?)", [id, req.user.id]);
  res.json({ message: "RSVP confirmed." });
});

eventsRouter.delete("/:id/rsvp", (req, res) => {
  run("DELETE FROM event_rsvps WHERE event_id = ? AND user_id = ?", [Number(req.params.id), req.user.id]);
  res.json({ message: "RSVP cancelled." });
});
