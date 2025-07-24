import express from "express";
import {
  createHRRecord,
  updateHRRecord,
  deleteHRRecord,
  restoreHRRecord,
  getHRByEmployeeId,
  getAllHRRecords,
  searchHRRecords,
  bulkUpdateHRRecords,
  exportHRData,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  getEmployeeLeaveHistory,
  getLeaveRequestsByType,
  getLeaveRequestsInDateRange,
  getLeaveSummaryByStatus,
  startOnboarding,
  updateOnboardingStatus,
  getOnboardingEmployees,
  submitResignation,
  getSuperAdmins,
  getAllLeaveRequestsForApproval,
  getActiveEmployees,
} from "../controllers/hr.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleBasedAccess } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// ===================== HR Management =====================
router.post(
  "/",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "hr", "manager"),
  createHRRecord
); // done
router.put(
  "/:id",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "hr", "manager"),
  updateHRRecord
); // done
router.delete(
  "/:id",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "hr", "manager"),
  deleteHRRecord
); // done
router.patch(
  "/:id/restore",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "hr", "manager"),
  restoreHRRecord
); // done
router.get("/employee/:employeeId", verifyJWT, getHRByEmployeeId);
router.get(
  "/",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "hr", "manager"),
  getAllHRRecords
); // done
router.get(
  "/search",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "hr", "manager"),
  searchHRRecords
); //done
router.patch(
  "/bulk",
  verifyJWT,
  roleBasedAccess("admin", "superadmin"),
  bulkUpdateHRRecords
);
router.get(
  "/export",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "hr", "manager"),
  exportHRData
);

// ===================== Leave Management =====================
router.post("/:id/leave", verifyJWT, createLeaveRequest); // done
router.put("/:id/leave/:leaveIndex", verifyJWT, updateLeaveRequest);
router.delete("/:id/leave/:leaveIndex", verifyJWT, deleteLeaveRequest);
router.patch(
  "/:id/leave/:leaveIndex/approve",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "hr", "manager"),
  approveLeaveRequest
); // done
router.get(
  "/getAllLeaveRequestsForApproval",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "hr", "manager"),
  getAllLeaveRequestsForApproval
); // done
router.patch(
  "/:id/leave/:leaveIndex/reject",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "hr", "manager"),
  rejectLeaveRequest
);

router.get("/:id/leave/history", verifyJWT, getEmployeeLeaveHistory);
router.get("/leaves/type/:type", verifyJWT, getLeaveRequestsByType);
router.get("/leaves/date-range", verifyJWT, getLeaveRequestsInDateRange);
router.get("/:id/leave/summary", verifyJWT, getLeaveSummaryByStatus);

// ===================== Onboarding & Resignation =====================
router.post(
  "/:id/onboarding/start",
  verifyJWT,
  roleBasedAccess("admin", "superadmin"),
  startOnboarding
);
router.patch(
  "/:id/onboarding/status",
  verifyJWT,
  roleBasedAccess("admin", "superadmin"),
  updateOnboardingStatus
);
router.get("/onboarding/in-progress", verifyJWT, getOnboardingEmployees);

router.post("/:id/resignation", verifyJWT, submitResignation);


// ===================== SuperAdmin & Active Employees =====================
router.get(
  "/superadmins",
  verifyJWT,
  roleBasedAccess("superadmin"),
  getSuperAdmins
);
router.get("/active", verifyJWT, getActiveEmployees);

// ===================== File Uploads (optional) =====================
// router.post("/import", verifyJWT, roleBasedAccess("admin", "superadmin"), upload.single("file"), importHRData);

export default router;