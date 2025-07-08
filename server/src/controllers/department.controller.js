import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import { Department } from "../models/department.model.js";
import { User } from "../models/user.model.js";
import { Membership } from "../models/membership.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { roleBasedAccess as checkPermission } from "../middlewares/role.middleware.js";

// ======= Constants =======
const VALID_ROLES = ["superadmin", "admin", "manager","head", "employee",  "hr", "user"];
const SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "memberCount",
  "name",
  "code",
  "status",
  "description",
];

// ===================== CREATE =====================
const createDepartment = [
  checkPermission("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const { name, description, code } = req.body;
    if (!name || !code)
      throw new ApiError(400, "Department name and code are required");

    const existing = await Department.findOne({
      $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }],
      isDeleted: false,
    });
    if (existing)
      throw new ApiError(
        409,
        "Department with the same name or code already exists"
      );

    const department = await Department.create({
      name: name.trim(),
      description: description?.trim() || "",
      code: code.trim().toUpperCase(),
      status: "active",
      isDeleted: false,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, department, "Department created successfully"));
  }),
];

// ===================== READ (ALL) =====================
const getAllDepartments = asyncHandler(async (req, res) => {
  const {
    page = "1",
    limit = "10",
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    all = false,
    status,
  } = req.query;

  const isValidSortField = (field) => SORT_FIELDS.includes(field);
  const isValidSortOrder = (order) =>
    ["asc", "desc", "ascending", "descending", "1", "-1", 1, -1].includes(order);

  const isAll = String(all).toLowerCase() === "true";
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.max(parseInt(limit) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const sortField = isValidSortField(sortBy) ? sortBy : "createdAt";
  const sortDir = isValidSortOrder(sortOrder) ? sortOrder : "desc";
  const sort = {
    [sortField]: ["asc", "ascending", 1].includes(sortDir) ? 1 : -1,
  };

  const match = {
    isDeleted: false,
    ...(search && { name: { $regex: search, $options: "i" } }),
    ...(status && ["active", "inactive"].includes(status) && { status }),
  };

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "memberships",
        localField: "_id",
        foreignField: "department",
        as: "memberships",
      },
    },
    {
      $addFields: {
        memberCount: { $size: "$memberships" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "head",
        foreignField: "_id",
        as: "head",
      },
    },
    {
      $unwind: {
        path: "$head",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $sort: sort },
    ...(isAll ? [] : [{ $skip: skip }, { $limit: limitNum }]),
    {
      $project: {
        memberships: 0,
        __v: 0,
        "head.__v": 0,
        "head.password": 0,
        "head.createdAt": 0,
        "head.updatedAt": 0,
      },
    },
  ];

  const departments = await Department.aggregate(pipeline);
  const totalCount = await Department.countDocuments(match);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        results: departments,
      },
      "Departments fetched successfully"
    )
  );
});

// ===================== READ (By ID) =====================
const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid department ID");

  const department = await Department.findOne({
    _id: id,
    isDeleted: false,
  }).lean();
  if (!department) throw new ApiError(404, "Department not found");

  const memberships = await Membership.find({ department: id })
    .populate("user", "fullName email avatar role")
    .lean();

  const grouped = memberships.reduce((acc, member) => {
    if (!VALID_ROLES.includes(member.role)) return acc;
    acc[member.role] = acc[member.role] || [];
    acc[member.role].push(member.user);
    return acc;
  }, {});

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ...department, members: grouped },
        "Department details fetched successfully"
      )
    );
});

// ===================== UPDATE =====================
const updateDepartment = [
  checkPermission("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, status, code } = req.body;

    if (!isValidObjectId(id)) throw new ApiError(400, "Invalid department ID");

    const department = await Department.findOne({ _id: id, isDeleted: false });
    if (!department) throw new ApiError(404, "Department not found");

    if (name && name.trim() !== department.name) {
      const existsByName = await Department.findOne({
        name: name.trim(),
        isDeleted: false,
      });
      if (existsByName && existsByName._id.toString() !== id)
        throw new ApiError(409, "Another department with this name already exists");
      department.name = name.trim();
    }

    if (code && code.trim().toUpperCase() !== department.code) {
      const existsByCode = await Department.findOne({
        code: code.trim().toUpperCase(),
        isDeleted: false,
      });
      if (existsByCode && existsByCode._id.toString() !== id)
        throw new ApiError(409, "Another department with this code already exists");
      department.code = code.trim().toUpperCase();
    }

    if (typeof description === "string")
      department.description = description.trim();
    if (["active", "inactive"].includes(status)) department.status = status;

    await department.save();
    return res
      .status(200)
      .json(new ApiResponse(200, department, "Department updated successfully"));
  }),
];

// ===================== DELETE =====================
const deleteDepartment = [
  checkPermission("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const forceDelete = String(req.query.force).toLowerCase() === "true";

    if (!isValidObjectId(id)) throw new ApiError(400, "Invalid department ID");

    const department = await Department.findById(id);
    if (!department || (department.isDeleted && !forceDelete)) {
      throw new ApiError(404, "Department not found");
    }

    if (forceDelete) {
      await Promise.all([
        Department.findByIdAndDelete(id),
        Membership.deleteMany({ department: id }),
      ]);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Department permanently deleted"));
    }

    department.isDeleted = true;
    await department.save();
    return res
      .status(200)
      .json(new ApiResponse(200, department, "Department soft-deleted successfully"));
  }),
];

