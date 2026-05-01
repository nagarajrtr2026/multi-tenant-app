
## Multi-Tenant Task Management System 

## Frontend 

This is the frontend of a multi-tenant task management application built using React. It provides a modern user interface for administrators and members to manage tasks, submissions, and organizational workflows.

## Features

* User authentication (login and registration)
* Role-based dashboards (Admin and Member)
* Task creation and viewing
* Task submission by members
* Submission review and feedback display
* Organization-based data isolation
* Responsive and modern UI using Tailwind CSS
* Smooth animations using Framer Motion
* Optional 3D background effects using React Three Fiber

## Tech Stack

* React (Vite)
* Tailwind CSS
* Framer Motion
* Axios
* React Router

## Project Structure

```
frontend/
  src/
    components/
    pages/
    contexts/
    utils/
    App.jsx
    main.jsx
```

## Installation

1. Navigate to the frontend folder:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start development server:

   ```
   npm run dev
   ```

4. Open in browser:

   ```
   http://localhost:5173
   ```

## API Configuration

Update the API base URL in:

```
src/utils/api.js
```

Example:

```
baseURL: "http://localhost:5000/api"
```

For production, replace with deployed backend URL.

## Usage

* Register a new organization and admin account
* Login to access dashboard
* Admin can create tasks and manage members
* Members can view tasks and submit responses
* Admin can review submissions and provide feedback

## Deployment

This frontend can be deployed using Vercel.

Steps:

* Push code to GitHub
* Import repository in Vercel
* Set root directory to `frontend`
* Deploy

## Notes

* Ensure backend server is running and accessible
* JWT token is required for authenticated API requests
* All data is filtered based on organization ID

---

## Multi-Tenant Task Management System – Backend

This is the backend service for a multi-tenant task management system. It provides RESTful APIs for authentication, task management, submissions, and role-based access control.

## Features

* JWT-based authentication
* Role-based access control (Admin and Member)
* Multi-tenant architecture using organization ID
* Task CRUD operations
* Task sharing within organization
* Submission system with file upload support
* Admin evaluation and feedback system
* Audit logging for tracking actions
* Secure API with middleware validation

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* JWT (JSON Web Token)
* Multer (for file uploads)

## Project Structure

```
backend/
  controllers/
  routes/
  middleware/
  config/
  models/
  server.js
```

## Installation

1. Navigate to backend folder:

   ```
   cd backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

## Environment Variables

Create a `.env` file in the backend folder:

```
PORT=5000
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=taskdb
```

## Database Setup

1. Create database:

   ```
   CREATE DATABASE taskdb;
   ```

2. Run schema file:

   * Open `models/schema.sql`
   * Execute queries in PostgreSQL

## Running the Server

```
npm run dev
```

Server will run on:

```
http://localhost:5000
```

## API Endpoints

### Authentication

* POST /api/auth/register
* POST /api/auth/login

### Tasks

* POST /api/tasks
* GET /api/tasks
* PUT /api/tasks/:id
* DELETE /api/tasks/:id

### Members

* POST /api/members/add
* GET /api/members

### Submissions

* POST /api/submissions
* GET /api/submissions
* PUT /api/submissions/:id

## Core Concepts

### Multi-Tenancy

Each user belongs to an organization. Data is strictly isolated using `org_id`.

### RBAC

* Admin: Full access
* Member: Limited access (own submissions)

### Audit Logging

Tracks user actions such as task creation, updates, and deletions.

## File Upload

* Uses Multer middleware
* Stores files in local `uploads/` directory
* File path is saved in database

## Deployment

This backend can be deployed using platforms like Render or Railway.

## Notes

* Ensure PostgreSQL is running before starting server
* All protected routes require JWT token
* Maintain proper database schema to avoid runtime errors


Just tell 👍
