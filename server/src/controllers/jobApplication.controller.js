import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { JobApplication } from "../models/jobApplication.model.js";
import { Membership } from "../models/membership.model.js";
import { Department } from "../models/department.model.js";
import { STAGES } from "../models/jobApplication.model.js";
import { ARCHIVE_REASONS } from "../models/jobApplication.model.js";
import { REJECTION_REASONS } from "../models/jobApplication.model.js";
import { User } from "../models/user.model.js";

function generateRandomPassword(fullName = "") {
  const year = new Date().getFullYear().toString().slice(-2); // '25' from 2025
  const firstName = fullName.trim().split(" ")[0] || "user";
  return `${firstName}addgod@${year}`;
}

const generateWelcomeEmailTemplate = ({ fullName, email, password }) => `
<div style="max-width:600px;margin:auto;font-family:'Segoe UI',Roboto,sans-serif;color:#333;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">
  <div style="background:linear-gradient(135deg,#ffffff,#f3f4f6);padding:30px;text-align:center;border-bottom:1px solid #e5e7eb;">
    <div style="background-color:#fff;padding:10px;border-radius:12px;display:inline-block;">
      <img src="${COMPANY_INFO.LOGO_URL}" alt="${COMPANY_INFO.LEGAL_NAME}" style="height:65px;margin-bottom:10px;border-radius:50%;" />
    </div>
    <h1 style="margin:10px 0 0;color:#111;font-size:24px;">${COMPANY_INFO.LEGAL_NAME}</h1>
    <p style="font-size:14px;color:#666;margin-top:4px;">${COMPANY_INFO.TAGLINE}</p>
  </div>

  <div style="padding:30px;">
    <h2 style="color:#333;margin-top:0;">Hi ${fullName},</h2>
    <p style="font-size:15px;line-height:1.6;">
      We're excited to welcome you to the team! Your employee account has been created.
    </p>
    <p style="font-size:15px;line-height:1.6;">
      You can log in using the following credentials:
    </p>

    <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:20px 0;font-size:15px;">
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${password}</p>
    </div>

    <p style="font-size:14px;">
      For your security, please reset your password immediately after logging in.
    </p>

    <p style="font-size:14px;margin-top:30px;">
      If you have any questions, feel free to contact us anytime.
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />

    <p style="font-size:14px;text-align:center;">
      Need help? <a href="mailto:${COMPANY_INFO.CONTACT.EMAIL}" style="color:#6c5ce7;text-decoration:none;">Contact support</a>
    </p>
  </div>

  <div style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#999;">
    <p style="margin:0;">Stay connected</p>
    <div style="margin:10px 0;">
      <a href="${COMPANY_INFO.SOCIALS.FACEBOOK || "#"}" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="20" alt="Facebook" />
      </a>
      <a href="${COMPANY_INFO.SOCIALS.INSTAGRAM}" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="20" alt="Instagram" />
      </a>
      <a href="${COMPANY_INFO.SOCIALS.TWITTER}" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="20" alt="Twitter" />
      </a>
      <a href="${COMPANY_INFO.SOCIALS.LINKEDIN}" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="20" alt="LinkedIn" />
      </a>
    </div>
    <p style="margin:10px 0 0;">${COMPANY_INFO.COPYRIGHT}</p>
    <p style="margin:2px 0;">${COMPANY_INFO.HEADQUARTERS.CITY}, ${COMPANY_INFO.HEADQUARTERS.COUNTRY}</p>
    <p style="margin:2px 0;">${COMPANY_INFO.CONTACT.PHONE} | <a href="mailto:${COMPANY_INFO.CONTACT.EMAIL}" style="color:#6c5ce7;text-decoration:none;">${COMPANY_INFO.CONTACT.EMAIL}</a></p>
    <p style="margin:2px 0;"><a href="${COMPANY_INFO.CONTACT.WEBSITE}" style="color:#6c5ce7;text-decoration:none;">${COMPANY_INFO.CONTACT.WEBSITE}</a></p>
  </div>
</div>
`;
// chatGPT uri https://chatgpt.com/s/t_6885dc6c5710819188b35e078acffa0c
// POST /api/job-applications
const createJobApplication = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    location,
    resumeUrl,
    source = "other",
    department,
    membership,
  } = req.body;

  const createdBy = req.user?._id;

  // Validate fields
  if (
    !fullName ||
    !email ||
    !phone ||
    !resumeUrl ||
    !membership ||
    !createdBy
  ) {
    throw new ApiError(400, "Missing required fields");
  }

  if (!isValidObjectId(membership)) {
    throw new ApiError(400, "Invalid membership ID");
  }

  if (department && !isValidObjectId(department)) {
    throw new ApiError(400, "Invalid department ID");
  }

  // Check if membership exists
  const membershipDoc = await Membership.findById(membership);
  if (!membershipDoc) {
    throw new ApiError(404, "Membership not found");
  }

  // Optional: check department
  if (department) {
    const dept = await Department.findById(department);
    if (!dept) {
      throw new ApiError(404, "Department not found");
    }
  }

  // Check for duplicate application
  const existing = await JobApplication.findOne({
    $or: [
      { email: new RegExp(`^${email}$`, "i") },
      { phone: new RegExp(`^${phone}$`) },
    ],
  });

  if (existing) {
    // Archive this incoming duplicate record
    await JobApplication.create({
      fullName,
      email,
      phone,
      location,
      resumeUrl,
      source,
      membership,
      department,
      createdBy,
      archived: true,
      archiveReason: "duplicate_profile",
      isDuplicate: true,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          existing,
          "Duplicate found, continuing with original"
        )
      );
  }

  // Create a fresh application
  const application = await JobApplication.create({
    fullName,
    email,
    phone,
    location,
    resumeUrl,
    source,
    membership,
    department,
    createdBy,
    currentStage: "application_review",
    stageHistory: [
      {
        stage: "application_review",
        updatedBy: createdBy,
        notes: "Application submitted",
      },
    ],
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, application, "Job application created successfully")
    );
});

