# CRM – Modern Team Collaboration Platform

A futuristic, full-stack CRM system designed for scalable team collaboration, featuring user, department, and attendance management, secure authentication, role-based access, and a modern, animated UI. Built with React, Redux Toolkit, Node.js, Express, and MongoDB, this solution is modular, extensible, and ready for enterprise use.

---

## 🚀 Features

- **User Management:** Create, edit, and manage user profiles, roles, and permissions.
- **Department Management:** Organize users into departments, assign roles, and manage department members.
- **Attendance Tracking:** Record and view attendance for users and departments.
- **Authentication & Security:**
  - Secure login with JWT
  - Google OAuth integration
  - Password reset and change flows
  - Role-based access control (RBAC)
- **Modern Dashboard:**
  - Animated, responsive UI
  - KPI cards and analytics (revenue, deals, tasks, etc.)
  - Search and notification widgets
- **Modular Backend:**
  - HR, Sales, Training, Data Mining, After Sales, Telecom modules
  - Scalable, maintainable architecture
- **API-First Design:** RESTful endpoints for all major resources
- **Cloud & Email Integration:** Cloudinary for file uploads, Nodemailer for email
- **Developer Friendly:**
  - Clean code structure
  - ESLint, Prettier, and best practices
  - Vite for fast frontend builds

---

## 🛠️ Tech Stack

- **Frontend:** React, Redux Toolkit, Tailwind CSS, Vite, Framer Motion, Recharts
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT, Passport.js, Google OAuth
- **Other:** Cloudinary, Nodemailer, ESLint, Prettier

---

## 📁 Monorepo Structure

```
CRM/
├── client/           # React frontend (Vite, Redux, Tailwind)
│   ├── public/       # Static assets
│   ├── src/
│   │   ├── assets/           # Images, videos, etc.
│   │   ├── components/       # UI & feature components
│   │   │   ├── attendance/
│   │   │   ├── department/
│   │   │   ├── forms/
│   │   │   ├── profile/
│   │   │   └── ui/
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Layout wrappers
│   │   ├── pages/            # Route-level components
│   │   ├── services/         # API utilities
│   │   ├── store/            # Redux slices & store
│   │   ├── App.jsx, main.jsx # Entry points
│   │   └── styles            # App & global styles
│   ├── package.json
│   └── ...
├── server/           # Node.js backend (Express, MongoDB)
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── db/               # DB connection
│   │   ├── middlewares/      # Auth, roles, file upload
│   │   ├── models/           # Mongoose models (HR, Sales, etc.)
│   │   ├── routes/           # API endpoints
│   │   ├── utils/            # Helpers (email, cloud, etc.)
│   │   ├── app.js, index.js  # Entry points
│   ├── package.json
│   └── ...
├── README.md
└── ...
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/your-crm-repo.git
cd CRM
```

### 2. Environment Variables
Create `.env` files in both `client/` and `server/` directories. Example for `server/.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### 3. Install Dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### 4. Run the Applications
- **Frontend:**
  ```bash
  cd client
  npm run dev
  ```
- **Backend:**
  ```bash
  cd server
  npm run dev
  ```

### 5. Build for Production
- **Frontend:** `npm run build`

---

## 🌐 API Overview

- **Base URL:** `/api/v1/`
- **Main Endpoints:**
  - `POST /auth/login` – User login
  - `POST /auth/google` – Google OAuth
  - `POST /auth/forgot-password` – Request password reset
  - `POST /auth/reset-password` – Reset password
  - `GET /users/` – List users
  - `GET /users/:id` – Get user profile
  - `PATCH /users/:id` – Edit user
  - `DELETE /users/:id` – Delete user
  - `GET /departments/` – List departments
  - `POST /departments/` – Create department
  - `PATCH /departments/:id` – Edit department
  - `GET /departments/:id/employees` – List department members
  - `POST /attendance/` – Record attendance
  - ...and more (see `server/src/routes/`)

- **Auth:** JWT in HTTP-only cookies, Google OAuth via Passport.js
- **RBAC:** Role-based access enforced via middleware

---

## 🖥️ Frontend Overview

- **Dashboard:** Animated KPIs, revenue charts, search, notifications
- **User Profiles:** View, edit, and manage users
- **Departments:** Create, edit, assign members, view department employees
- **Attendance:** Mark and view attendance records
- **Authentication:** Login, signup, Google OAuth, password reset
- **Responsive UI:** Tailwind CSS, dark mode, modern design
- **Reusable Components:** Modular, maintainable codebase

---

## 🗄️ Backend Overview

- **Modular Models:**
  - `User`, `Department`, `Attendance`, `HR`, `Sales`, `Training`, `DataMining`, `AfterSales`, `Telecom`, `Membership`, `JobApplication`
- **Controllers:** Business logic for users, departments, auth
- **Routes:** RESTful API endpoints for all resources
- **Middlewares:** Auth, role checks, file uploads (Multer), error handling
- **Utils:** Email (Nodemailer), file storage (Cloudinary), OTP, etc.
- **Session Management:** Express-session, MongoStore, Passport.js

---

## 🤝 Contributing

1. Fork the repo and create your branch (`git checkout -b feature/your-feature`)
2. Commit your changes (`git commit -am 'Add new feature'`)
3. Push to the branch (`git push origin feature/your-feature`)
4. Open a Pull Request

- Follow ESLint and Prettier rules
- Use clear, descriptive commit messages
- Keep documentation up to date

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

## 🙏 Credits

Developed by Govind Ghosh and contributors.

---

> **Tip:** For detailed module and API documentation, see the code in `server/src/models/`, `server/src/controllers/`, and `server/src/routes/`.
