# EMS.pro

Enterprise Employee Management & Workforce Operations Platform

EMS.pro is a full-stack workforce operations platform designed to help organization administrators and HR teams manage employees, automate daily attendance tracking, handle leave workflows, analyze department payroll, and export executive reports—all from a secure, unified platform.

---

## Problem Statement

HR and management teams operate through fragmented tools—tracking daily check-ins on manual sheets, processing leave requests over email, and analyzing payroll in separate spreadsheets. This disjointed setup leads to unrecorded late arrivals, unexcused absentees left untracked at the end of the day, and hours of manual labor required to compile attendance and salary reports.

---

## Solution

EMS.pro integrates workforce management into a single, automated operational platform that enables organizations to:

- Generate department-coded daily check-in access codes
- Automatically mark unexcused absences after end-of-day (6:00 PM)
- Synchronize approved employee leaves directly into daily attendance logs
- Track real-time workforce headcount and department salary distribution
- Filter attendance records by status, department, and dynamic years
- Generate and download spreadsheet-ready CSV analytics reports
- Enforce strict role-based access control (Admin & Employee)

---

## Features

- Multi-portal access for Administrators and Employees
- Department attendance code generation & verification
- Automated EOD absentee categorization engine
- Real-time leave-to-attendance log synchronization
- Interactive Recharts payroll & attendance data visualizations
- Comprehensive multi-filter employee directory
- Date-range analytics filtering and 1-click CSV report export
- Secure JWT authentication with role-based route guards

---

## Dashboard Modules

### Admin Dashboard (`/dashboard`)
Provides an executive overview of total active employees, monthly payroll expenses, average compensation, department headcount distribution, and recently registered employees.

### Employee Directory (`/employees`)
Enables administrators to perform full CRUD operations—adding, editing, searching by name/email, filtering by department or salary range, and managing workforce profiles.

### Attendance Management (`/attendance`)
Tracks daily employee check-ins using department security codes. Features real-time status tabs (*All Records*, *Present*, *Late*, *Absent*, *Half-Day*, *On Leave*), dynamic year filters, and an automated 6:00 PM EOD absentee marker.

### Leave Center (`/leaves`)
Manages employee leave applications. Allows employees to request leaves with start/end dates and reasons, while administrators review, approve, or reject requests with automatic attendance log creation.

### Reports & Analytics (`/reports`)
Displays multi-tab analytics (*Overview*, *Leaves*, *Attendance*, *Salary*), interactive bar/pie charts, custom date range filtering, and 1-click CSV report downloads (`EMS_Report_[DateRange].csv`).

### Employee Self-Service (`/employee-login` & `/employee-register`)
Dedicated portals for employees to self-register, submit daily attendance codes, review leave application statuses, and update profile security settings.

---

## Data & Synchronization Pipeline

The system follows an automated data handling workflow:

1. User registration & JWT authentication
2. Department check-in code generation
3. Daily check-in submission & timestamp validation
4. Automated 6:00 PM EOD absentee scanner execution
5. Leave application submission & admin status review
6. Automated creation/update of `On Leave` attendance records
7. Recharts data aggregation & CSV export compilation

---

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend Framework | React (Vite), React Router v6 |
| Styling | Tailwind CSS, Vanilla CSS |
| Data Visualization | Recharts |
| HTTP Client | Axios |
| Backend Runtime | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ORM) |
| Authentication | JSON Web Tokens (JWT), BcryptJS |
| Security & Middleware | Helmet, Express-Rate-Limit, CORS |

---

## Project Structure

```text
EMS/
├── backend/
│   ├── controllers/
│   │   ├── activity.controller.js
│   │   ├── analytics.controller.js
│   │   ├── attendance.controller.js
│   │   ├── auth.controller.js
│   │   ├── department.controller.js
│   │   ├── employee.controller.js
│   │   ├── leave.controller.js
│   │   └── performance.controller.js
│   ├── middleware/
│   │   ├── error.js
│   │   └── verifyToken.js
│   ├── models/
│   │   ├── ActivityLog.js
│   │   ├── Admin.js
│   │   ├── Attendance.js
│   │   ├── Department.js
│   │   ├── Employee.js
│   │   ├── Leave.js
│   │   └── Performance.js
│   ├── routes/
│   │   ├── activity.routes.js
│   │   ├── analytics.routes.js
│   │   ├── attendance.routes.js
│   │   ├── auth.routes.js
│   │   ├── department.routes.js
│   │   ├── employee.routes.js
│   │   ├── leave.routes.js
│   │   └── performance.routes.js
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── AnimatedBackground.jsx
    │   │   ├── AnimatedCard.jsx
    │   │   ├── AnimatedTable.jsx
    │   │   ├── EmployeeForm.jsx
    │   │   ├── EmployeeTable.jsx
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── pages/
    │   │   ├── AdminLogin.jsx
    │   │   ├── Attendance.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── EmployeeLogin.jsx
    │   │   ├── EmployeeRegister.jsx
    │   │   ├── Employees.jsx
    │   │   ├── LandingPage.jsx
    │   │   ├── Leaves.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Reports.jsx
    │   │   ├── Settings.jsx
    │   │   └── Signup.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dinesh8999/EMS-PRO.git
   cd EMS
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   *Edit `backend/.env` with your `MONGODB_URI` and `JWT_SECRET`.*

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```

---

## Run the Application

1. **Start the Backend Server:**
   ```bash
   cd backend
   node seed.js  # Optional: Seed sample database records
   npm run dev
   ```
   *Backend runs on `http://localhost:5000`*

2. **Start the Frontend Application:**
   ```bash
   cd frontend
   npm run dev
   ```
   *Frontend runs on `http://localhost:3000`*

---

## Credentials

- **Admin Login**: `admin@ems.com` / `admin123`
- **Employee Login**: `employee@ems.com` / `emp123456`

---

## Future Enhancements

- PDF report export generation alongside CSV downloads
- Shift management & multi-shift attendance code generation
- Automated email notifications for approved/rejected leaves
- Biometric & geolocation-based attendance verification
- Advanced performance evaluation & appraisal modules
