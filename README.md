# WorkSphere HRMS

WorkSphere is a modern, full-stack Employee and Human Resources Management System (HRMS) built with the MERN stack (MongoDB, Express, React, Node.js). 

It is designed to handle the end-to-end employee lifecycle, from onboarding and department allocation to attendance tracking, leave management, payroll processing, and performance reviews. 

## Features

- **Authentication & RBAC**: Secure JWT-based authentication with strict Role-Based Access Control (`ADMIN`, `HR`, `EMPLOYEE`).
- **Employee Management**: Create, view, update, and deactivate employee profiles. 
- **Department Management**: Organize employees into departments with dynamic headcount tracking.
- **Attendance**: Daily check-in/check-out tracking for employees, with an administrative overview.
- **Leave Management**: Employees can apply for and cancel leaves; Admin/HR can approve or reject them.
- **Payroll**: Monthly salary calculation based on basic salary, allowances, and deductions, generating gross and net pay with a verifiable payment status workflow.
- **Performance Management**: Create, edit, and finalize star-based performance reviews with detailed feedback.
- **Live Dashboard**: Role-aware personalized dashboards showing quick stats, pending tasks, and recent history.

## Tech Stack

### Frontend
- **React 18** (with Vite)
- **TypeScript**
- **Tailwind CSS** (for styling)
- **Zustand** (Global state management & Auth state)
- **TanStack Query** (Data fetching, caching, and synchronization)
- **React Router v6** (Routing)
- **Lucide React** (Icons)

### Backend
- **Node.js & Express.js**
- **MongoDB** (with Mongoose ODM)
- **JSON Web Tokens (JWT)** for stateless authentication
- **Bcrypt** for secure password hashing
- **Jest** for automated testing

---

## Security & Data Integrity

- **Password Hashing**: User passwords are encrypted with bcrypt (salt factor 12) before persisting to MongoDB.
- **Stateless Authentication**: Signed JWT tokens with strict expiration validate every protected API request.
- **Database Safety**: MongoDB access is handled through Mongoose schemas and validated application inputs.
- **Role Isolation**: Authorization middleware enforces RBAC permissions at the API route level.

---

## Project Structure

```text
worksphere/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Buttons, Cards, Modals)
│   │   ├── hooks/          # Custom TanStack Query hooks (useEmployeeQueries, etc.)
│   │   ├── layouts/        # Dashboard and Sidebar layouts
│   │   ├── lib/            # Axios API configuration
│   │   ├── pages/          # Full page views (Dashboard, Payroll, Leaves, etc.)
│   │   ├── routes/         # React Router configuration & Protected Routes
│   │   ├── services/       # Typed API service calls
│   │   └── store/          # Zustand auth store
│   └── package.json
└── server/                 # Express Backend
    ├── src/
    │   ├── __tests__/      # Automated Jest test suites
    │   ├── controllers/    # Route logic (employeeController, payrollController, etc.)
    │   ├── middleware/     # Auth and Error handling middleware
    │   ├── models/         # Mongoose Schemas (User, Employee, Attendance, etc.)
    │   ├── routes/         # Express API routes
    │   └── utils/          # Helper functions (e.g., payrollCalc)
    └── package.json
```

---

## Local Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account (or a local MongoDB instance)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/worksphere.git
cd worksphere
```

### 2. Environment Variables
You will need to create `.env` files in both the `server` and `client` directories.

**`server/.env`**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mernDB
CLIENT_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@worksphere.com
ADMIN_PASSWORD=your_secure_password
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies & Run

**Backend:**
```bash
cd server
npm install
npm run dev
```
*(On first start, the server will automatically seed the initial Admin account using the credentials provided in your `.env` file).*

**Frontend:**
```bash
cd client
npm install
npm run dev
```

The application will now be available at `http://localhost:5173`.

---

## Roles & Access Control

WorkSphere strictly enforces access control on both the frontend (UI visibility) and backend (API protection).

- **ADMIN / HR**: Has global access. Can create departments, onboard employees, approve leaves, run payroll, and issue performance reviews.
- **EMPLOYEE**: Has restricted, read-only access to their own data. They can check in/out for attendance and apply for leaves, but cannot see or modify other employees' data or administrative records.

---

## Deployment

### Frontend (Vercel / Netlify)
Set the build command to `npm run build` and output directory to `dist`. Ensure you add the environment variable:
- `VITE_API_URL=https://your-backend-url.onrender.com/api`

### Backend (Render / Heroku)
Ensure you set the start command to `node src/server.js`. Add all the variables from your `server/.env` file to the host's environment variables. 
Update `CLIENT_URL` to match your deployed frontend (e.g., `https://worksphere-app.vercel.app`).

---

## Limitations & Known Issues

- **Payroll Automation**: Payroll calculation is currently semi-manual. While the system provides the fields for `presentDays` and `leaveDays`, it does not currently auto-scrape the attendance database to pre-fill these inputs.
- **Backdating Payroll**: The `paidOn` date for Payroll is automatically set to the current date when marked as `PAID`. The UI does not currently support manually backdating this.

---

*Developed as a MERN Stack capstone project.*
