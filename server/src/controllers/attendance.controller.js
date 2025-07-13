import { Attendance } from "../models/attendance.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
const ALLOWED_STATUS = ["present", "absent", "half-day", "leave", "week-off"];
const ALLOWED_SHIFT = ["morning", "evening", "night"];
const ALLOWED_TYPE = ["manual", "biometric", "web", "mobile", "system"];
const MAX_REMARKS_LENGTH = 500;

const isValidLatLng = (val) => typeof val === "number" && !isNaN(val);
const isLatInRange = (lat) => lat >= -90 && lat <= 90;
const isLngInRange = (lng) => lng >= -180 && lng <= 180;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const createAttendance = asyncHandler(async (req, res) => {
  let {
    employee,
    date,
    status,
    shift,
    clockIn,
    clockOut,
    remarks,
    location,
    type,
    department,
  } = req.body;

  // Defensive: treat empty strings as missing
  employee = employee?.trim?.() || employee;
  status = status?.trim?.() || status;
  shift = shift?.trim?.() || shift;
  type = type?.trim?.() || type;
  remarks = remarks?.trim?.() || undefined;
  department = department?.trim?.() || department;

  // 1️⃣ Validate required fields
  if (!employee || !date || !status) {
    throw new ApiError(400, "Employee, date, and status are required");
  }

  // 2️⃣ Validate ObjectId format
  if (!isValidObjectId(employee)) {
    throw new ApiError(400, "Invalid employee ID");
  }
  if (department && !isValidObjectId(department)) {
    throw new ApiError(400, "Invalid department ID");
  }

  // 3️⃣ Validate and normalize date
  const attendanceDate = new Date(date);
  if (isNaN(attendanceDate.getTime())) {
    throw new ApiError(400, "Invalid date format");
  }
  // Normalize to midnight (start of day, local time)
  attendanceDate.setHours(0, 0, 0, 0);

  // 4️⃣ Enum validation
  if (!ALLOWED_STATUS.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Allowed: ${ALLOWED_STATUS.join(", ")}`
    );
  }
  if (shift && !ALLOWED_SHIFT.includes(shift)) {
    throw new ApiError(
      400,
      `Invalid shift. Allowed: ${ALLOWED_SHIFT.join(", ")}`
    );
  }
  if (type && !ALLOWED_TYPE.includes(type)) {
    throw new ApiError(
      400,
      `Invalid type. Allowed: ${ALLOWED_TYPE.join(", ")}`
    );
  }

  // 5️⃣ Location validation
  if (location) {
    if (
      typeof location !== "object" ||
      !isValidLatLng(location.lat) ||
      !isValidLatLng(location.lng) ||
      !isLatInRange(location.lat) ||
      !isLngInRange(location.lng)
    ) {
      throw new ApiError(
        400,
        "Invalid location. lat must be [-90,90], lng must be [-180,180]"
      );
    }
  }

  // 6️⃣ clockIn/clockOut validation
  let clockInDate, clockOutDate;
  if (clockIn) {
    clockInDate = new Date(clockIn);
    if (isNaN(clockInDate.getTime())) {
      throw new ApiError(400, "Invalid clockIn date");
    }
  }
  if (clockOut) {
    clockOutDate = new Date(clockOut);
    if (isNaN(clockOutDate.getTime())) {
      throw new ApiError(400, "Invalid clockOut date");
    }
  }
  if (clockInDate && clockOutDate && clockInDate > clockOutDate) {
    throw new ApiError(400, "clockIn must be before clockOut");
  }

  // 7️⃣ Remarks normalization
  if (remarks) {
    remarks = remarks.trim();
    if (remarks.length > MAX_REMARKS_LENGTH) {
      throw new ApiError(
        400,
        `Remarks too long (max ${MAX_REMARKS_LENGTH} chars)`
      );
    }
  }

  // 8️⃣ Prevent duplicate (employee + date)
  const existing = await Attendance.findOne({
    employee,
    date: attendanceDate,
  });
  if (existing) {
    throw new ApiError(
      409,
      "Attendance for this employee and date already exists"
    );
  }

  // 9️⃣ Build attendance object only with present fields
  const attendanceObj = {
    employee,
    date: attendanceDate,
    status,
  };
  if (shift) attendanceObj.shift = shift;
  if (typeof clockInDate !== "undefined") attendanceObj.clockIn = clockInDate;
  if (typeof clockOutDate !== "undefined")
    attendanceObj.clockOut = clockOutDate;
  if (remarks) attendanceObj.remarks = remarks;
  if (location) attendanceObj.location = location;
  if (type) attendanceObj.type = type;
  if (department) attendanceObj.department = department;

  // 🔟 Create attendance record
  const attendance = await Attendance.create(attendanceObj);

  // 1️⃣1️⃣ Populate employee + department for frontend
  const populated = await Attendance.findById(attendance._id)
    .populate("employee", "fullName avatar username")
    .populate("department", "name");

  return res
    .status(201)
    .json(new ApiResponse(201, populated, "Attendance created successfully"));
});

const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const isPrivileged = ["admin", "hr", "superadmin", "manager"].includes(
    user.role
  );

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid attendance ID");
  }

  // Find the attendance record
  const attendance = await Attendance.findById(id);
  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  // Employee can only update their own record for today
  if (!isPrivileged) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recordDate = new Date(attendance.date);
    recordDate.setHours(0, 0, 0, 0);
    if (
      String(attendance.employee) !== String(user._id) ||
      recordDate.getTime() !== today.getTime()
    ) {
      throw new ApiError(
        403,
        "You can only update your own attendance for today"
      );
    }
  }

  // Only allow updating certain fields
  let { status, shift, clockIn, clockOut, remarks, location, type } = req.body;

  // Defensive: treat empty strings as missing
  status = status?.trim?.() || status;
  shift = shift?.trim?.() || shift;
  type = type?.trim?.() || type;
  remarks = remarks?.trim?.() || undefined;

  // Validate and assign fields if present
  if (status) {
    if (!ALLOWED_STATUS.includes(status)) {
      throw new ApiError(
        400,
        `Invalid status. Allowed: ${ALLOWED_STATUS.join(", ")}`
      );
    }
    attendance.status = status;
  }
  if (shift) {
    if (!ALLOWED_SHIFT.includes(shift)) {
      throw new ApiError(
        400,
        `Invalid shift. Allowed: ${ALLOWED_SHIFT.join(", ")}`
      );
    }
    attendance.shift = shift;
  }
  let clockInDate, clockOutDate;
  let clockInChanged = false,
    clockOutChanged = false;
  if (clockIn) {
    clockInDate = new Date(clockIn);
    if (isNaN(clockInDate.getTime())) {
      throw new ApiError(400, "Invalid clockIn date");
    }
    attendance.clockIn = clockInDate;
    clockInChanged = true;
  }
  if (clockOut) {
    clockOutDate = new Date(clockOut);
    if (isNaN(clockOutDate.getTime())) {
      throw new ApiError(400, "Invalid clockOut date");
    }
    attendance.clockOut = clockOutDate;
    clockOutChanged = true;
  }
  if (clockInDate && clockOutDate && clockInDate > clockOutDate) {
    throw new ApiError(400, "clockIn must be before clockOut");
  }
  if (remarks) {
    remarks = remarks.trim();
    if (remarks.length > MAX_REMARKS_LENGTH) {
      throw new ApiError(
        400,
        `Remarks too long (max ${MAX_REMARKS_LENGTH} chars)`
      );
    }
    attendance.remarks = remarks;
  }
  if (location) {
    if (
      typeof location !== "object" ||
      !isValidLatLng(location.lat) ||
      !isValidLatLng(location.lng) ||
      !isLatInRange(location.lat) ||
      !isLngInRange(location.lng)
    ) {
      throw new ApiError(
        400,
        "Invalid location. lat must be [-90,90], lng must be [-180,180]"
      );
    }
    attendance.location = location;
  }
  if (type) {
    if (!ALLOWED_TYPE.includes(type)) {
      throw new ApiError(
        400,
        `Invalid type. Allowed: ${ALLOWED_TYPE.join(", ")}`
      );
    }
    attendance.type = type;
  }

  // Recalculate isLate and overtimeMinutes if clockIn or clockOut changed
  if (
    (clockInChanged || clockOutChanged) &&
    attendance.clockIn &&
    attendance.shift
  ) {
    const shiftStart = { morning: 9, evening: 14, night: 21 }[attendance.shift];
    const hour = attendance.clockIn.getHours();
    attendance.isLate = hour > shiftStart;
  }
  if (
    (clockInChanged || clockOutChanged) &&
    attendance.clockIn &&
    attendance.clockOut
  ) {
    const worked = Math.floor(
      (attendance.clockOut - attendance.clockIn) / 60000
    );
    attendance.overtimeMinutes = worked > 480 ? worked - 480 : 0;
  }

  await attendance.save();

  const populated = await Attendance.findById(attendance._id)
    .populate("employee", "fullName avatar username")
    .populate("department", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, populated, "Attendance updated successfully"));
});

const getAllAttendance = asyncHandler(async (req, res) => {
  // ===================== 1️⃣ Extract Query Parameters =====================
  let {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    search = "",
    sortBy = "date",
    sortOrder = "desc",
    status,
    department,
    employee,
    startDate,
    endDate,
  } = req.query;

  // ===================== 2️⃣ Normalize & Validate Inputs =====================
  page = Math.max(1, parseInt(page));
  limit = Math.min(parseInt(limit), MAX_LIMIT);

  search = search.trim().toLowerCase();

  if (status && !ALLOWED_STATUS.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Allowed: ${ALLOWED_STATUS.join(", ")}`
    );
  }

  if (employee && !isValidObjectId(employee)) {
    throw new ApiError(400, "Invalid employee ID");
  }

  if (department && !isValidObjectId(department)) {
    throw new ApiError(400, "Invalid department ID");
  }

  const dateFilter = {};
  if (startDate) {
    const from = new Date(startDate);
    if (isNaN(from.getTime())) throw new ApiError(400, "Invalid startDate");
    from.setHours(0, 0, 0, 0);
    dateFilter.$gte = from;
  }
  if (endDate) {
    const to = new Date(endDate);
    if (isNaN(to.getTime())) throw new ApiError(400, "Invalid endDate");
    to.setHours(23, 59, 59, 999);
    dateFilter.$lte = to;
  }

  // ===================== 3️⃣ Build MongoDB Query =====================
  const filter = { isDeleted: false };
  if (status) filter.status = status;
  if (employee) filter.employee = employee;
  if (department) filter.department = department;
  if (Object.keys(dateFilter).length > 0) filter.date = dateFilter;

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { remarks: { $regex: regex } },
      { status: { $regex: regex } },
      { shift: { $regex: regex } },
      { type: { $regex: regex } },
    ];
  }

  // ===================== 4️⃣ Sorting =====================
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // ===================== 5️⃣ Execute Query =====================
  const skip = (page - 1) * limit;

  const [records, totalRecords] = await Promise.all([
    Attendance.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("employee", "fullName avatar username role")
      .populate("department", "name"),
    Attendance.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  // ===================== 6️⃣ Respond =====================
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        records,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages,
        },
      },
      "Attendance records fetched successfully"
    )
  );
});

