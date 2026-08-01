const express = require("express");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const Database = require("better-sqlite3");

const swaggerDocument = JSON.parse(
  fs.readFileSync("./openapi.json", "utf8")
);

const app = express();
const PORT = 3000;

// ==============================
// SQLite Database
// ==============================

const db = new Database("tasks.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`).run();

// Seed only if database is empty
const row = db
  .prepare("SELECT COUNT(*) AS count FROM tasks")
  .get();

if (row.count === 0) {
  const insertTask = db.prepare(
    "INSERT INTO tasks (title, done) VALUES (?, ?)"
  );

  insertTask.run("Learn Express", 0);
  insertTask.run("Build CRUD API", 0);
  insertTask.run("Push to GitHub", 1);

  console.log("🌱 Database seeded with 3 tasks");
}

console.log("💾 SQLite database connected");

// ==============================
// Middleware
// ==============================

app.use(express.json());

// ==============================
// Swagger UI
// ==============================

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// ==============================
// Root Endpoint
// ==============================

app.get("/", (req, res) => {
  res.status(200).json({
    name: "Task API",
    version: "2.0",
    storage: "SQLite",
    endpoints: [
      "GET /",
      "GET /health",
      "GET /tasks",
      "GET /tasks/:id",
      "POST /tasks",
      "PUT /tasks/:id",
      "DELETE /tasks/:id",
    ],
  });
});

// ==============================
// Health Endpoint
// ==============================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// ==============================
// GET All Tasks
// ==============================

app.get("/tasks", (req, res) => {
  const tasks = db
    .prepare("SELECT * FROM tasks")
    .all();

  const formattedTasks = tasks.map((task) => ({
    ...task,
    done: Boolean(task.done),
  }));

  res.status(200).json(formattedTasks);
});

// ==============================
// GET Task By ID
// ==============================

app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(id);

  if (!task) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  task.done = Boolean(task.done);

  res.status(200).json(task);
});

// ==============================
// POST Create Task
// ==============================

app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (
    !title ||
    typeof title !== "string" ||
    title.trim() === ""
  ) {
    return res.status(400).json({
      error: "Title is required and must be a non-empty string",
    });
  }

  const result = db
    .prepare(
      "INSERT INTO tasks (title, done) VALUES (?, ?)"
    )
    .run(title.trim(), 0);

  const newTask = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid);

  newTask.done = Boolean(newTask.done);

  res.status(201).json(newTask);
});

// ==============================
// PUT Update Task
// ==============================

app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const existingTask = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(id);

  if (!existingTask) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  const { title, done } = req.body;

  if (
    title === undefined ||
    typeof title !== "string" ||
    title.trim() === ""
  ) {
    return res.status(400).json({
      error: "Title is required and must be a non-empty string",
    });
  }

  if (typeof done !== "boolean") {
    return res.status(400).json({
      error: "Done must be true or false",
    });
  }

  db.prepare(`
    UPDATE tasks
    SET title = ?, done = ?
    WHERE id = ?
  `).run(title.trim(), done ? 1 : 0, id);

  const updatedTask = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(id);

  updatedTask.done = Boolean(updatedTask.done);

  res.status(200).json(updatedTask);
});

// ==============================
// DELETE Task
// ==============================

app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const result = db
    .prepare("DELETE FROM tasks WHERE id = ?")
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  res.status(204).send();
});

// ==============================
// 404 Handler
// ==============================

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// ==============================
// Global Error Handler
// ==============================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ==============================
// Start Server
// ==============================

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});