// GET /api/job-applications/check-duplicate?q=xxx
const checkDuplicateApplication = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    throw new ApiError(400, "Query parameter `q` (email or phone) is required");
  }

  // Use query helper from schema
  const existing = await JobApplication.findOne().byEmailOrPhone(q);

  if (!existing) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No duplicate application found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, existing, "Duplicate application found"));
});

// PATCH /api/job-applications/:id/move-stage
// Body: { nextStage: "face_to_face", notes?: "Passed phone screen" }
const moveToNextStage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nextStage, notes } = req.body;
  const userId = req.user?._id;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job application ID");
  }

  if (!nextStage || !STAGES.includes(nextStage)) {
    throw new ApiError(400, "Invalid or missing nextStage");
  }

  const application = await JobApplication.findById(id);
  if (!application) {
    throw new ApiError(404, "Job application not found");
  }

  const currentStageIndex = STAGES.indexOf(application.currentStage);
  const nextStageIndex = STAGES.indexOf(nextStage);

  if (nextStageIndex <= currentStageIndex) {
    throw new ApiError(400, `Cannot move to previous or same stage`);
  }

  // Example: prevent skipping more than 1 stage unless admin
  if (nextStageIndex - currentStageIndex > 2 && !req.user?.isSuperAdmin) {
    throw new ApiError(403, "Skipping multiple stages is not allowed");
  }

  // Update stage
  application.currentStage = nextStage;
  application.stageHistory.push({
    stage: nextStage,
    updatedBy: userId,
    notes,
  });

  await application.save();

  return res
    .status(200)
    .json(new ApiResponse(200, application, `Moved to stage: ${nextStage}`));
});

// PATCH /api/job-applications/:id/stage-note
// Body: { notes: "Candidate was late to interview" }
const addStageNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const userId = req.user?._id;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job application ID");
  }

  if (!notes || notes.trim().length < 2) {
    throw new ApiError(400, "Note is too short");
  }

  const application = await JobApplication.findById(id);
  if (!application) {
    throw new ApiError(404, "Job application not found");
  }

  // Append a note for the current stage
  application.stageHistory.push({
    stage: application.currentStage,
    updatedBy: userId,
    notes: notes.trim(),
  });

  await application.save();

  return res
    .status(200)
    .json(new ApiResponse(200, application, "Stage note added successfully"));
});

