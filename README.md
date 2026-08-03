# Task API

A containerized CRUD API built with Node.js, Express, and PostgreSQL for managing tasks.

This project started with in-memory storage, was upgraded to SQLite, and now uses a real PostgreSQL database running inside Docker. The complete API and database stack can be started with a single Docker Compose command.

## Features

- Get all tasks
- Get task by ID
- Create a new task
- Update a task
- Delete a task
- PostgreSQL database
- Dockerized API and database
- One-command startup using Docker Compose
- Persistent database storage using Docker volumes
- Automatic table creation
- Automatic seeding of 3 example tasks
- Input validation
- Parameterized SQL queries
- Environment-based database configuration
- Database health check
- Swagger UI documentation

---

## Architecture

The application consists of two Docker services:

- `api` - Node.js and Express REST API
- `db` - PostgreSQL 17 database

Docker Compose runs both services together.

Inside the Docker Compose network, the API connects to PostgreSQL using the database service name `db`.

Database data is stored in a Docker volume so tasks survive container and full-stack restarts.

---

## Prerequisites

Install:

- Docker Desktop
- Git

PostgreSQL does not need to be installed separately because it runs inside a Docker container.

---

## Environment Variables

The application uses the `DATABASE_URL` environment variable to connect to PostgreSQL.

An example configuration is provided in:

```text
.env.example
```

For local development, copy it to `.env`:

```bash
cp .env.example .env
```

Example:

```env
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
```

The real `.env` file is excluded from Git using `.gitignore`.

---

## Run the Complete Stack

Start the API and PostgreSQL database with:

```bash
docker compose up
```

Or run in detached mode:

```bash
docker compose up -d
```

Docker Compose automatically:

1. Starts PostgreSQL
2. Waits for the database health check
3. Builds and starts the Node.js API
4. Creates the `tasks` table if it does not exist
5. Seeds three example tasks only when the table is empty

The API is available at:

```text
http://localhost:3000
```

Swagger UI:

```text
http://localhost:3000/docs
```

Stop the stack with:

```bash
docker compose down
```

---

## Database Schema

PostgreSQL contains a `tasks` table:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key, automatically generated |
| title | TEXT | Task title |
| done | BOOLEAN | Task completion status |

The table is automatically created when the application starts.

Three example tasks are seeded only when the table is empty.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | API and database health check |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get task by ID |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

### Status Codes

- `200 OK` - Successful GET or PUT
- `201 Created` - Task successfully created
- `204 No Content` - Task successfully deleted
- `400 Bad Request` - Invalid request body
- `404 Not Found` - Task or route not found
- `500 Internal Server Error` - Unexpected server/database error

---

## Example Request

Create a new task:

```bash
curl -i -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d "{\"title\":\"Learn Docker\"}"
```

Example response:

```json
{
  "id": 4,
  "title": "Learn Docker",
  "done": false
}
```

---

## PostgreSQL Queries

All CRUD operations use PostgreSQL parameterized queries.

Get all tasks:

```sql
SELECT * FROM tasks ORDER BY id;
```

Get a task by ID:

```sql
SELECT * FROM tasks WHERE id = $1;
```

Create a task:

```sql
INSERT INTO tasks (title, done)
VALUES ($1, $2)
RETURNING *;
```

Update a task:

```sql
UPDATE tasks
SET title = $1, done = $2
WHERE id = $3
RETURNING *;
```

Delete a task:

```sql
DELETE FROM tasks
WHERE id = $1;
```

Parameterized queries keep user input separate from SQL and help protect the application from SQL injection.

---

## Docker Volume and Persistence

PostgreSQL data is stored in the named Docker volume:

```text
taskdata
```

Persistence was tested by:

1. Creating a new task
2. Running `docker compose down`
3. Starting the stack again with `docker compose up`
4. Requesting `GET /tasks`

The previously created task remained in PostgreSQL after the complete stack restart.

This demonstrates that the database volume persists independently of the containers.

---

## Health Check

The API provides:

```text
GET /health
```

The endpoint also executes:

```sql
SELECT 1;
```

to confirm that PostgreSQL is reachable.

Docker Compose also uses `pg_isready` to check database readiness before starting the API.

---

## Database Screenshot

The PostgreSQL `tasks` table can be inspected with:

```bash
docker compose exec db psql -U postgres -d tasks
```

Then:

```sql
\dt
SELECT * FROM tasks;
```

Database screenshot:

![PostgreSQL Database](./postgres-database.png)

---

## Swagger UI

Interactive API documentation is available at:

```text
http://localhost:3000/docs
```

![Swagger UI](./swagger.png)

---

## Technologies Used

- Node.js
- Express.js
- PostgreSQL 17
- node-postgres (`pg`)
- Docker
- Docker Compose
- Docker Volumes
- dotenv
- Swagger UI Express
- OpenAPI 3.0

---

## Storage Migration

This API has now used three different storage approaches:

| Version | Storage |
|---------|---------|
| A1 | In-memory JavaScript array |
| A2 | SQLite database |
| A3 | PostgreSQL in Docker |

The API endpoints and their behavior remain the same across the storage migrations.

Only the storage implementation changed, demonstrating that storage is an implementation detail behind the API.

---

## Project Structure

```text
FirstCRUDAPI/
├── Dockerfile
├── compose.yaml
├── server.js
├── openapi.json
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── README.md
├── postgres-database.png
└── swagger.png
```