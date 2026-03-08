---
name: docker
description: Manage Docker services (up, down, rebuild). Usage: /docker up, /docker down, /docker rebuild [service]
disable-model-invocation: true
---

# Docker

Manage the project's Docker Compose services.

## Usage

The user will invoke this skill with one of the following arguments:

- `/docker up` — Start all services
- `/docker up <service>` — Start a specific service (e.g., `postgres`, `api`)
- `/docker down` — Stop and remove all services
- `/docker down -v` — Stop all services and remove volumes (destroys data)
- `/docker rebuild` — Rebuild and restart all services
- `/docker rebuild <service>` — Rebuild and restart a specific service

## Commands

All commands must be run from the project root directory: `/Users/yakupgeyik/Projects/hizli-isletmem`

### up

```bash
# All services
docker compose up -d

# Specific service
docker compose up -d <service>
```

After starting, run `docker compose ps` to show the user the status of all services.

### down

```bash
# Stop services (keep volumes)
docker compose down

# Stop services and remove volumes
docker compose down -v
```

If the user passes `-v`, warn them that this will **delete all database data** and ask for confirmation before running.

### rebuild

```bash
# All services
docker compose up -d --build

# Specific service
docker compose up -d --build <service>
```

After rebuilding, run `docker compose ps` to show the user the status.

## Rules

- Always run commands from the project root.
- Always show `docker compose ps` output after `up` and `rebuild` operations.
- For `down -v`, always confirm with the user before executing — this destroys data.
- If Docker daemon is not running, inform the user to start Docker Desktop.
- If a build fails, show the relevant error output to help debug.
