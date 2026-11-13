/**
 * Primary owner: SHAZIB BOSU
 * Relational database initialization, queries, persistence, and sample data.
 */
import fs from "node:fs";
import path from "node:path";
import initSqlJs from "sql.js";
import bcrypt from "bcryptjs";
import { config } from "../config.js";

let database;

function ensureParentDirectory() {
  fs.mkdirSync(path.dirname(config.databaseFile), { recursive: true });
}

export async function initializeDatabase({ reset = false } = {}) {
  if (database && !reset) return database;
  const SQL = await initSqlJs();
  ensureParentDirectory();

  if (!reset && fs.existsSync(config.databaseFile)) {
    database = new SQL.Database(fs.readFileSync(config.databaseFile));
  } else {
    database = new SQL.Database();
  }

  database.run("PRAGMA foreign_keys = ON;");
  createSchema();
  await seedIfEmpty();
  persistDatabase();
  return database;
}

function createSchema() {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'admin')),
      bio TEXT DEFAULT '',
      major TEXT DEFAULT 'Computer Science',
      interests TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS study_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      course_code TEXT NOT NULL,
      description TEXT NOT NULL,
      meeting_date TEXT NOT NULL,
      meeting_time TEXT NOT NULL,
      location TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 6 CHECK(capacity > 1),
      creator_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_members (
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_time TEXT NOT NULL,
      location TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 50 CHECK(capacity > 0),
      creator_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS event_rsvps (
      event_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (event_id, user_id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

async function seedIfEmpty() {
  const count = getOne("SELECT COUNT(*) AS count FROM users")?.count || 0;
  if (count > 0) return;

  const studentPassword = await bcrypt.hash("Student123!", 10);
  const adminPassword = await bcrypt.hash("Admin123!", 10);

  run(
    "INSERT INTO users (name, email, password_hash, role, bio, interests) VALUES (?, ?, ?, ?, ?, ?)",
    ["Demo Student", "student@campusconnect.edu", studentPassword, "student", "CSC student interested in collaborative learning.", "Databases, Web Development, AI"]
  );
  run(
    "INSERT INTO users (name, email, password_hash, role, bio, interests) VALUES (?, ?, ?, ?, ?, ?)",
    ["Campus Administrator", "admin@campusconnect.edu", adminPassword, "admin", "CampusConnect administrator.", "Student Success"]
  );

  const student = getOne("SELECT id FROM users WHERE email = ?", ["student@campusconnect.edu"]);
  const upcoming = new Date();
  upcoming.setDate(upcoming.getDate() + 7);
  const nextWeek = upcoming.toISOString().slice(0, 10);

  run(`INSERT INTO study_groups
      (title, course_code, description, meeting_date, meeting_time, location, capacity, creator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ["Web Technology Project Team", "CSC 5750", "Review React, Express, and deployment tasks.", nextWeek, "15:00", "Undergraduate Library", 6, student.id]);
  run(`INSERT INTO study_groups
      (title, course_code, description, meeting_date, meeting_time, location, capacity, creator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ["Algorithms Study Session", "CSC 6580", "Practice dynamic programming and greedy algorithms.", nextWeek, "17:30", "State Hall 204", 8, student.id]);
  run("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", [1, student.id]);
  run(`INSERT INTO events
      (title, description, event_date, event_time, location, capacity, creator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ["Computer Science Research Mixer", "Meet students and faculty working across computer science research areas.", nextWeek, "18:00", "Student Center Ballroom", 80, student.id]);
  run(`INSERT INTO events
      (title, description, event_date, event_time, location, capacity, creator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ["Graduate Coding Night", "A relaxed evening for collaborative programming and project support.", nextWeek, "19:00", "Engineering Building Lab", 40, student.id]);
  run("INSERT INTO event_rsvps (event_id, user_id) VALUES (?, ?)", [1, student.id]);
}

export function persistDatabase() {
  if (!database) return;
  ensureParentDirectory();
  fs.writeFileSync(config.databaseFile, Buffer.from(database.export()));
}

export function run(sql, params = []) {
  database.run(sql, params);
  const result = getOne("SELECT last_insert_rowid() AS id");
  persistDatabase();
  return { id: result?.id, changes: database.getRowsModified() };
}

export function getOne(sql, params = []) {
  const statement = database.prepare(sql);
  statement.bind(params);
  const row = statement.step() ? statement.getAsObject() : null;
  statement.free();
  return row;
}

export function getAll(sql, params = []) {
  const statement = database.prepare(sql);
  statement.bind(params);
  const rows = [];
  while (statement.step()) rows.push(statement.getAsObject());
  statement.free();
  return rows;
}

export function closeDatabase() {
  if (database) {
    persistDatabase();
    database.close();
    database = undefined;
  }
}
