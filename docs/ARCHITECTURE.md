# FieldOps — Architecture Document

## Overview

Three layer architecture — React frontend, Express REST API, MySQL database.
All communication is JSON over HTTP. Auth is handled via JWT passed in the
Authorization header on every request.

## System Components
React Frontend (port 4000)
|
| HTTP/JSON
v
Express API (port 5000)
|
| mysql2 connection pool
v
MySQL Database

Frontend talks only to the API. API talks only to the database.
No direct DB access from the frontend, no shared state between layers.

## Tech Stack Decisions

**Node.js + Express** — I know it well and it gets a REST API running fast.
Express is unopinionated which meant I could structure the project the way
I wanted without fighting the framework. For this scale its more than enough.

**React + Tailwind CSS** — React for component based UI, Tailwind for utility
classes so I dont have to write a separate CSS file for every component. Keeps
things moving quickly.

**MySQL** — the data here is clearly relational. Jobs belong to clients, get
assigned to technicians, have notes written by users. Foreign keys and joins
are the right tool. MySQL is what I work with daily so setup was fast.

**JWT** — stateless auth, no session store needed. Token carries the user id,
name, email and role. Role is re-checked server side on every protected route
via middleware — the token alone doesnt grant access, the role in the token
has to match what the route allows.

## Folder Structure
/backend
/controllers    business logic, one file per domain
/routes         express routers, one file per domain
/middleware     auth.js — token verify + role check
/db             mysql2 connection pool

/frontend
/src
/api          axios instance with interceptors
/context      AuthContext — user state across app
/pages
/admin      Dashboard, ManageJobs, CreateJob, ManageUsers
/technician MyJobs
/client     MyJobs
/components   Navbar, ProtectedRoute

## Database Design

Four tables. Kept it simple and normalized.

**users** — single table for all roles. Role is an ENUM (admin, technician, client).
Avoids joining across role tables and keeps auth logic straightforward.

**jobs** — core table. `client_id` and `technician_id` both FK to users.
`technician_id` is nullable — job starts unassigned. Status is an ENUM:
pending → assigned → in_progress → completed/cancelled.

**job_notes** — append only. Every note has a job_id and user_id so you know
who wrote what and when. This also acts as a basic activity timeline for a job.

**notifications** — simple rows with user_id, message, is_read. Generated
server side whenever something important happens. No queue, no workers,
just an insert in the same transaction as the triggering action.

Key indexes that matter:
- `jobs.client_id` — client fetches their own jobs
- `jobs.technician_id` — technician fetches their assigned jobs  
- `notifications.user_id` — user fetches their own notifications

## Auth Strategy

- Single login endpoint for all roles (`POST /api/auth/login`)
- JWT signed with a secret from env, expires in 24 hours
- Token payload: `{ id, name, email, role }`
- Every protected route runs `authenticate` middleware first (verify token),
  then `authorizeRoles(...roles)` middleware (check role matches)
- 401 on invalid/expired token, 403 on wrong role
- Frontend axios instance has a response interceptor — on 401 or 403 it
  clears localStorage and redirects to login automatically
- Admin creates all user accounts — no open registration

## Notifications Design

When these events happen, a notification row is inserted for the relevant user:

| Event | Who gets notified |
|-------|------------------|
| Job created | Client |
| Technician assigned | Technician |
| Status updated (by technician) | Client |
| Status updated (by admin) | Client |

Frontend polls every 30 seconds. Bell icon shows unread count.
Clicking it marks all as read.

I chose this over a proper queue (BullMQ etc) because it runs fully locally,
has zero dependencies, and satisfies the requirement. For a production system
with email delivery I would add a queue worker here.

## What I Deliberately Did Not Build

**Email notifications** — would need an SMTP server or a service like SendGrid.
Breaks the "runs locally without paid services" constraint. In-app notifications
cover the requirement for this scope.

**Soft deletes** — went with hard deletes for simplicity. Would change this
before going to production so data isnt permanently lost.

**Pagination** — not implemented on job listings. Fine for a small dataset,
would add limit/offset query params on the API and a simple page control
on the frontend before any real usage.

**Docker** — ran out of time. Would have wrapped backend, frontend and MySQL
in a docker-compose file so the whole stack starts with one command.