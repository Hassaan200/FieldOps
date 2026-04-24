# FieldOps — Field Service Management Platform

An internal platform to manage field service operations — allowing admins to assign jobs, technicians to execute them, and clients to track progress in real time.

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


Backend Server runs on `http://(PUT_YOUR_IP):5000`
> Replace `(PUT_YOUR_IP)` with your machine’s local IP (e.g., 192.168.x.x).

### 4. Setup Frontend

cd frontend
npm install
npm run dev


Frontend runs on `http://(PUT_YOUR_IP):4000`
> Replace `(PUT_YOUR_IP)` with your machine’s local IP (e.g., 192.168.x.x).

>The app is configured to run using your local machine IP instead of localhost.
>This allows access from other devices on the same network if needed.

### 5. Seed Default Users

cd backend
node seed.js


This creates three users to get started with — one for each role.

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fieldops.com | admin123 |
| Technician | tech@fieldops.com | admin123 |
| Client | client@fieldops.com | admin123 |

## ⚠️ Important Testing Note

Since the system uses JWT-based authentication, testing multiple user roles (Admin, Technician, Client) in the same browser can cause authorization conflicts (e.g., 403 Forbidden errors) due to token overwriting in localStorage.

To properly test different roles simultaneously:

- Use separate browsers (e.g., Chrome, Edge, Firefox), or  
- Use Incognito/Private windows for each role  

This ensures each session maintains its own authentication token without interfering with others.

> Admin can create more users from the dashboard after logging in.

> After users successfully logged in to their accounts they can change their passwords.


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
- Demo accounts (admin@demo.com, tech@demo.com, client@demo.com) are restricted — credentials cannot be changed and demo admin cannot edit or delete any user.
- Make Demo acounts from main admin acount if you want to make demo accounts for others for testing
- Clients and technicians can message each other directly within a job. Notifications are triggered on every new message.

## Trade-offs

- Chose JWT over sessions — simpler to setup, no session store needed, works fine for this scale.
- In-app notifications over email — keeps the project running fully locally without any third party service. In a real product id hook this up to something like SendGrid.
- No pagination yet — acceptable for a small dataset but would add it before going to production.
- Frontend is functional, polished, and responsive — focused on getting all the flows working correctly.
- No unit tests written — would add these with more time, especially for the auth middleware and job assignment logic.

## What's Missing

- Email notifications
- Pagination and filtering on job listings
- Unit and integration tests
- Docker setup
- Password reset via email (forgot password flow)
- Client job request flow (clients submit a service request → admin reviews and converts it into a job)
- Audit log — full history of who changed what and when (job notes partially cover this)

## API Reference

All endpoints require `Authorization: Bearer <token>` header except login.

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/login | Public | Login for all roles |
| POST | /api/auth/register | Admin | Create a new user |

### Jobs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/jobs | Admin | Create a new job |
| GET | /api/jobs | Admin | Get all jobs |
| GET | /api/jobs/my | Technician | Get my assigned jobs |
| GET | /api/jobs/client | Client | Get my jobs |
| PATCH | /api/jobs/:id/assign | Admin | Assign technician to job |
| PATCH | /api/jobs/:id/status | Technician | Update job status |
| PATCH | /api/jobs/:id/admin-status | Admin | Override job status |
| POST | /api/jobs/:id/notes | All roles | Add note to job |
| GET | /api/jobs/:id/notes | All roles | Get job notes |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/users | Admin | Get all users |
| GET | /api/users/clients | Admin | Get all clients |
| GET | /api/users/technicians | Admin | Get all technicians |
| PUT | /api/users/:id | Admin | Update a user |
| DELETE | /api/users/:id | Admin | Delete a user |
| PUT | /api/users/profile/password | All roles | Change own password |

### Notifications
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/notifications | All roles | Get my notifications |
| PATCH | /api/notifications/read-all | All roles | Mark all as read |