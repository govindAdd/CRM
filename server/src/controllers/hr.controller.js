import { HR } from "../models/hr.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import * as XLSX from 'xlsx';

/**
 * Create a new HR record for an employee
 */
const createHRRecord = asyncHandler(async (req, res) => {
  const {
    employee, // Can be ID or name
    noticePeriod,
    onboardingStatus,
    resignationStatus,
    isSuperAdmin,
  } = req.body;

  let user;

  // 1. Validate and resolve employee
  if (!employee) {
    throw new ApiError(400, "Employee identifier (ID or name) is required.");
  }

  if (isValidObjectId(employee)) {
    user = await User.findById(employee);
  } else {
    user = await User.findOne({
      username: { $regex: new RegExp(`^${employee}$`, "i") },
    });
  }

  if (!user) {
    throw new ApiError(404, "Employee not found.");
  }
  const userId = user?._id;
  // 2. Prevent duplicate HR record
  const existingHR = await HR.findOne({ employee: userId });
  if (existingHR) {
    throw new ApiError(409, "HR record already exists for this employee.");
  }

  // 3. Create HR record
  const newHR = await HR.create({
    employee: userId,
    noticePeriod: noticePeriod?.trim() || null,
    onboardingStatus: onboardingStatus || "not-started",
    resignationStatus: resignationStatus || "none",
    isSuperAdmin: !!isSuperAdmin,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newHR, "HR record created successfully."));
});

/**
 * Update an existing HR record
 */
const updateHRRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Validate HR record ID
  if (!id || !isValidObjectId(id)) {
    throw new ApiError(400, "Invalid HR record ID.");
  }
  // 2. Find the HR record
  const existingRecord = await HR.findById(id);
  if (!existingRecord) {
    throw new ApiError(404, "HR record not found.");
  }
  // 3. Allowed fields to update
  const {
    noticePeriod,
    onboardingStatus,
    resignationStatus,
    position,
    isSuperAdmin,
  } = req.body;
  // 4. Update only if field is provided
  if (noticePeriod !== undefined)
    existingRecord.noticePeriod = noticePeriod.trim();
  if (onboardingStatus !== undefined)
    existingRecord.onboardingStatus = onboardingStatus;
  if (resignationStatus !== undefined)
    existingRecord.resignationStatus = resignationStatus;
  if (position !== undefined) existingRecord.position = position.trim();
  if (isSuperAdmin !== undefined) existingRecord.isSuperAdmin = isSuperAdmin;
  // 5. Save the updated record
  await existingRecord.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, existingRecord, "HR record updated successfully.")
    );
});

/**
 * Soft delete an HR record
 */
const deleteHRRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Validate ObjectId
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid HR record ID.");
  }

  // 2. Find the active HR record (isDeleted: false is implied by pre-hook)
  const hrRecord = await HR.findById(id);

  if (!hrRecord) {
    throw new ApiError(404, "HR record not found.");
  }

  // 3. Check if already deleted
  if (hrRecord.isDeleted) {
    throw new ApiError(400, "HR record is already deleted.");
  }

  // 4. Perform soft delete
  hrRecord.isDeleted = true;
  await hrRecord.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        hrRecord,
        "HR record soft deleted successfully."
      )
    );
});

/**
 * Restore a soft-deleted HR record
 */
const restoreHRRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid HR record ID.");
  }

  // Include soft-deleted record by explicitly querying isDeleted: true
  const hrRecord = await HR.findOne({ _id: id, isDeleted: true });

  if (!hrRecord) {
    throw new ApiError(404, "HR record not found.");
  }

  // Already active
  if (!hrRecord.isDeleted) {
    throw new ApiError(400, "HR record is already active.");
  }

  // Restore
  hrRecord.isDeleted = false;
  await hrRecord.save();

  return res
    .status(200)
    .json(new ApiResponse(200, hrRecord, "HR record restored successfully."));
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
  let {
    page = 1,
    limit = 20,
    deleted,
    resigned,
    onboardingStatus,
    search,
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 20;

  const query = {};

  // Filter: Deleted status
  if (deleted === "true") query.deleted = true;
  else if (deleted === "false") query.deleted = false;

  // Filter: Resignation status
  if (resigned === "true") query.resignationStatus = "resigned";
  else if (resigned === "false") query.resignationStatus = { $ne: "resigned" };

  // Filter: Onboarding status
  if (onboardingStatus) {
    const allowedStatuses = ["not-started", "in-progress", "completed"];
    if (!allowedStatuses.includes(onboardingStatus)) {
      throw new ApiError(400, "Invalid onboardingStatus filter.");
    }
    query.onboardingStatus = onboardingStatus;
  }

  // Search: by name, email, username (in User collection)
  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    const matchedUsers = await User.find({
      $or: [{ name: regex }, { email: regex }, { username: regex }],
    }).select("_id");

    if (matchedUsers.length === 0) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            total: 0,
            page,
            limit,
            records: [],
          },
          "No matching HR records found."
        )
      );
    }

    const matchedUserIds = matchedUsers.map((user) => user._id);
    query.employee = { $in: matchedUserIds };
  }

  // Count total documents matching query
  const total = await HR.countDocuments(query);

  // Retrieve paginated data
  const records = await HR.find(query)
    .populate("employee", "name email username") // project specific fields only
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
        records,
      },
      "HR records fetched successfully."
    )
  );
});

/**
 * Search HR records by query (name, email, etc.)
 */
const searchHRRecords = asyncHandler(async (req, res) => {
  const {
    q = "",
    deleted,
    onboardingStatus,
    resignationStatus,
    page = 1,
    limit = 10,
  } = req.query;

  const trimmedQuery = q.trim();
  const currentPage = Math.max(parseInt(page), 1);
  const resultLimit = Math.min(Math.max(parseInt(limit), 1), 100);
  const skip = (currentPage - 1) * resultLimit;

  // Optional regex search
  const matchConditions = [];

  if (trimmedQuery) {
    const regex = new RegExp(trimmedQuery, "i");
    matchConditions.push({
      $or: [
        { "employee.name": regex },
        { "employee.email": regex },
        { "employee.username": regex },
      ],
    });
  }

  if (deleted === "true") matchConditions.push({ isDeleted: true });
  else if (deleted === "false") matchConditions.push({ isDeleted: false });

  if (onboardingStatus) matchConditions.push({ onboardingStatus });
  if (resignationStatus) matchConditions.push({ resignationStatus });

  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "employee",
        foreignField: "_id",
        as: "employee",
      },
    },
    { $unwind: "$employee" },
    ...(matchConditions.length > 0
      ? [{ $match: { $and: matchConditions } }]
      : []),
    {
      $project: {
        _id: 1,
        noticePeriod: 1,
        onboardingStatus: 1,
        resignationStatus: 1,
        isSuperAdmin: 1,
        isDeleted: 1,
        createdAt: 1,
        updatedAt: 1,
        employee: {
          _id: 1,
          name: 1,
          email: 1,
          username: 1,
          department: 1,
          avatarUrl: 1,
        },
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: resultLimit },
  ];

  const results = await HR.aggregate(pipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, results, "Search successful."));
});

/**
 * Bulk update HR records
 */
const bulkUpdateHRRecords = asyncHandler(async (req, res) => {
  // TODO: Implement
});

/**
 * Export HR data (CSV or Excel)
 */
