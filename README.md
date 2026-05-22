# DevPulse API

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

---

## 🌐 Live Deployment

🚀 : https://devpulse-smoky.vercel.app

# 🚀 Project Overview

DevPulse is a backend REST API built with Node.js, Express.js, TypeScript, and PostgreSQL.  
The system allows contributors and maintainers to manage internal technical issues and feature requests efficiently.

This project includes:

- User authentication with JWT
- Role-based authorization
- Issue management system
- Secure password hashing
- PostgreSQL database integration using raw SQL queries only

---

# 🛠️ Technology Stack

| Technology | Description |
|---|---|
| Node.js | JavaScript runtime environment |
| TypeScript | Strongly typed JavaScript |
| Express.js | Backend web framework |
| PostgreSQL | Relational database |
| pg | Native PostgreSQL driver |
| bcrypt | Password hashing |
| jsonwebtoken | JWT authentication |

---

# 👥 User Roles

## Contributor
- Register and login
- Create issues
- View all issues

## Maintainer
- All contributor permissions
- Update any issue
- Delete any issue
- Change issue workflow status
- Access internal metrics

---

# 🔐 Authentication & Authorization

The API uses JWT-based authentication.

### Authentication Flow

1. User registers an account
2. User logs in with credentials
3. Server validates credentials
4. Server returns JWT token
5. Client sends token in request headers
6. Protected routes verify token before processing

### Authorization Header

```bash
Authorization: <JWT_TOKEN>
```

---

# 🗄️ Database Schema

## Users Table

| Field | Description |
|---|---|
| id | Auto increment primary key |
| name | User full name |
| email | Unique email address |
| password | Hashed password |
| role | contributor or maintainer |
| created_at | Account creation timestamp |
| updated_at | Last update timestamp |

---

## Issues Table

| Field | Description |
|---|---|
| id | Auto increment primary key |
| title | Issue title |
| description | Detailed issue description |
| type | bug or feature_request |
| status | open, in_progress, resolved |
| reporter_id | ID of issue creator |
| created_at | Issue creation timestamp |
| updated_at | Last update timestamp |

---

# 📌 API Endpoints

# 🔹 Authentication Module

---

## 1. Register User

### Endpoint

```http
POST /api/auth/signup
```

### Request Body

```json
{
  "name": "Fardin Ahmed",
  "email": "fardin@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

### Success Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "Fardin Ahmed",
    "email": "fardin@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00Z",
    "updated_at": "2026-01-20T09:00:00Z"
  }
}
```

---

## 2. Login User

### Endpoint

```http
POST /api/auth/login
```

### Request Body

```json
{
  "email": "fardin@devpulse.com",
  "password": "securePassword123"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": 1,
      "name": "Fardin Ahmed",
      "email": "fardin@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00Z",
      "updated_at": "2026-01-20T09:00:00Z"
    }
  }
}
```

---

# 🔹 Issues Module

---

## 3. Create Issue

### Endpoint

```http
POST /api/issues
```

### Access
Authenticated Users

### Headers

```bash
Authorization: <JWT_TOKEN>
```

### Request Body

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

---

## 4. Get All Issues

### Endpoint

```http
GET /api/issues
```

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "Fardin Ahmed",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T14:45:00Z"
    }
  ]
}
```

---

## 5. Get Single Issue

### Endpoint

```http
GET /api/issues/:id
```

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "Fardin Ahmed",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

---

## 6. Update Issue

### Endpoint

```http
PATCH /api/issues/:id
```

### Access
Maintainer or issue reporter (only when the issue status is "open")

### Headers

```bash
Authorization: <JWT_TOKEN>
```

### Request Body

```json
{
  "title": "Updated issue title",
  "description": "Updated issue description",
  "type": "bug"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Updated issue title",
    "description": "Updated issue description",
    "type": "bug",
    "status": "in_progress",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

---

## 7. Delete Issue

### Endpoint

```http
DELETE /api/issues/:id
```

### Access
Maintainer only

### Headers

```bash
Authorization: <JWT_TOKEN>
```

### Success Response

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

# 🚨 Standard API Responses

## Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": "Error details"
}
```

---

# 🔒 Security Features

- Password hashing using bcrypt
- JWT authentication
- Protected routes
- Role-based authorization
- Password excluded from responses
- Request validation
- Error handling middleware

---

# 📂 Project Structure

```bash
src
│
├── config
│   └── index.ts
│
├── db
│   └── index.ts
│
├── middlewares
│   ├── auth.ts
│   ├── globalErrorHandler.ts
│   ├── index.d.ts
│   └── verifyUpdateIssue.ts
│
├── modules
│   ├── auth
│   │   ├── auth.controller.ts
│   │   ├── auth.route.ts
│   │   └── auth.service.ts
│   │
│   └── issue
│       ├── issue.controller.ts
│       ├── issue.interface.ts
│       ├── issue.route.ts
│       └── issue.service.ts
│
├── types
│   └── user.types.ts
│
├── utility
│   └── sendResponse.ts
│
├── app.ts
└── server.ts
```

---

# ⚙️ Installation & Setup

## Clone Repository

```bash
git clone https://github.com/FardinCSE25/DevPulse
```

---

## Install Dependencies

```bash
npm install
```

---

## Run Development Server

```bash
npm run dev
```

# 👨‍💻 Author

Developed by Fardin Ahmed.
