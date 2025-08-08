import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

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




// Static assets
// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve static files from /src/assets
app.use("/assets", express.static(path.join(__dirname, "src/assets")));

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



// health check route
// This route provides server health status and uptime information
// It returns a styled HTML response with the current server time, uptime, and last started time
app.get('/health', (req, res) => {
  const serverStartTime = new Date();
  const now = new Date();
  const uptimeSeconds = (now - serverStartTime) / 1000;

  // Format to India/Mumbai timezone (IST)
  const formatTime = (date) => {
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long',
      hour12: true
    });
  };

  // Format uptime
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };
  console.log("Health check requested at:", now.toISOString());
  res.status(200).send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Health Status</title>
    <style>
      /* ======================= BASE STYLES ======================= */
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0;
        padding: 20px;
        animation: bgPulse 20s infinite alternate;
      }
      
      .status-card {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        padding: 40px;
        text-align: center;
        max-width: 600px;
        width: 100%;
        animation: cardEnter 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        backdrop-filter: blur(4px);
      }
      
      /* ======================= ANIMATIONS ======================= */
      @keyframes pulse {
        0% { 
          box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7),
                      0 0 0 0 rgba(74, 222, 128, 0.4);
          transform: scale(1);
        }
        70% { 
          box-shadow: 0 0 0 15px rgba(74, 222, 128, 0),
                      0 0 0 30px rgba(74, 222, 128, 0);
        }
        100% { 
          box-shadow: 0 0 0 0 rgba(74, 222, 128, 0),
                      0 0 0 0 rgba(74, 222, 128, 0);
          transform: scale(1.02);
        }
      }
      
      @keyframes rotateCheck {
        0% { transform: rotateY(0); }
        100% { transform: rotateY(360deg); }
      }
      
      @keyframes cardEnter {
        0% { 
          opacity: 0;
          transform: translateY(20px);
        }
        100% { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      
      @keyframes bgPulse {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      
      /* ======================= ELEMENT STYLES ======================= */
      .status-indicator {
        width: 120px;
        height: 120px;
        background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 30px;
        animation: 
          pulse 3s infinite ease-in-out,
          rotateCheck 8s infinite linear;
        transform-style: preserve-3d;
      }
      
      .status-title {
        font-size: 2.5rem;
        color: #2d3748;
        margin-bottom: 10px;
        animation: fadeIn 1.2s ease-out;
      }
      
      .status-message {
        font-size: 1.2rem;
        color: #4a5568;
        margin-bottom: 30px;
        animation: fadeIn 1.4s ease-out;
      }
      
      .timestamp-container {
        background: rgba(248, 250, 252, 0.7);
        border-radius: 12px;
        padding: 20px;
        margin-top: 30px;
        animation: fadeIn 1.6s ease-out;
        backdrop-filter: blur(2px);
      }
      
      .timestamp-title {
        font-size: 1.1rem;
        color: #4a5568;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
        animation: fadeIn 1.8s ease-out;
      }
      
      .timestamp-value {
        font-family: 'Courier New', monospace;
        font-size: 1.1rem;
        color: #2d3748;
        margin: 8px 0;
        animation: fadeIn 2s ease-out;
      }
      
      .timezone-note {
        margin-top: 20px;
        font-size: 0.9rem;
        color: #666;
        font-style: italic;
        animation: fadeIn 2.2s ease-out;
      }
      
      /* Checkmark with 3D effect */
      .checkmark {
        width: 60px;
        height: 60px;
        transform-style: preserve-3d;
        perspective: 500px;
      }
      
      .checkmark path {
        stroke-dasharray: 22;
        stroke-dashoffset: 22;
        animation: drawCheck 1.2s 0.5s forwards;
      }
      
      @keyframes drawCheck {
        to { stroke-dashoffset: 0; }
      }
    </style>
  </head>
  <body>
    <div class="status-card">
      <div class="status-indicator">
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h1 class="status-title">Server Operational</h1>
      <p class="status-message">All systems are functioning normally</p>
      
      <div class="timestamp-container">
        <div class="timestamp-title">Server Timestamps (IST - Mumbai)</div>
        <div class="timestamp-value"><strong>Current Time:</strong> ${formatTime(now)}</div>
        <div class="timestamp-value"><strong>Uptime:</strong> ${formatUptime(uptimeSeconds)}</div>
        <div class="timestamp-value"><strong>Started At:</strong> ${formatTime(serverStartTime)}</div>
      </div>
      <div class="timezone-note">Timezone: Asia/Kolkata (UTC+05:30)</div>
    </div>
    
    <script>
      // Add subtle interactive animation
      document.querySelector('.status-card').addEventListener('mousemove', (e) => {
        const card = e.currentTarget;
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        
        card.style.transform = \`
          perspective(1000px)
          rotateX(\${y * 4}deg)
          rotateY(\${x * 8}deg)
          translateZ(10px)
        \`;
      });
      
      document.querySelector('.status-card').addEventListener('mouseleave', () => {
        const card = document.querySelector('.status-card');
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      });
    </script>
  </body>
  </html>
  `);
});
export default app;