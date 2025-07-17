# CRM Server (Backend)

This is the backend server for the CRM system, built with Node.js, Express, and MongoDB. It features a modular architecture supporting Production, Sales, HR, Telecom, Data Mining, After Sales, and Training modules.

## Features
- Modular RESTful API for CRM operations
- User authentication (JWT & Google OAuth)
- Department and attendance management
- HR records, onboarding, leave, and resignation workflows
- File uploads (Multer, Cloudinary)
- Role-based access control
- MongoDB with Mongoose ODM

## Project Structure
```
server/
  src/
    app.js                # Express app setup, middleware, routes
    index.js              # Server entry point
    db/
      index.db.js         # MongoDB connection logic
    config/
      passport.js         # Passport.js Google OAuth config
    constants.js          # App-wide constants (e.g., DB_NAME)
    controllers/          # Route handler logic
    middlewares/          # Auth, role, multer, etc.
    models/               # Mongoose schemas
    routes/               # API route definitions
    utils/                # Utility functions (email, OTP, etc.)
  package.json            # Dependencies and scripts
  public/                 # Static files
```

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance (local or cloud)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd CRM/server
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the `server/` directory with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017
   SESSION_SECRET=your_session_secret
   CORS_ORIGIN=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### Running the Server
- **Development:**
  ```bash
  npm run dev
  ```
  The server will start on `http://localhost:3000` (or your specified PORT).

## API Endpoints

### Auth
- `GET /api/v1/auth/google` — Start Google OAuth
- `GET /api/v1/auth/google/callback` — Google OAuth callback

### Users
- `POST /api/v1/users/register` — Register user
- `POST /api/v1/users/login` — Login
- `POST /api/v1/users/logout` — Logout (JWT required)
- `PUT /api/v1/users/profile` — Update profile (JWT required)
- `PUT /api/v1/users/change-password` — Change password (JWT required)
- `GET /api/v1/users/getCurrentUser` — Get current user (JWT required)
- `GET /api/v1/users/` — List all users (admin only)
- `PUT /api/v1/users/:id/role` — Update user role (admin/hr/manager)
- `DELETE /api/v1/users/:id` — Delete user (admin/hr/manager)
- `GET /api/v1/users/:userId/departments` — Get user departments
- `POST /api/v1/users/forgot-password` — Request password reset
- `POST /api/v1/users/reset-password/:token` — Reset password
- `POST /api/v1/users/refresh` — Refresh JWT
- `GET /api/v1/users/user/:username` — Public profile

### Departments
- `POST /api/v1/departments/` — Create department (admin)
- `GET /api/v1/departments/` — List departments
- `GET /api/v1/departments/:id` — Get department by ID
- `PUT /api/v1/departments/:id` — Update department
- `DELETE /api/v1/departments/:id` — Delete department
- `PUT /api/v1/departments/:id/assign` — Assign member
- `PUT /api/v1/departments/:id/remove` — Remove member
- `GET /api/v1/departments/:id/employees` — List employees in department

### Attendance
- `POST /api/v1/attendance/` — Create attendance
- `PUT /api/v1/attendance/:id` — Update attendance
- `GET /api/v1/attendance/` — List attendance records
- `POST /api/v1/attendance/auto-fill-week-offs` — Auto-fill week offs
- `DELETE /api/v1/attendance/delete-weekoffs` — Delete all week offs

### HR
- `POST /api/v1/hr/` — Create HR record
- `PUT /api/v1/hr/:id` — Update HR record
- `DELETE /api/v1/hr/:id` — Delete HR record
- `PATCH /api/v1/hr/:id/restore` — Restore HR record
- `GET /api/v1/hr/employee/:employeeId` — Get HR by employee ID
- `GET /api/v1/hr/` — List all HR records
- `GET /api/v1/hr/search` — Search HR records
- `PATCH /api/v1/hr/bulk` — Bulk update HR records
- `GET /api/v1/hr/export` — Export HR data

#### Leave Management
- `POST /api/v1/hr/:id/leave` — Create leave request
- `PUT /api/v1/hr/:id/leave/:leaveIndex` — Update leave request
- `DELETE /api/v1/hr/:id/leave/:leaveIndex` — Delete leave request
- `PATCH /api/v1/hr/:id/leave/:leaveIndex/approve` — Approve leave
- `PATCH /api/v1/hr/:id/leave/:leaveIndex/reject` — Reject leave
- `GET /api/v1/hr/:id/leave/history` — Employee leave history
- `GET /api/v1/hr/leaves` — All leave requests
- `GET /api/v1/hr/leaves/pending` — Pending leave requests
- `GET /api/v1/hr/leaves/type/:type` — Leave requests by type
- `GET /api/v1/hr/leaves/date-range` — Leave requests in date range
- `GET /api/v1/hr/:id/leave/summary` — Leave summary by status
- `GET /api/v1/hr/leaves/for-approval` — Leave requests for approval

#### Onboarding & Resignation
- `POST /api/v1/hr/:id/onboarding/start` — Start onboarding
- `PATCH /api/v1/hr/:id/onboarding/status` — Update onboarding status
- `GET /api/v1/hr/onboarding/in-progress` — Onboarding employees
- `POST /api/v1/hr/:id/resignation` — Submit resignation
- `PATCH /api/v1/hr/:id/resignation/status` — Update resignation status
- `GET /api/v1/hr/resigned` — Resigned employees
- `GET /api/v1/hr/notice-period` — Active notice periods

#### SuperAdmins & Active Employees
- `GET /api/v1/hr/superadmins` — List superadmins
- `GET /api/v1/hr/active` — List active employees

### Test
- `GET /api/v1/test/db-info` — Get MongoDB database info

## Scripts
- `npm run dev` — Start server with nodemon and dotenv

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
ISC
