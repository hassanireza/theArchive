<div align="center">

<br/>

# The Archive

**A Kanban task board with editorial design, built on Django.**

Persistent task management with drag-and-drop, animated state transitions, and a warm editorial UI — served over standard Django with no external infrastructure dependencies.

<br/>

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-6.x-092E20?style=flat-square&logo=django&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-Custom_Design_System-1572B6?style=flat-square&logo=css3&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Default_DB-003B57?style=flat-square&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-8a7060?style=flat-square)

</div>

---

## Screenshots

<table>
  <tr>
    <td align="center"><b>Login</b></td>
    <td align="center"><b>Task Board — Light</b></td>
  </tr>
  <tr>
    <td><img src="assets/login.png" alt="Login page" width="100%"/></td>
    <td><img src="assets/board-light.png" alt="Task board light theme" width="100%"/></td>
  </tr>
</table>

---

## Overview

The Archive is a single-user Kanban board with a focus on UI craft and clean Django architecture. Tasks move across three columns — **To Do**, **In Progress**, and **Done** — via drag-and-drop or click-to-cycle, with spring physics animations on every state transition.

The frontend design system is built from scratch: a warm amber/terracotta palette, three-font editorial typography (Playfair Display · DM Sans · DM Mono), persistent light/dark mode, and a responsive glass-surface layout.

---

## Features

- **Three-column Kanban board** — To Do, In Progress, Done
- **Drag-and-drop** task movement between columns
- **Click-to-cycle** status advancement on any task
- **FLIP + spring physics** animations on task reordering
- **Light / Dark mode** — persistent via `localStorage`, respects `prefers-color-scheme`
- **Django session authentication** — login required, per-user task isolation
- **REST-style JSON API** — task create, update, delete endpoints
- **Zero external services** — runs on `manage.py runserver` with SQLite, no Redis or Docker required

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | Django 6 |
| Language | Python 3.12 |
| Database | SQLite (default) / PostgreSQL-compatible |
| Frontend | Vanilla JS (ES2022), CSS custom design system |
| Typography | Google Fonts — Playfair Display, DM Sans, DM Mono |
| Animation | FLIP technique + custom spring physics engine |
| Auth | Django built-in authentication |
| Server | Django development server (`runserver`) |

---

## Project Structure

```
collaboration/
├── static/
│   └── collaboration/
│       ├── css/
│       │   └── style.css          # Full design system & theme tokens
│       └── js/
│           └── tasks.js           # All JS: theme, board, API, animations
├── templates/
│   └── collaboration/
│       ├── index.html             # Task board
│       └── login.html             # Auth page
├── views.py                       # Board view + JSON API endpoints
├── models.py                      # Task model
├── urls.py
└── consumers.py                   # WebSocket consumer (inactive)
```

---

## API Endpoints

All endpoints expect and return JSON. CSRF token required on all `POST` requests.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks/` | List all tasks for the authenticated user |
| `POST` | `/api/tasks/create/` | Create a new task |
| `POST` | `/api/tasks/update/` | Update task status |
| `POST` | `/api/tasks/delete/` | Delete a task |

**Create payload**
```json
{ "title": "Task title", "description": "", "status": "todo" }
```

**Update payload**
```json
{ "id": 1, "status": "in_progress" }
```

**Delete payload**
```json
{ "id": 1 }
```

---

## Design System

The UI is built on a custom CSS design system with no external component library.

**Color palette** — Warm amber/terracotta on parchment (light) and espresso (dark). Every color is a CSS variable; theme switching is a single `data-theme` attribute toggle on `<html>`.

**Typography** — Three-font editorial stack:
- `Playfair Display` — display headings and titles
- `DM Sans` — body text, labels, UI controls
- `DM Mono` — counters, eyebrows, metadata

**Animations** — Task movement uses the FLIP technique (record **F**irst position, trigger DOM change, record **L**ast position, **I**nvert the delta, **P**lay to zero) driven by a custom spring physics loop — no animation libraries.

---

## Architecture Notes

The project was previously built on a realtime ASGI stack (Django Channels, Redis, Docker). That infrastructure has been removed in favor of a standard synchronous Django setup. The WebSocket consumer (`consumers.py`) remains in the codebase but is not active.

The REST API and task model are designed to be compatible with a future Channels-based realtime layer if the project is extended in that direction.

---

## Roadmap

- [ ] Multi-board support
- [ ] Role-based access (viewer / editor / admin)
- [ ] Task descriptions and due dates
- [ ] Board-level sharing and invitations
- [ ] Restore realtime sync (Channels + Redis) as an optional layer
- [ ] Production deployment guide (Railway / Render / Fly.io)

