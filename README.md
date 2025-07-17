# CRM – Modern Team Collaboration Platform

A futuristic, full-stack CRM system designed for scalable team collaboration, featuring user, department, and attendance management, secure authentication, role-based access, and a modern, animated UI. Built with React, Redux Toolkit, Node.js, Express, and MongoDB, this solution is modular, extensible, and ready for enterprise use.

---

## 🚀 Features

- **User Management:** Create, edit, and manage user profiles, roles, and permissions.
- **Department Management:** Organize users into departments, assign roles, and manage department members.
- **Attendance Tracking:** Record and view attendance for users and departments.
- **Authentication & Security:**
  - Secure login with JWT & Google OAuth
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
│   │   │   ├── hrTabs/
│   │   │   └── ui/
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Layout wrappers
│   │   ├── pages/            # Route-level components
│   │   ├── services/         # API utilities
│   │   ├── store/            # Redux slices & store
│   │   ├── App.jsx, main.jsx # Entry points
│   │   └── utils/            # Helper functions
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
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
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

## 🌐 API Overview (Backend)

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

## 🗄️ Backend (Server) Details

### Models
- **User:** Username, email, full name, avatar, password (hashed), role, address, phone, bio, designation, status, login history, etc.
- **Department:** Name, code, description, status, head, isDeleted
- **Attendance:** Employee, department, date, status, shift, clockIn/out, remarks, location, isLate, overtime, type, isDeleted
- **HR:** Employee, leave requests, notice period, onboarding/resignation status, isSuperAdmin, isDeleted
- **Sales, AfterSales, DataMining, Telecom, Training, Membership, JobApplication:** See `server/src/models/` for full schema details

### Middlewares
- **auth.middleware.js:** JWT authentication
- **role.middleware.js:** Role-based access control
- **multer.middleware.js:** File uploads (temp storage)

### Utilities
- **ApiError/ApiResponse:** Standardized error and response objects
- **asyncHandler:** Async error handling for routes
- **cloudinary.js:** Cloud storage integration
- **sendEmail.js:** Nodemailer email utility
- **generateOTP.js:** OTP generation

### Auth & Session
- **JWT:** Used for API authentication
- **Google OAuth:** Passport.js strategy for Google login
- **Session:** express-session with MongoStore for Google OAuth

### API Routes
- See `server/src/routes/` for all endpoints, including users, departments, attendance, HR, and more.

---

## 🖥️ Frontend (Client) Details

### Structure
- **Components:** Modular, grouped by feature (attendance, department, forms, profile, hrTabs, ui)
- **Pages:** Route-level views (Dashboard, Attendance, HR, Department, Auth, Profile, etc.)
- **Hooks:** Custom hooks for data fetching, logic, and state (see `src/hooks/`)
- **Store:** Redux Toolkit slices for state management (auth, user, department, attendance, HR, etc.)
- **Services:** API utilities (axios instance, route protection)
- **Layouts:** App layout wrappers
- **Utils:** Helper functions (date formatting, PDF export, etc.)

### Key Conventions
- **Component Organization:** Grouped by feature, reusable UI in `ui/`
- **State Management:** Redux Toolkit, custom hooks
- **Styling:** Tailwind CSS, global styles in `App.css` and `index.css`
- **API Calls:** Centralized in `src/services/`
- **Assets:** In `src/assets/` and `public/`
- **Linting:** ESLint and Prettier for code quality

### Main Scripts
- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run lint` – Lint code

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

<p align="left">
  <a href="mailto:govindghosh0@gmail.com" target="_blank" title="Gmail">
    <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail" />
  </a>
  <a href="https://github.com/govindghosh/" target="_blank" title="GitHub">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="https://in.linkedin.com/in/govind-web-developer" target="_blank" title="LinkedIn">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="https://x.com/govind_ghosh" target="_blank" title="X (Twitter)">
    <img src="https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white" alt="X" />
  </a>
  <a href="https://www.instagram.com/govindghosh0/" target="_blank" title="Instagram">
    <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" />
  </a>
  <a href="https://portfolio-gold-sigma.vercel.app/" target="_blank" title="Portfolio">
    <img src="https://img.shields.io/badge/Portfolio-FFD700?style=for-the-badge&logo=vercel&logoColor=black" alt="Portfolio" />
  </a>
</p>

---

> **This CRM is built to industry standards and is ready for production deployment.**
