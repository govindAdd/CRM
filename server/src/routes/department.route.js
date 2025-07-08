import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleBasedAccess } from "../middlewares/role.middleware.js";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  assignDepartmentMember,
  removeDepartmentMember,
  getAllEmployeesInDepartment,
} from "../controllers/department.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyJWT,
  roleBasedAccess("admin", "superadmin"),
  createDepartment
);
router.get(
  "/",
  verifyJWT,
  roleBasedAccess("admin", "hr", "manager", "superadmin"),
  getAllDepartments
);
router.get(
  "/:id",
  verifyJWT,
  roleBasedAccess("admin", "hr", "manager", "superadmin"),
  getDepartmentById
);
router.put(
  "/:id",
  verifyJWT,
  roleBasedAccess("admin", "hr", "manager", "superadmin"),
  updateDepartment
);
router.delete(
  "/:id",
  verifyJWT,
  roleBasedAccess("admin", "superadmin"),
  deleteDepartment
);
router.put(
  "/:id/assign",
  verifyJWT,
  roleBasedAccess("admin", "superadmin"),
  assignDepartmentMember
);
router.put(
  "/:id/remove",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "manager", "hr"),
  removeDepartmentMember
);
router.get(
  "/:id/employees",
  verifyJWT,
  roleBasedAccess("admin", "superadmin", "hr", "manager"),
  getAllEmployeesInDepartment
);

export default router;
