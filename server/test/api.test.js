/** Primary owner: TAJWAR KHAN - automated API testing. */
import test, { before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.DATABASE_FILE = path.resolve("./data/test-campusconnect.sqlite");
if (fs.existsSync(process.env.DATABASE_FILE)) fs.unlinkSync(process.env.DATABASE_FILE);

const { createApp } = await import("../src/app.js");
let app; let token;

before(async () => {
  app = await createApp({ resetDatabase: true });
  const login = await request(app).post("/api/auth/login").send({ email: "student@campusconnect.edu", password: "Student123!" });
  token = login.body.token;
});

test("health endpoint responds", async () => {
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200); assert.equal(response.body.status, "ok");
});

test("student can log in and list groups", async () => {
  assert.ok(token);
  const response = await request(app).get("/api/groups").set("Authorization", `Bearer ${token}`);
  assert.equal(response.status, 200); assert.ok(response.body.groups.length >= 2);
});

test("student can create a group", async () => {
  const response = await request(app).post("/api/groups").set("Authorization", `Bearer ${token}`).send({
    title: "Database Review", courseCode: "CSC 6710", description: "Review relational database concepts.",
    meetingDate: "2026-12-01", meetingTime: "14:00", location: "Purdy Library", capacity: 5
  });
  assert.equal(response.status, 201); assert.ok(response.body.id);
});

test("student can create and RSVP to an event", async () => {
  const created = await request(app).post("/api/events").set("Authorization", `Bearer ${token}`).send({
    title: "Project Showcase", description: "Student web project demonstrations.", eventDate: "2026-12-05",
    eventTime: "16:00", location: "Student Center", capacity: 30
  });
  assert.equal(created.status, 201);
  const rsvp = await request(app).post(`/api/events/${created.body.id}/rsvp`).set("Authorization", `Bearer ${token}`);
  assert.equal(rsvp.status, 200);
});
