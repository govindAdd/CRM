import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Department } from "../models/department.model.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateOTP } from "../utils/generateOTP.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Membership } from "../models/membership.model.js";
import mongoose from "mongoose";

const VALID_ROLES = ["superadmin", "admin", "manager","head", "employee",  "hr", "user"];
// Helper to generate access & refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

// ============================ Register New User ============================
const registerUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    username,
    password,
    phone,
    gender,
    dob,
    designation,
  } = req.body;

  if ([fullName, email, username, password].some((f) => !f?.trim())) {
    throw new ApiError(400, "Required fields missing");
  }

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) throw new ApiError(409, "Email or username already exists");

  const avatarPath = req.files?.avatar?.[0]?.path;
  if (!avatarPath) throw new ApiError(400, "Avatar is required");

  const avatar = await uploadOnCloudinary(avatarPath);
  if (!avatar?.url) throw new ApiError(400, "Avatar upload failed");


  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    phone,
    gender,
    dob,
    designation,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

/// ============================ Login ============================
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Require either email or username
  if (!email && !username) {
    throw new ApiError(400, "Either email or username is required");
  }

  // Find user by email or username
  const user = await User.findOne({
    $or: [
      { email: email?.toLowerCase() },
      { username: username?.toLowerCase() },
    ],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Track login
  user.loginHistory.unshift({
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  user.loginHistory = user.loginHistory.slice(0, 2);
  await user.save({ validateBeforeSave: false });

  // Remove sensitive fields from returned user
  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Set cookies (secure: true in production)
  const cookieOptions = {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    // sameSite: "strict",
  };

  // Send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: safeUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// ============================ Logout ============================
const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Unauthorized request - user not found");
  }

  // Clear refreshToken from DB
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const cookieOptions = {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production", // Only true in production
    // sameSite: "Lax", // Helps with CSRF
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// ============================ Update Logged-In Profile ============================
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const fields = [
    "fullName",
    "phone",
    "gender",
    "dob",
    "bio",
    "address",
    "designation",
  ];
  fields.forEach((field) => req.body[field] && (user[field] = req.body[field]));

  const avatarPath = req.files?.avatar?.[0]?.path;
  if (avatarPath) {
    await deleteOnCloudinary(user.avatar);
    const avatar = await uploadOnCloudinary(avatarPath);
    user.avatar = avatar.url;
  }

  await user.save();
  res.status(200).json(new ApiResponse(200, user, "Profile updated"));
});

// ============================ Change Current Password ============================
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!(await user.isPasswordCorrect(oldPassword)))
    throw new ApiError(400, "Old password incorrect");
  user.password = newPassword;
  await user.save();
  res.status(200).json(new ApiResponse(200, {}, "Password updated"));
});

// ============================ Forgot Password (Send Token) ============================
const requestPasswordForget = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string" || !email.trim()) {
    throw new ApiError(400, "Valid email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(404, "User with this email does not exist");

  // Generate password reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.CORS_ORIGIN}/reset-password/${resetToken}`;
  console.log("url for reset.----", resetURL);
  const message = `
You requested a password reset. Click the link below to set a new password:\n\n
${resetURL}\n\n
This link will expire in 5 minutes.\n
If you did not request this, you can ignore this email.
  `;

  try {
await sendEmail({
  to: user.email,
  subject: "Password Reset Link",
  name: user.fullName,
  resetUrl: resetURL, 
});


    res
      .status(200)
      .json(
        new ApiResponse(200, {}, `Reset password email sent to ${user.email}`)
      );
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, "Failed to send reset email");
  }
});

// ============================ Reset Password (With Token) ============================
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    throw new ApiError(400, "Both password fields are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Token is invalid or expired");

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Password reset successful. Logged in with new credentials."
      )
    );
});

// ============================ Get All Users (Admin) ============================
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken");
  res.status(200).json(new ApiResponse(200, users, "All users fetched"));
});

