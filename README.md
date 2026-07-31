# Task API

A simple CRUD API built with Node.js and Express for managing tasks.

## Features

- Get all tasks
- Get task by ID
- Create a new task
- Update a task
- Delete a task
- Input validation
- Swagger UI documentation

---

## Installation

```bash
npm install
```

## Run the project

```bash
node server.js
```

Server runs at:

```
http://localhost:3000
```

Swagger UI:

```
http://localhost:3000/docs
```

---

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | / | API Info |
| GET | /health | Health Check |
| GET | /tasks | Get All Tasks |
| GET | /tasks/:id | Get Task by ID |
| POST | /tasks | Create Task |
| PUT | /tasks/:id | Update Task |
| DELETE | /tasks/:id | Delete Task |

---

## Example Request

```bash
curl -i -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d "{\"title\":\"Buy Milk\"}"
```

Example Response

```json
HTTP/1.1 201 Created

{
  "id": 4,
  "title": "Buy Milk",
  "done": false
}
```

---

## Technologies Used

- Node.js
- Express.js
- Swagger UI Express
- OpenAPI 3.0

---

## Swagger UI

![Swagger UI](swagger.png)