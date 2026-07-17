# Employee Management System (EMS)

A full-stack Employee Management System built with **React + TypeScript + Tailwind CSS** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## Features

- **Authentication** — JWT-based login/logout, bcrypt password hashing, httpOnly cookies
- **Role-Based Access Control (RBAC)** — Super Admin, HR Manager, Employee roles with granular permissions
- **Employee CRUD** — Create, Read, Update, soft-Delete with full validation
- **Organizational Hierarchy** — Reporting tree, circular dependency prevention, direct reports view
- **Dashboard** — Stats cards + department bar chart
- **Search, Filter & Sort** — By name/email, department, role, status, joining date
- **Pagination** — Server-side with page controls
- **Dark Mode** — Toggle with persistence
- **Soft Delete** — Employees are never permanently deleted

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, TypeScript, Tailwind CSS, Vite        |
| Backend    | Node.js 18+, Express 4                          |
| Database   | MongoDB + Mongoose                              |
| Auth       | JWT (jsonwebtoken) + bcrypt                     |
| Forms      | react-hook-form + zod                           |
| Charts     | recharts                                        |

---

## Project Structure

```
EmployManagment/
├── backend/                  # Express API
│   ├── src/
│   │   ├── config/           # DB + env config
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # auth, rbac, errorHandler
│   │   ├── models/           # Mongoose Employee model
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Business logic
│   │   └── utils/            # JWT, AppError, catchAsync
│   ├── seeds/seed.js         # Database seeder
│   ├── .env                  # Environment variables
│   └── package.json
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/              # Axios + API functions
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth, Theme, Toast contexts
│   │   ├── pages/            # Route-level page components
│   │   ├── routes/           # ProtectedRoute, AppRouter
│   │   └── types/            # TypeScript interfaces
│   └── package.json
├── spec.md                   # Project specification
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repository

```bash
git clone <repo-url>
cd EmployManagment
```

### 2. Backend setup

```bash
cd backend

# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET

# Start the server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Start the dev server
npm run dev
# App runs on http://localhost:5173
```

### 4. Seed the database

```bash
# From the project root
node backend/seeds/seed.js
```

This creates 11 employees including a Super Admin and a realistic reporting hierarchy.

### 5. Login

| Role        | Email                   | Password      |
|-------------|-------------------------|---------------|
| Super Admin | admin@ems.com           | Admin@1234    |
| HR Manager  | sarah.johnson@ems.com   | Hr@12345678   |
| Employee    | michael.chen@ems.com    | Emp@12345678  |

---

## API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

### Authentication

| Method | Endpoint          | Auth     | Description          |
|--------|-------------------|----------|----------------------|
| POST   | /auth/login       | Public   | Login, returns JWT   |
| POST   | /auth/logout      | Required | Logout               |
| GET    | /auth/me          | Required | Get current user     |

**Login request:**
```json
{ "email": "admin@ems.com", "password": "Admin@1234" }
```

**Login response:**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "Super Admin", "email": "...", "role": "super_admin" }
}
```

---

### Employees

| Method | Endpoint               | Access              | Description              |
|--------|------------------------|---------------------|--------------------------|
| GET    | /employees             | Admin, HR           | List all (paginated)     |
| GET    | /employees/stats       | Admin, HR           | Dashboard stats          |
| POST   | /employees             | Admin, HR           | Create employee          |
| GET    | /employees/:id         | Auth (own or above) | Get single employee      |
| PUT    | /employees/:id         | Admin, HR           | Full update              |
| PATCH  | /employees/:id         | Auth (self-limited) | Partial update           |
| DELETE | /employees/:id         | Super Admin         | Soft delete              |

**Query parameters for GET /employees:**

| Param      | Type   | Description                        |
|------------|--------|------------------------------------|
| search     | string | Name or email substring            |
| department | string | Filter by department               |
| role       | string | Filter by role                     |
| status     | string | `active` or `inactive`             |
| sortBy     | string | `name` or `joiningDate`            |
| order      | string | `asc` or `desc`                    |
| page       | number | Page number (default: 1)           |
| limit      | number | Items per page (default: 10)       |

---

### Organization

| Method | Endpoint                    | Access       | Description                     |
|--------|-----------------------------|--------------|---------------------------------|
| GET    | /organization/tree          | Auth         | Full org tree (nested)          |
| GET    | /employees/:id/reportees    | Auth         | Direct reports of an employee   |
| PATCH  | /employees/:id/manager      | Super Admin  | Assign reporting manager        |

**Assign manager request:**
```json
{ "managerId": "<employee_object_id_or_null>" }
```

---

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

| Code | Meaning                  |
|------|--------------------------|
| 400  | Validation error         |
| 401  | Unauthenticated          |
| 403  | Forbidden (RBAC)         |
| 404  | Resource not found       |
| 409  | Duplicate (email)        |
| 500  | Internal server error    |

---

## RBAC Reference

| Action                  | Super Admin | HR Manager | Employee |
|-------------------------|:-----------:|:----------:|:--------:|
| View all employees      | ✅          | ✅         | ❌       |
| Create employee         | ✅          | ✅         | ❌       |
| Edit any employee       | ✅          | ✅         | ❌       |
| Delete employee         | ✅          | ❌         | ❌       |
| View own profile        | ✅          | ✅         | ✅       |
| Edit own profile        | ✅          | ✅         | ✅ (limited) |
| Assign roles            | ✅          | ❌         | ❌       |
| Assign managers         | ✅          | ❌         | ❌       |
| View org hierarchy      | ✅          | ✅         | ✅       |
| Access dashboard        | ✅          | ✅         | ❌       |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                          | Default                        |
|----------------|--------------------------------------|--------------------------------|
| PORT           | Server port                          | 5000                           |
| MONGODB_URI    | MongoDB connection string            | mongodb://localhost:27017/ems  |
| JWT_SECRET     | JWT signing secret                   | —                              |
| JWT_EXPIRY     | Token expiry                         | 8h                             |
| NODE_ENV       | Environment                          | development                    |
| FRONTEND_URL   | Allowed CORS origin                  | http://localhost:5173          |

### Frontend (`frontend/.env`)

| Variable             | Description         | Default                        |
|----------------------|---------------------|--------------------------------|
| VITE_API_BASE_URL    | Backend API URL     | http://localhost:5000/api      |
