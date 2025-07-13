import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleBasedAccess } from "../middlewares/role.middleware.js";
import {
  createAttendance,
  updateAttendance,
  getAllAttendance,
  autoFillWeekOffs,
  deleteAllWeekOffs
} from "../controllers/attendance.controller.js";
const router = express.Router();

// Only verified users can create/update attendance
router.post("/", verifyJWT, createAttendance);
router.delete(
  "/delete-weekoffs",
  verifyJWT,
  roleBasedAccess("admin", "superadmin"),
  deleteAllWeekOffs
);
router.put(
  "/:id",
  verifyJWT,
  roleBasedAccess("hr", "manager", "superadmin", "head", "admin", "employee"),
  updateAttendance
);

//Get all attendance (paginated + filters + search + sort)
router.get(
  "/",
  verifyJWT,
  roleBasedAccess("hr", "manager", "superadmin", "head", "admin", "employee"),
  getAllAttendance
);
router.post(
  "/auto-fill-week-offs",
  verifyJWT,
  roleBasedAccess("admin", "hr", "superadmin", "manager"),
  autoFillWeekOffs
);


export default router;
