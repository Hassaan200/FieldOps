# FieldOps — Field Service Management Platform

A internal platform to manage field service jobs, assign technicians to those jobs and let clients track whats happening with their requests. Built as a take-home assessment but treated like a real project.

## Tech Stack

- **Backend** — Node.js, Express.js
- **Frontend** — React.js, Tailwind CSS
- **Database** — MySQL
- **Auth** — JWT tokens

## Getting Started

### Requirements
- Node.js v18+  
- MySQL 8+
- npm

### 1. Clone the repo

git clone https://github.com/Hassaan200/FieldOps.git
cd FieldOps


### 2. Setup Database

Create a database named `fieldops` in MySQL, then run the schema:

mysql -u root -p fieldops < docs/schema.sql


Or open HeidiSQL and run the SQL file manually.

### 3. Setup Backend

cd backend
npm install
cp .env.example .env


Open `.env` and fill in your database password and a JWT secret of your choice, then:

npm run dev


Server runs on `http://(PUT_YOUR_IP):5000`

### 4. Setup Frontend

cd frontend
npm install
npm run dev


Frontend runs on `http://(PUT_YOUR_IP):4000`

### 5. Seed Default Users

cd backend
node seed.js


This creates three users to get started with — one for each role.

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fieldops.com | admin123 |
| Technician | tech@fieldops.com | admin123 |
| Client | client@fieldops.com | admin123 |

> Admin can create more users from the dashboard after logging in.

## Environment Variables

See `backend/.env.example` — all variables are documented there. Create a `.env` file in the backend directory and use same format like `backend/.env.example` while making .env file

## Assumptions

- Registration is not open to the public. Only an admin can create new user accounts and assign roles. This made more sense for an internal business tool.
- A job starts with no technician assigned. Admin assigns one later when someone is available.
- Jobs can only be reassigned by admin — technicians cannot reassign themselves.
- Technicians can update status to `in_progress`, `completed`, or `cancelled` but only for jobs assigned to them. Admin can override any job status at any time.
- "Notifications" means in-app notifications stored in the database. No email service. Every important event — job created, technician assigned, status changed — creates a notification for the relevant user. Bell icon in navbar shows unread count and refreshes every 30 seconds.
- Clients can view their jobs and job updates/notes but cannot create or edit anything.
- All users can change their own password from their profile page.
- Scheduled date on a job is optional.

## Trade-offs

- Chose JWT over sessions — simpler to setup, no session store needed, works fine for this scale.
- In-app notifications over email — keeps the project running fully locally without any third party service. In a real product id hook this up to something like SendGrid.
- No pagination yet — acceptable for a small dataset but would add it before going to production.
- Frontend is functional not polished — focused on getting all the flows working correctly.
- No unit tests written — would add these with more time, especially for the auth middleware and job assignment logic.

## What's Missing

- Email notifications
- Pagination and filtering on job listings
- Unit and integration tests
- Docker setup
- Password reset via email (forgot password flow)
- Audit log (who changed what and when) — the job notes partially cover this but its not a full audit trail