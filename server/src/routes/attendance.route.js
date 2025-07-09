import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleBasedAccess } from "../middlewares/role.middleware.js";
import { createAttendance, updateAttendance } from "../controllers/attendance.controller.js";
const router = express.Router();

// Only verified users can create/update attendance
router.post(
  "/",
  verifyJWT,
  createAttendance
);

router.put(
  "/:id",
  verifyJWT,
  roleBasedAccess(["hr", "manager", "superadmin", 'head', 'admin', 'employee']),
  updateAttendance
);

export default router;