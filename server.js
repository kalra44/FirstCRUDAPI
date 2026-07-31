const express = require("express");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");

const swaggerDocument = JSON.parse(
  fs.readFileSync("./openapi.json", "utf8")
);

const app = express();
const PORT = 3000;

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