// ============================ Update User Role (Privileged Roles Only) ============================
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  const validRoles = ["user", "hr", "manager", "superadmin", "head", "admin", "employee"];
  const allowedToChangeRoles = ["hr", "manager", "admin", "superadmin"];

  // 1. Restrict access to only specific roles
  if (!allowedToChangeRoles.includes(req.user.role)) {
    throw new ApiError(403, "You do not have permission to update user roles");
  }

  // 2. Validate target role
  if (!validRoles.includes(role)) {
    throw new ApiError(400, `Invalid role specified. Allowed roles: ${validRoles.join(", ")}`);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 3. Prevent unauthorized modification of an existing superadmin
  if (user.role === "superadmin" && req.user.role !== "superadmin") {
    throw new ApiError(403, "Only a superadmin can modify the role of another superadmin");
  }

  // 4. Prevent assigning superadmin unless requester is also superadmin
  if (role === "superadmin" && req.user.role !== "superadmin") {
    throw new ApiError(403, "Only a superadmin can assign the superadmin role");
  }

  user.role = role;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, user, `User role updated to '${role}' successfully`)
  );
});

// ============================ Public Profile by Username ============================
const getPublicUserProfile = asyncHandler(async (req, res) => {
  const username = req.params.username.toLowerCase();

  const result = await User.aggregate([
    {
      $match: {
        username: username,
        // 🔓 Removed role-based filtering to allow all roles
      },
    },
    {
      $project: {
        fullName: 1,
        designation: 1,
        phone: 1,
        email: 1,
        avatar: 1,
        role: 1,
      },
    },
    {
      $lookup: {
        from: "users",
        pipeline: [
          { $match: { role: "hr" } },
          { $project: { _id: 0, fullName: 1, email: 1, avatar: 1 } },
          { $limit: 1 },
        ],
        as: "hr",
      },
    },
    {
      $addFields: {
        hr: { $arrayElemAt: ["$hr", 0] },
      },
    },
  ]);

  if (!result || result.length === 0) {
    throw new ApiError(404, "User not found");
  }

  const { hr, ...employee } = result[0];

  return res
    .status(200)
    .json(new ApiResponse(200, { employee, hr }, "Public user profile"));
});

// ============================ Get Current Logged-In User ============================
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched Successfully"));
});

// ============================ Delete User (Privileged Roles Only) ============================
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requester = req.user;

  // Fetch the target user
  const targetUser = await User.findById(id);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // 🔐 Allowed roles to delete users
  const privilegedRoles = ["superadmin", "admin", "manager", "hr"];
  if (!privilegedRoles.includes(requester.role)) {
    throw new ApiError(403, "You do not have permission to delete users");
  }

  // 🛡 Prevent deleting a superadmin unless you're also superadmin
  if (targetUser.role === "superadmin" && requester.role !== "superadmin") {
    throw new ApiError(403, "Only a superadmin can delete another superadmin");
  }

  // 🧹 Clean up avatar from Cloudinary
  if (targetUser.avatar) {
    await deleteOnCloudinary(targetUser.avatar);
  }

  // ❌ Hard delete from DB
  await User.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, {}, `User '${targetUser.fullName}' deleted successfully`)
  );
});

// ===================== GET USER DEPARTMENTS =====================
const getUserDepartment = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId).select("fullName email avatar isActive").lean();
  if (!user || !user.isActive) {
    throw new ApiError(404, "User not found or inactive");
  }

  const departments = await Membership.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        role: { $in: VALID_ROLES }
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentDetails",
      },
    },
    { $unwind: "$departmentDetails" },
    {
      $match: {
        "departmentDetails.isDeleted": false,
        "departmentDetails.status": "active",
      },
    },
    {
      $project: {
        _id: 0,
        departmentId: "$departmentDetails._id",
        name: "$departmentDetails.name",
        code: "$departmentDetails.code",
        role: "$role",
        description: "$departmentDetails.description",
        status: "$departmentDetails.status",
        joinedAt: "$createdAt",
      },
    },
    { $sort: { name: 1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
        },
        totalDepartments: departments.length,
        departments,
      },
      "User's department memberships fetched successfully"
    )
  );
});

// ============================ Module Export ============================
export {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
  changeCurrentPassword,
  requestPasswordForget,
  resetPassword,
  getAllUsers,
  updateUserRole,
  getPublicUserProfile,
  getCurrentUser,
  deleteUser,
  getUserDepartment
};
