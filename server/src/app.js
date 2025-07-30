import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();
// CORS config
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
// Body parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// test for mongodb 
import testRoutes from "./routes/test.route.js";
app.use("/api/v1/test", testRoutes);

// routes import Only User
import userRouter from "./routes/user.route.js";
// routes declaration
app.use("/api/v1/users", userRouter);

// routes import for department
import departmentRouter from "./routes/department.route.js";
// route declearation 
app.use("/api/v1/departments", departmentRouter);

// routes import Only attendance
import attendanceRouter from "./routes/attendance.route.js";
// routes declaration
app.use("/api/v1/attendance", attendanceRouter);

// route import for HR
import hrRoutes from "./routes/hr.routes.js";
// route declearation
app.use("/api/v1/hr", hrRoutes);
// route import for job application
import jobApplicationRoute from "./routes/jobApplication.route.js";
// route declearation
app.use("/api/v1/job-applications", jobApplicationRoute);

import companyRoutes from "./routes/company.route.js";
// route declearation
app.use("/api/v1", companyRoutes);






// Google
import session from "express-session";
import passport from "passport";
import "./config/passport.js";
import MongoStore from 'connect-mongo';

app.use(session({
  secret: process.env.SESSION_SECRET || "my_secure_random_string",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true in production with HTTPS
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI, // or your connection string
    ttl: 60 * 60 * 24 * 7 // 1 week
  })
}));
// ✅ Passport middleware
app.use(passport.initialize());
app.use(passport.session());

import authRoutes from "./routes/auth.routes.js";
app.use('/api/v1/auth', authRoutes);

export default app;