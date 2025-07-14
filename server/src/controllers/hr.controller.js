import { HR } from "../models/hr.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";

/**
 * Create a new HR record for an employee
 */
const createHRRecord = asyncHandler(async (req, res) => {
  const { employee, noticePeriod, onboardingStatus, resignationStatus, isSuperAdmin } = req.body;

  // 1. Validate employee ID
  if (!employee || !isValidObjectId(employee)) {
    throw new ApiError(400, "A valid employee ID is required.");
  }

  // 2. Check if user exists
  const user = await User.findById(employee);
  if (!user) {
    throw new ApiError(404, "Employee not found.");
  }

  // 3. Prevent duplicate HR record
  const existingHR = await HR.findOne({ employee });
  if (existingHR) {
    throw new ApiError(409, "HR record already exists for this employee.");
  }

  // 4. Create HR record
  const newHR = await HR.create({
    employee,
    noticePeriod: noticePeriod?.trim() || null,
    onboardingStatus: onboardingStatus || "not-started",
    resignationStatus: resignationStatus || "none",
    isSuperAdmin: !!isSuperAdmin,
  });

  return res.status(201).json(
    new ApiResponse(201, newHR, "HR record created successfully.")
  );
});
/**
 * Update an existing HR record
 */
const updateHRRecord = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Soft delete an HR record
 */
const deleteHRRecord = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Restore a soft-deleted HR record
 */
const restoreHRRecord = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get HR record by employee ID
 */
const getHRByEmployeeId = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get all HR records (optionally filtered)
 */
const getAllHRRecords = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Search HR records by query (name, email, etc.)
 */
const searchHRRecords = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Bulk update HR records
 */
const bulkUpdateHRRecords = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * HR data (CSV, Excel, etc.)
 */
const exportHRData = asyncHandler(async (req, res) => {
  // TODO: Implement
});

// ===================== Leave Requests =====================

/**
 * Create a leave request for an employee
 */
const createLeaveRequest = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Update a leave request
 */
const updateLeaveRequest = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Delete a leave request
 */
const deleteLeaveRequest = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Approve a leave request
 */
const approveLeaveRequest = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Reject a leave request
 */
const rejectLeaveRequest = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get leave history for an employee
 */
const getEmployeeLeaveHistory = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get all leave requests (optionally filtered)
 */
const getAllLeaveRequests = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get all pending leave requests
 */
const getPendingLeaveRequests = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get leave requests by type
 */
const getLeaveRequestsByType = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get leave requests in a date range
 */
const getLeaveRequestsInDateRange = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get leave summary by status for an employee
 */
const getLeaveSummaryByStatus = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get leave requests pending approval by a user
 */
const getLeaveRequestsForApproval = asyncHandler(async (req, res) => {
  // TODO: Implement
});

// ===================== Onboarding/Resignation =====================

/**
 * Start onboarding for an employee
 */
const startOnboarding = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Update onboarding status
 */
const updateOnboardingStatus = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get all employees with onboarding in progress
 */
const getOnboardingEmployees = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Submit resignation for an employee
 */
const submitResignation = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Update resignation status
 */
const updateResignationStatus = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get all resigned employees
 */
const getResignedEmployees = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get all employees currently serving notice period
 */
const getActiveNoticePeriods = asyncHandler(async (req, res) => {
  // TODO: Implement
});

// ===================== SuperAdmin/HR Management =====================

/**
 * Get all superadmin HR records
 */
const getSuperAdmins = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Get all active (non-deleted, non-resigned) employees
 */
const getActiveEmployees = asyncHandler(async (req, res) => {
  // TODO: Implement
});

export {
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
  getAllLeaveRequests,
  getPendingLeaveRequests,
  getLeaveRequestsByType,
  getLeaveRequestsInDateRange,
  getLeaveSummaryByStatus,
  getLeaveRequestsForApproval,
  startOnboarding,
  updateOnboardingStatus,
  getOnboardingEmployees,
  submitResignation,
  updateResignationStatus,
  getResignedEmployees,
  getActiveNoticePeriods,
  getSuperAdmins,
  getActiveEmployees
};