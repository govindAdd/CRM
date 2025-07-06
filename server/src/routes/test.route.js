import express from "express";
import mongoose from "mongoose";
const router = express.Router();

router.get("/db-info", (req, res) => {
  const dbName = mongoose.connection.name;
  res.status(200).json({ dbName });
});

export default router;