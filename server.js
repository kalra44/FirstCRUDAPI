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

// Create tasks table if it does not exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`).run();

// Check whether the table is empty
const row = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

// Seed exactly 3 tasks only on first run
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

app.use(express.json());
// ==============================
// Swagger UI
// ==============================

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ==============================
// In-Memory Database
// ==============================

let tasks = [
  {
    id: 1,
    title: "Learn Express",
    done: false,
  },
  {
    id: 2,
    title: "Build CRUD API",
    done: false,
  },
  {
    id: 3,
    title: "Push to GitHub",
    done: true,
  },
];

// ==============================
// Root Endpoint
// GET /
// ==============================

app.get("/", (req, res) => {
  res.status(200).json({
    name: "Task API",
    version: "1.0",
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
// GET /health
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
  res.status(200).json(tasks);
});

// ==============================
// GET Task By ID
// ==============================

app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }

  res.status(200).json(task);
});

// ==============================
// POST Create Task
// ==============================

app.post("/tasks", (req, res) => {
  const { title, done } = req.body;

  // Title validation
  if (
    !title ||
    typeof title !== "string" ||
    title.trim() === ""
  ) {
    return res.status(400).json({
      error: "Title is required and must be a non-empty string",
    });
  }

  // Done validation (optional)
  if (done !== undefined && typeof done !== "boolean") {
    return res.status(400).json({
      error: "Done must be true or false",
    });
  }

  const newTask = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    title: title.trim(),
    done: done ?? false,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});
// ==============================
// PUT Update Task
// ==============================

app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }

  const { title, done } = req.body;

 if (title !== undefined) {
  if (
    typeof title !== "string" ||
    title.trim() === ""
  ) {
    return res.status(400).json({
      error: "Title must be a non-empty string",
    });
  }

  task.title = title.trim();
}

  if (done !== undefined) {
    if (typeof done !== "boolean") {
      return res.status(400).json({
        error: "Done must be true or false",
      });
    }

    task.done = done;
  }

  res.status(200).json(task);
});

// ==============================
// PATCH Update Task
// ==============================

app.patch("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }

  const { title, done } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        error: "Title must be a non-empty string",
      });
    }

    task.title = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== "boolean") {
      return res.status(400).json({
        error: "Done must be true or false",
      });
    }

    task.done = done;
  }

  res.status(200).json(task);
});

// ==============================
// DELETE Task
// ==============================

app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }

  tasks.splice(index, 1);

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