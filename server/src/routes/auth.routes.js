// src/routes/auth.routes.js
import express from 'express';
import passport from 'passport';

const router = express.Router();

// Step 1: Redirect user to Google
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

// Step 2: Google redirects back here after authentication
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true
  }),
  (req, res) => {
    // ✅ On successful auth, redirect to frontend
    res.redirect("http://localhost:5173/"); // or /dashboard or /
  }
);

export default router;