// PATCH /api/job-applications/:id/reject
// Body: { rejectionReason: "not_qualified", notes?: "Candidate lacked experience." }
const rejectAtStage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rejectionReason, notes } = req.body;
  const userId = req.user?._id;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job application ID");
  }

  if (!rejectionReason || !REJECTION_REASONS.includes(rejectionReason)) {
    throw new ApiError(400, "Invalid rejection reason");
  }

  const application = await JobApplication.findById(id);
  if (!application) {
    throw new ApiError(404, "Job application not found");
  }

  if (application.status === "hired") {
    throw new ApiError(400, "Cannot reject a hired candidate");
  }

  if (application.status === "not_hired") {
    throw new ApiError(400, "Candidate is already rejected");
  }

  const currentStage = application.currentStage;
  const archiveReason = ARCHIVE_REASONS[currentStage] || "other";

  application.status = "not_hired";
  application.rejectionReason = rejectionReason;
  application.archived = true;
  application.archiveReason = archiveReason;

  application.stageHistory.push({
    stage: currentStage,
    updatedBy: userId,
    notes: notes ? `[REJECTED] ${notes}` : "[REJECTED]",
  });

  await application.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        application,
        `Candidate rejected at stage: ${currentStage}`
      )
    );
});

// PATCH /api/job-applications/:id/rollback
// Body: { reason: "Stage updated by mistake" }
const rollbackStage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user?._id;
  const isAdmin = req.user?.isSuperAdmin;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job application ID");
  }

  const application = await JobApplication.findById(id);
  if (!application) {
    throw new ApiError(404, "Job application not found");
  }

  // Optional: Only allow rollback if createdBy or isAdmin
  if (!isAdmin && application.createdBy?.toString() !== userId?.toString()) {
    throw new ApiError(
      403,
      "You do not have permission to rollback this application"
    );
  }

  const history = application.stageHistory || [];

  if (history.length < 2) {
    throw new ApiError(400, "Cannot rollback — only one stage in history");
  }

  const lastStage = history[history.length - 1];
  const previousStage = history[history.length - 2];

  // Remove last stage history
  application.stageHistory.pop();

  // Revert current stage
  application.currentStage = previousStage.stage;

  // Log rollback as a new stage entry (for audit)
  application.stageHistory.push({
    stage: previousStage.stage,
    updatedBy: userId,
    notes: `[ROLLBACK] ${reason || "Reverted stage manually"}`,
  });

  await application.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        application,
        `Rolled back to stage: ${previousStage.stage}`
      )
    );
});

// ======================= MARK CANDIDATE AS HIRED =======================
const markAsHired = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const createdBy = req.user?._id;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job application ID");
  }

  const application = await JobApplication.findById(id);
  if (!application) throw new ApiError(404, "Job application not found");

  if (application.status === "hired") {
    throw new ApiError(400, "Candidate already marked as hired");
  }
  if (application.status === "not_hired") {
    throw new ApiError(400, "Rejected candidate cannot be hired");
  }

  const { fullName, email, phone, resumeUrl } = application;

  const existingUser = await User.findOne({ $or: [{ email }] });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const password = generateRandomPassword(fullName);

  const newUser = await User.create({
    fullName,
    email,
    phone,
    role: "employee",
    password,
    resume: resumeUrl,
    source: "hired_from_application",
    status: "active",
    createdFrom: "jobApplication",
    createdBy,
  });

  application.status = "hired";
  application.hiredAs = newUser._id;
  application.stageHistory.push({
    stage: application.currentStage,
    updatedBy: createdBy,
    notes: "[HIRED] Finalized and account created",
  });

  await application.save();

  sendEmail({
    to: email,
    subject: "🎉 Welcome Aboard!",
    name: fullName,
    text: `Welcome to ${COMPANY_INFO.LEGAL_NAME}! Your temporary login password is: ${password}`,
    html: generateWelcomeEmailTemplate({ fullName, email, password }),
  }).catch((err) => console.warn("Failed to send welcome email:", err.message));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { newUser, application },
        "Candidate hired and account created"
      )
    );
});

export {
  createJobApplication,
  checkDuplicateApplication,
  moveToNextStage,
  addStageNote,
  rejectAtStage,
  rollbackStage,
  markAsHired,
};