const exportHRData = asyncHandler(async (req, res) => {
  const format = req.query.format || "excel";

  const hrRecords = await HR.find()
    .populate("employee", "name email username department")
    .lean();

  if (!hrRecords || hrRecords.length === 0) {
    throw new ApiError(404, "No HR records found to export.");
  }

  const exportData = hrRecords.map((record) => ({
    Name: record?.employee?.name || "",
    Username: record?.employee?.username || "",
    Email: record?.employee?.email || "",
    Department: record?.employee?.department || "",
    NoticePeriod: record.noticePeriod || "",
    OnboardingStatus: record.onboardingStatus || "",
    ResignationStatus: record.resignationStatus || "",
    IsSuperAdmin: record.isSuperAdmin ? "Yes" : "No",
    IsDeleted: record.isDeleted ? "Yes" : "No",
    CreatedAt: new Date(record.createdAt).toLocaleString(),
    UpdatedAt: new Date(record.updatedAt).toLocaleString(),
  }));

  // Excel
if (format === "excel") {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "HR Records");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", "attachment; filename=hr_records.xlsx");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

  return res.status(200).send(buffer);
}

  // CSV
  if (format === "csv") {
    const { Parser } = await import("json2csv");
    const parser = new Parser();
    const csv = parser.parse(exportData);

    res.setHeader("Content-Disposition", "attachment; filename=hr_records.csv");
    res.setHeader("Content-Type", "text/csv");

    return res.status(200).send(csv);
  }

  throw new ApiError(400, "Invalid export format. Use 'csv' or 'excel'.");
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
  let {
    page = 1,
    limit = 20,
    search = "",
    department,
    role,
    format, // only "excel" is supported
  } = req.query;

  page = Math.max(parseInt(page), 1);
  limit = Math.min(Math.max(parseInt(limit), 1), 100);
  const skip = (page - 1) * limit;
  const isExport = format === "excel";

  const pipeline = [];

  // Match active HR records
  pipeline.push({
    $match: {
      isDeleted: false,
      resignationStatus: { $nin: ["resigned", "accepted"] },
    },
  });

  // Join with users
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "employee",
      foreignField: "_id",
      as: "employeeDetails",
    },
  });
  pipeline.push({ $unwind: "$employeeDetails" });

  // Filter by user.isActive
  pipeline.push({ $match: { "employeeDetails.isActive": true } });

  // Search support
  if (search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    pipeline.push({
      $match: {
        $or: [
          { "employeeDetails.fullName": regex },
          { "employeeDetails.email": regex },
          { "employeeDetails.username": regex },
        ],
      },
    });
  }

  // Join with memberships
  pipeline.push({
    $lookup: {
      from: "memberships",
      localField: "employee",
      foreignField: "user",
      as: "memberships",
    },
  });

  // Filter by role
  if (role) {
    pipeline.push({
      $match: {
        "memberships.role": role,
      },
    });
  }

  // Join with departments
  pipeline.push({
    $lookup: {
      from: "departments",
      localField: "memberships.department",
      foreignField: "_id",
      as: "departments",
    },
  });

  // Filter by department ID
  if (department && mongoose.Types.ObjectId.isValid(department)) {
    pipeline.push({
      $match: {
        "departments._id": new mongoose.Types.ObjectId(department),
      },
    });
  }

  // Final projection
  pipeline.push({
    $project: {
      _id: 1,
      noticePeriod: 1,
      onboardingStatus: 1,
      resignationStatus: 1,
      isSuperAdmin: 1,
      createdAt: 1,
      updatedAt: 1,
      employee: {
        _id: "$employeeDetails._id",
        fullName: "$employeeDetails.fullName",
        username: "$employeeDetails.username",
        email: "$employeeDetails.email",
        avatar: "$employeeDetails.avatar",
        role: "$employeeDetails.role",
        designation: "$employeeDetails.designation",
        doj: "$employeeDetails.doj",
        phone: "$employeeDetails.phone",
      },
      memberships: {
        $map: {
          input: "$memberships",
          as: "m",
          in: {
            role: "$$m.role",
            departmentId: "$$m.department",
          },
        },
      },
      departments: {
        $map: {
          input: "$departments",
          as: "d",
          in: {
            _id: "$$d._id",
            name: "$$d.name",
            code: "$$d.code",
            status: "$$d.status",
          },
        },
      },
    },
  });

  // Handle Excel Export (no pagination)
  if (isExport) {
    const exportData = await HR.aggregate(pipeline);
    if (!exportData.length) throw new ApiError(404, "No active employees found");

    const flatData = exportData.map((item) => ({
      Name: item.employee.fullName,
      Username: item.employee.username,
      Email: item.employee.email,
      Phone: item.employee.phone,
      Department: item.departments.map((d) => d.name).join(", "),
      Role: item.memberships.map((m) => m.role).join(", "),
      Onboarding: item.onboardingStatus,
      Resignation: item.resignationStatus,
      NoticePeriod: item.noticePeriod,
      DOJ: item.employee.doj ? new Date(item.employee.doj).toLocaleDateString() : "",
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(flatData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Active Employees");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=active_employees.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    return res.status(200).send(buffer);
  }

  // Count total records for pagination
  const totalRecords = await HR.aggregate([...pipeline, { $count: "count" }]);
  const total = totalRecords?.[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  pipeline.push({ $sort: { "employee.fullName": 1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  const paginated = await HR.aggregate(pipeline);

  const responseData = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    records: paginated,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, responseData, "Active employees fetched successfully"));
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
  getActiveEmployees,
};
