# The Feed

<img src="./frontend/public/logo-feed.png" alt="The Feed logo" width="480">

The Feed is a personalized news aggregator designed to give users more control over what they read. Instead of an algorithmic social media feed, users choose topics and attach **pointers** to external sources. The Feed collects stories and organizes them into a focused, personalized experience.

> This repository contains the complete application: the Next.js frontend, FastAPI backend, and local MongoDB infrastructure.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Repository layout](#repository-layout)
- [Quick start with Docker](#quick-start-with-docker)
- [Local development](#local-development)
- [Configuration](#configuration)
- [How it works](#how-it-works)
- [Authentication](#authentication)
- [Architecture](#architecture)
- [API overview](#api-overview)
- [Testing and quality checks](#testing-and-quality-checks)
- [Deployment notes](#deployment-notes)
- [Design goals](#design-goals)

## Features

- User registration and JWT-based login with Argon2 password hashing
- User-defined topics and RSS/Atom feed pointers
- Google News, Reddit, and standard RSS feed support
- Shared pointers and normalized-URL deduplication
- Background story refreshes with APScheduler
- Stories stored in MongoDB and retrieved through FastAPI
- Next.js interface for account management, topic organization, and reading stories
- Docker Compose environment for frontend, backend, and MongoDB
- Automated backend checks and tests

## Technology

| Layer           | Technologies                                            |
| --------------- | ------------------------------------------------------- |
| Frontend        | Next.js, TypeScript, pnpm                               |
| Backend         | Python 3.12+, FastAPI, Pydantic, PyMongo, Poetry        |
| Authentication  | JWT, Argon2                                             |
| Feed processing | Feedparser, APScheduler                                 |
| Database        | MongoDB (single-node replica set for local development) |
| Quality         | pytest, Ruff; frontend package scripts                  |
| Infrastructure  | Docker, Docker Compose; GitHub Actions (see CI notes)   |

## Repository layout

```text
the-feed/
├── backend/
│   ├── src/                  # FastAPI application
│   ├── docker/               # Backend Dockerfile
│   ├── pyproject.toml        # Poetry dependencies
│   ├── poetry.lock
│   ├── .env.example
│   └── pytest.ini
├── frontend/
│   ├── app/                  # Next.js App Router (if at project root)
│   ├── public/
│   ├── docker/               # Frontend Dockerfile
│   ├── package.json
│   └── pnpm-lock.yaml
├── mongo/
│   └── init-replica.js       # Local replica-set initialization
├── docker-compose.yml
├── .gitignore
└── README.md
```

The frontend and backend have **separate dependency managers**. Poetry runs in `backend/`; pnpm runs in `frontend/`. Neither needs a shared root-level package manager.

## Quick start with Docker

**Requirements:** Docker Engine with the Compose plugin, or Docker Desktop.

1. Clone the repository and enter its root directory:

   ```bash
   git clone <repository-url>
   cd the-feed
   ```

2. Create your local configuration files. Use existing example files where provided, and check the variable names expected by your code:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Set the backend's `MONGO_URI`, `APP_ENV`, and `JWT_SECRET`. If the frontend uses `frontend/.env`, create it with its expected variables (see [Configuration](#configuration)).

3. Validate the Compose file, then build and start the services:

   ```bash
   docker compose config --quiet
   docker compose up -d --build
   ```

4. Check startup status and logs:

   ```bash
   docker compose ps
   docker compose logs --tail=100 mongo-init
   docker compose logs --tail=100 feed-backend
   docker compose logs --tail=100 feed-frontend
   ```

5. Open the frontend at **http://localhost:3004** and the API docs at **http://localhost:4001/docs**, assuming the Compose port mappings remain as configured.

The `mongo-init` container is intended to run once and exit successfully. It initializes the local `rs0` replica set, which is required for MongoDB transactions. A successful exit does not by itself guarantee the primary election is complete; applications should tolerate initial database startup delays.

Stop the application with `docker compose down`. **Avoid `docker compose down -v` unless you intentionally want to delete the local MongoDB volume and its data.**

## Local development

You can also run the applications without building their Docker images. MongoDB still needs to be available and configured for transactions.

### Backend (Poetry)

```bash
cd backend
poetry install
poetry run uvicorn src.main:app --reload
```

By default, Uvicorn uses port `8000` when no `--port` is provided; the Docker setup uses its configured container port instead.

### Frontend (pnpm)

In a second terminal:

```bash
cd frontend
pnpm install
pnpm run dev
```

Next.js typically starts at **http://localhost:3000** in local development.

### Docker networking vs. local networking

When **Next.js server-side code runs in Docker**, it should contact FastAPI by the Compose service name, for example `http://feed-backend:4001` if the backend listens on port 4001 in the container. `127.0.0.1` inside the frontend container points back to the frontend container, **not** FastAPI.

When a request originates in the **browser**, Docker service names such as `feed-backend` are not resolvable. Use a browser-reachable endpoint or a Next.js server-side proxy. When both apps run directly on the laptop, use the laptop-accessible backend URL and port.

## Configuration

Keep credentials out of Git. Commit `.env.example` templates, not real `.env` files.

### Backend (`backend/.env`)

```dotenv
MONGO_URI=mongodb://mongo:27017/?replicaSet=rs0
APP_ENV=development
JWT_SECRET=replace-with-a-strong-random-secret
```

The `mongo` hostname is for the backend running **inside Docker Compose**. A backend process running directly on your laptop needs a connection URI that resolves from the laptop, and the replica set must advertise an address reachable by that process.

### Frontend (`frontend/.env` or `.env.local`)

Set the variables actually referenced by your Next.js code. For example, if the server-side code reads `BACKEND_URL`, a containerized setup might use:

```dotenv
BACKEND_URL=http://feed-backend:4001
```

Do not place JWT signing secrets or MongoDB credentials in the frontend. Variables starting with `NEXT_PUBLIC_` are exposed to browser-side JavaScript; avoid putting secrets in them.

Compose's `env_file` injects variables into a container. A Compose entry such as `BACKEND_URL: ${BACKEND_URL}` is resolved separately from the shell or Compose environment and may override `env_file` values. Use one intentional source of truth for each variable.

---

## How It Works

The basic structure of The Feed is:

```text
User
  ↓
Topic
  ↓
Pointers
  ↓
Stories
```

A user creates a topic based on something they want to follow.

For example:

```text
Star Wars
DC Universe
Artificial Intelligence
Python
```

Each topic contains references to one or more **pointers**.

A pointer represents an external RSS or Atom feed:

```text
Topic: Star Wars

├── Google News: Star Wars
├── Reddit: r/StarWars
├── Reddit: r/StarWarsLeaks
└── RSS: StarWars.com
```

The backend periodically fetches those feeds and stores their latest stories.

When the frontend requests stories for a topic, the API reads the already-stored stories from MongoDB rather than waiting for external feeds to respond.

```text
External Feed
     ↓
   Pointer
     ↓
Background Refresh
     ↓
   MongoDB
     ↓
   FastAPI
     ↓
  Frontend
```

This separates **collecting stories** from **reading stories**, keeping normal feed requests fast and reducing unnecessary traffic to external providers.

---

# Authentication

The Feed uses username/password authentication with JWT bearer tokens.

Passwords are never stored directly.

During account creation:

```text
Password
   ↓
Argon2 Hash
   ↓
MongoDB
```

During login:

```text
Username + Password
        ↓
Verify Password Hash
        ↓
Create JWT Access Token
        ↓
Return Bearer Token
```

The login endpoint returns:

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user_id": "..."
}
```

Access tokens currently expire after **60 minutes**.

Protected requests use the standard HTTP authorization header:

```http
Authorization: Bearer <access_token>
```

For user-specific routes, the backend verifies that the user ID contained in the token matches the user ID requested in the URL.

Conceptually:

```text
Request
   ↓
Bearer Token
   ↓
Validate JWT
   ↓
Extract User ID
   ↓
Compare Against Requested User
   ↓
Protected Resource
```

An authenticated user cannot access another user's protected resources simply by changing the user ID in the request URL.

JWT signing uses the server-side `JWT_SECRET` environment variable.

---

# Architecture

The core data model consists of four resources:

```text
User
 └── Topic
      └── Pointer IDs
              ↓
           Pointer
              ↓
           Stories
```

The separation between user organization and external feed data is intentional.

Topics belong to users.

Pointers represent shared external resources.

Stories belong to pointers.

This allows multiple users to follow the same source without The Feed repeatedly fetching identical external data.

---

## Users

A user represents an account within The Feed.

Users contain authentication information along with their application identity.

Passwords are stored as Argon2 hashes rather than plaintext.

User-specific API routes require a valid JWT belonging to that user.

---

## Topics

A **topic** is a user-defined collection of feeds.

Topics belong to individual users and allow each user to organize their feed however they want.

Example:

```json
{
  "_id": "...",
  "userId": "...",
  "topic": "Star Wars",
  "pointers": ["...", "..."]
}
```

Topics do not directly own stories.

Instead, they contain references to pointers, and stories belong to those pointers.

This keeps user organization separate from the underlying feed data.

---

## Pointers

A **pointer** represents a unique external feed.

Examples:

```text
https://www.reddit.com/r/StarWars.rss

https://www.reddit.com/r/MarvelStudiosSpoilers.rss
```

Pointers are shared resources.

If multiple users or topics follow the same external feed, they reference the same pointer instead of creating duplicate copies.

```text
User A Topic ──┐
               ├── Pointer ── Stories
User B Topic ──┘
```

This allows The Feed to follow a simple principle:

> **Fetch once, reuse many times.**

The backend only needs to request a shared external feed once regardless of how many topics use it.

Pointers also contain information used by the background refresh system:

```text
url
normalized_url
feed_type
last_fetched
next_fetch
created_at
updated_at
```

Before a pointer is created, its URL is normalized and checked against existing pointers.

---

## Stories

Stories belong to pointers.

```text
Pointer
   │
   ├── Story
   ├── Story
   ├── Story
   └── Story
```

A story contains information such as:

```text
pointer_id
title
link
source
published_at
```

The `source` identifies where the story originated, such as:

```text
reddit
google
```

`published_at` may be `null` when the source feed does not provide a publication timestamp.

Stories are stored in MongoDB rather than fetched whenever a user opens their feed.

---

# Feed Retrieval

When a user requests stories for a topic:

```text
Authenticated User
       ↓
     Topic
       ↓
  Pointer IDs
       ↓
Stories matching those pointers
       ↓
 API Response
       ↓
   Frontend
```

Conceptually, story retrieval uses the topic's pointer IDs:

```python
{
    "pointer_id": {
        "$in": topic.pointers
    }
}
```

Because the stories have already been collected by the background system, normal API requests do not need to make external RSS requests.

This helps keep feed retrieval fast and separates **reading stories** from **fetching stories**.

The backend can also combine stories across all of a user's topics to construct their complete feed.

---

# Background Refresh System

External feed retrieval happens independently from normal API requests.

**APScheduler** runs the story refresh process in the background.

```text
APScheduler
     ↓
Find pointers ready for refresh
     ↓
Fetch RSS / Atom feed
     ↓
Parse stories
     ↓
Store latest stories
     ↓
Update pointer schedule
```

A pointer is ready to refresh when:

```text
next_fetch is None
```

or:

```text
next_fetch <= current time
```

After a successful refresh:

```text
last_fetched = now
next_fetch = now + refresh interval
```

A delay is placed between external requests to reduce unnecessary traffic and lower the chance of hitting provider rate limits.

A failure while refreshing one pointer should not prevent the remaining pointers from being processed.

Because refreshing occurs independently from normal feed retrieval, users do not need to wait for external RSS providers when loading their feeds.

---

# Pointer Deduplication

Pointers are deduplicated globally using their normalized URL.

```text
Incoming URL
     ↓
Normalize URL
     ↓
Search MongoDB
     ↓
   Exists?
   /     \
 yes      no
  ↓        ↓
reuse    create
  │        │
  └── ID ─┘
      ↓
Add pointer ID to topic
```

This prevents multiple copies of the same external source from being created.

For example, if several users follow:

```text
r/StarWars
```

The Feed does not need to maintain a separate Reddit pointer and set of stories for every user.

Instead:

```text
User A ──┐
User B ──┼── Shared Pointer ── Stories
User C ──┘
```

Topic names are intentionally **not** globally deduplicated.

For example:

```text
Star Wars
Star Wars News
Star Wars Updates
Lucasfilm
```

may overlap, but users are free to organize their feeds however they want.

The important shared resource is the **pointer**, not the topic name.

---

# MongoDB Indexes

Indexes are created during FastAPI application startup.

Important indexes include:

### Unique Pointer URLs

```python
collection.create_index(
    "normalized_url",
    unique=True,
)
```

Prevents duplicate shared pointers.

### Pointer Refresh Scheduling

```python
collection.create_index("next_fetch")
```

Improves queries that find pointers ready to refresh.

### Stories by Pointer

```python
collection.create_index("pointer_id")
```

Improves story retrieval and deletion by pointer.

### Topics by User

```python
collection.create_index("userId")
```

Improves retrieval of a user's topics.

Where appropriate, database-level indexes enforce guarantees rather than relying only on application logic.

---

# Database Models vs API Models

MongoDB uses `ObjectId` values internally.

For example:

```python
class Story(BaseModel):
    id: ObjectId = Field(
        default_factory=ObjectId,
        alias="_id",
    )

    pointer_id: ObjectId
```

MongoDB `ObjectId` values cannot be returned directly as standard JSON.

The API therefore uses outbound models to convert MongoDB-specific values into JSON-friendly representations.

```python
class Outbound_Story(Story):
    id: ObjectIdString = Field(alias="_id")
    pointer_id: ObjectIdString
```

The intended separation is:

```text
MongoDB
   ↓
Database Model
   ↓
Internal Application Logic
   ↓
Outbound Model
   ↓
FastAPI
   ↓
JSON
   ↓
Frontend
```

This keeps database-specific types inside the backend while exposing clean API responses to clients.

---

# API Overview

FastAPI automatically exposes interactive API documentation while the backend is running.

```text
/docs
```

The root endpoint also provides a link to the generated documentation.

## Health

```http
GET /health
```

Returns the current health of the backend service.

---

## Authentication

### Login

```http
POST /auth/login
```

Authenticates an existing user and returns a JWT bearer token.

---

## Users

### Create User

```http
POST /users
```

Creates a new user account.

### Get User

```http
GET /users/{user_id}
```

Requires authentication for the requested user.

---

## Topics

### Create Topic

```http
POST /users/{user_id}/topics
```

Creates a topic belonging to the authenticated user.

### Update Topics

```http
PUT /users/{user_id}/topics
```

Updates the authenticated user's topics.

### Get Topics

```http
GET /users/{user_id}/topics
```

Returns the authenticated user's topics.

### Delete Topic

```http
POST /users/{user_id}/topics/{topic_id}/delete
```

Deletes a topic.

---

## Pointers

### Add Pointer to Topic

```http
POST /users/{user_id}/topics/{topic_id}/pointers
```

Adds an external feed pointer to a topic.

### Get Pointer

```http
GET /users/{user_id}/pointers/{pointer_id}
```

Returns information about a pointer.

### Delete Pointer

```http
POST /users/{user_id}/pointers/{pointer_id}/delete
```

Deletes a pointer.

---

## Stories

### Get Stories by Topic

```http
GET /users/{user_id}/topics/{topic_id}/stories
```

Returns stories associated with the pointers attached to a specific topic.

### Get All Stories for User

```http
GET /users/{user_id}/stories
```

Returns stories across the authenticated user's topics.

---

# Testing and Quality Checks

### Backend

Run from `backend/`:

```bash
poetry run pytest
poetry run ruff check .
poetry run ruff format --check .
```

To apply formatting: `poetry run ruff format .`.

If pre-commit is configured in your new repository, install and run its hooks from the directory containing the relevant `.pre-commit-config.yaml`:

```bash
poetry run pre-commit install
poetry run pre-commit run --all-files
```

Backend test areas include authentication, JWT validation, authorization, topics, pointer normalization and deduplication, story retrieval, and refresh scheduling.

### Frontend

Run from `frontend/`:

```bash
pnpm run dev
pnpm test
pnpm lint
pnpm format
pnpm build
```

Run only scripts defined in `frontend/package.json`; script availability and behavior depend on that file.

### Continuous integration

The original backend repository documented a GitHub Actions pipeline for Python 3.12, Poetry, Ruff, and pytest. **After moving into this combined repository, check or update workflow working directories** so commands execute from `backend/`. Add frontend jobs separately if desired. Do not assume the old workflow still works unchanged.

# Deployment Notes

- Keep production environment variables separate from laptop development values.
- Decide whether production will reuse an existing MongoDB replica set or run a dedicated MongoDB service; avoid creating a second production database by accident.
- Preserve and verify database backups before changing production infrastructure.
- Confirm frontend-to-backend networking and the reverse proxy / tunnel configuration before switching traffic.
- Avoid exposing MongoDB publicly, and add authentication and access controls appropriate to the production environment.
- Review image versions, health checks, secrets, and startup behavior before deployment.

---

# Current Feed Sources

The Feed currently supports:

- **Reddit RSS / Atom feeds**
- **Google News RSS feeds**
- **Standard RSS feeds**

Each provider is converted into the same common Story model.

```text
Reddit ──────┐
             │
Google News ─┼── Story Model ── MongoDB ── API ── Frontend
             │
Future Feed ─┘
```

This means the frontend does not need to understand the differences between individual RSS providers.

Additional providers can be added to the backend while continuing to expose the same general story structure to clients.

---

# Design Goals

The Feed Backend is designed around a few core principles:

- **Give users control** — users decide which topics and sources belong in their feed.

- **Fetch once, reuse many times** — shared pointers prevent duplicate requests to external sources.

- **Keep user data private** — authenticated routes verify that users only access resources belonging to their account.

- **Never store plaintext passwords** — credentials are protected using Argon2 password hashing.

- **Keep user organization flexible** — users can name and organize topics however they want.

- **Separate fetching from reading** — users read stored stories instead of waiting for external RSS requests.

- **Respect external services** — scheduled refreshes and delays reduce unnecessary requests.

- **Enforce shared-resource uniqueness** — MongoDB indexes prevent duplicate pointers.

- **Keep API responses clean** — MongoDB-specific types remain internal while clients receive JSON-friendly models.

- **Keep source integrations interchangeable** — different feed providers are converted into the same story representation.

---

# Project Goal

The goal of The Feed is simple:

> **Give users a way to stay informed about the things they care about without needing a traditional social media feed.**

The Feed is built around user-selected sources rather than algorithmically selected content.

The backend makes that possible by authenticating users, collecting their chosen sources, sharing common feed resources when possible, refreshing stories in the background, storing those stories, and serving them through a protected API.

**You choose the topics.**

**You choose the sources.**

**The Feed handles the rest.**