const autoFillWeekOffs = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  // 1️⃣ Validate dates
  if (!startDate || !endDate) {
    throw new ApiError(400, "Start and end dates are required");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end) || start > end) {
    throw new ApiError(400, "Invalid date range");
  }

  // Normalize to start of day
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // 2️⃣ Get all users with active departments
  const users = await User.find({ isBlocked: { $ne: true } }).select("_id");

  // 3️⃣ Iterate over each day and user
  const weekOffRecords = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const currentDate = new Date(d);

    // Check if it's Sunday (0 = Sunday)
    if (currentDate.getDay() !== 0) continue;

    for (const user of users) {
      // Prevent duplicates
      const existing = await Attendance.findOne({
        employee: user._id,
        date: currentDate,
      });

      if (!existing) {
        weekOffRecords.push({
          employee: user._id,
          date: new Date(currentDate),
          status: "week-off",
          type: "system",
        });
      }
    }
  }

  // 4️⃣ Bulk insert week-off attendance
  if (weekOffRecords.length > 0) {
    await Attendance.insertMany(weekOffRecords);
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        inserted: weekOffRecords.length,
        from: start.toISOString().split("T")[0],
        to: end.toISOString().split("T")[0],
      },
      "Week-offs auto-filled successfully"
    )
  );
});
export const deleteAllWeekOffs = asyncHandler(async (req, res) => {
  const result = await Attendance.deleteMany({
    status: { $regex: /^week-off$/i }, // Case-insensitive match
    type: "system",
    isDeleted: false,
  });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} 'week-off' records deleted successfully.`,
  });
});
export {
  createAttendance,
  updateAttendance,
  getAllAttendance,
  autoFillWeekOffs,
};