// ===================== ASSIGN MEMBER =====================
const assignDepartmentMember = [
  checkPermission("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const { id: departmentId } = req.params;
    const { userId, role } = req.body;

    if (!isValidObjectId(departmentId) || !isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid department or user ID");
    }
    if (!VALID_ROLES.includes(role))
      throw new ApiError(400, "Invalid role type");

    const [department, user] = await Promise.all([
      Department.findById(departmentId),
      User.findById(userId),
    ]);
    if (
      !department ||
      department.isDeleted ||
      department.status === "inactive"
    ) {
      throw new ApiError(404, "Department not available");
    }
    if (!user || !user.isActive)
      throw new ApiError(404, "User not found or inactive");

    // Remove user from all other departments
    await Membership.deleteMany({ user: userId, department: { $ne: departmentId } });

    const membership = await Membership.findOneAndUpdate(
      { user: userId, department: departmentId },
      { role },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          membership,
          `User assigned as ${role} successfully`
        )
      );
  }),
];

// ===================== REMOVE MEMBER =====================
const removeDepartmentMember = [
  checkPermission("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const { id: departmentId } = req.params;
    const { userId } = req.body;

    if (!isValidObjectId(departmentId) || !isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid department or user ID");
    }

    const result = await Membership.deleteOne({
      user: userId,
      department: departmentId,
    });
    if (result.deletedCount === 0)
      throw new ApiError(404, "Membership not found");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Member removed from department successfully"
        )
      );
  }),
];

// ===================== GET ASSIGNED MEMBERS =====================
const getDepartmentMembers = [
  checkPermission("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const { id: departmentId } = req.params;

    if (!isValidObjectId(departmentId)) {
      throw new ApiError(400, "Invalid department ID");
    }

    const department = await Department.findById(departmentId);
    if (!department || department.isDeleted || department.status === "inactive") {
      throw new ApiError(404, "Department not found or inactive");
    }

    const members = await Membership.aggregate([
      {
        $match: {
          department: new mongoose.Types.ObjectId(departmentId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          userId: "$userDetails._id",
          name: "$userDetails.name",
          gmail: "$userDetails.email",
          username: "$userDetails.username",
          phoneNumber: "$userDetails.phoneNumber",
          avatar: "$userDetails.avatar",
          role: "$role",
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(200, members, "Assigned members fetched successfully")
      );
  }),
];

// ===================== GET ALL EMPLOYEES IN DEPARTMENT =====================
const getAllEmployeesInDepartment = asyncHandler(async (req, res) => {
  const {
    page = "1",
    limit = "10",
    search = "",
    sortBy = "fullName",
    sortOrder = "asc",
  } = req.query;

  const { id: departmentId } = req.params;

  // ===== Validate Department ID =====
  if (!isValidObjectId(departmentId)) {
    throw new ApiError(400, "Invalid department ID");
  }

  const department = await Department.findOne({
    _id: departmentId,
    isDeleted: false,
    status: "active",
  }).lean();

  if (!department) {
    throw new ApiError(404, "Department not found or inactive");
  }

  // ===== Pagination & Sorting =====
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.max(parseInt(limit) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const sortField = ["fullName", "email", "username", "createdAt"].includes(sortBy)
    ? sortBy
    : "fullName";
  const sortDir = ["asc", "1", 1, "ascending"].includes(sortOrder) ? 1 : -1;

  // ===== Aggregation Pipeline =====
  const pipeline = [
    {
      $match: {
        department: new mongoose.Types.ObjectId(departmentId),
        role: { $in: VALID_ROLES },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $match: {
        ...(search && {
          $or: [
            { "userDetails.fullName": { $regex: search, $options: "i" } },
            { "userDetails.email": { $regex: search, $options: "i" } },
            { "userDetails.username": { $regex: search, $options: "i" } },
          ],
        }),
      },
    },
    {
      $project: {
        _id: 0,
        userId: "$userDetails._id",
        fullName: "$userDetails.fullName",
        email: "$userDetails.email",
        username: "$userDetails.username",
        phone: "$userDetails.phone",
        avatar: "$userDetails.avatar",
        role: "$role",
        designation: "$userDetails.designation",
        isActive: "$userDetails.isActive",
        joinedAt: "$userDetails.doj",
        createdAt: "$userDetails.createdAt",
      },
    },
    { $sort: { [sortField]: sortDir } },
    { $skip: skip },
    { $limit: limitNum },
  ];

  // ===== Execute Aggregation =====
  const [results, totalCount] = await Promise.all([
    mongoose.model("Membership").aggregate(pipeline),
    mongoose.model("Membership").countDocuments({
      department: department._id,
      role: { $in: VALID_ROLES },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        department: {
          id: department._id,
          name: department.name,
          code: department.code,
        },
        results,
      },
      "Department employees fetched successfully"
    )
  );
});


// ===================== EXPORT =====================
export {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  assignDepartmentMember,
  removeDepartmentMember,
  getDepartmentMembers,
  getAllEmployeesInDepartment,
};