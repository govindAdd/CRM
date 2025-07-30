import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { JobApplication } from "../models/jobApplication.model.js";
import { STAGES } from "../models/jobApplication.model.js";
import { ARCHIVE_REASONS } from "../models/jobApplication.model.js";
import { REJECTION_REASONS } from "../models/jobApplication.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateAccessAndRefreshTokens } from "./user.controller.js";
import XLSX from "xlsx";
import { welcomeEmailQueue, rejectionEmailQueue } from "../utils/emailQueue.js";
import { sendEmail } from "../utils/sendEmail.js";
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
  const { fullName, email, phone, location, source = "other" } = req.body;

  const createdBy = req.user?._id;
  const resumePath = req.files?.resumeUrl?.[0]?.path;

  // Validate fields
  if ([fullName, email, phone, resumePath].some((f) => !f?.toString().trim())) {
    throw new ApiError(400, "Required fields missing");
  }

  // Upload resume to cloud
  const resume = await uploadOnCloudinary(resumePath);
  if (!resume?.url) {
    throw new ApiError(400, "Resume upload failed");
  }

  // Check duplicates
  const existing = await JobApplication.findOne({
    $or: [
      { email: new RegExp(`^${email}$`, "i") },
      { phone: new RegExp(`^${phone}$`) },
    ],
  });

  if (existing) {
    await JobApplication.create({
      fullName,
      email,
      phone,
      location,
      resumeUrl: resume.url,
      source,
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

  // Create new application
  const newApplication = await JobApplication.create({
    fullName,
    email,
    phone,
    location,
    resumeUrl: resume.url,
    source,
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
      new ApiResponse(
        201,
        newApplication,
        "Job application created successfully"
      )
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
// PATCH /api/job-applications/:id/hired
// Body: { fullName, email, phone,
const markAsHired = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const createdBy = req.user?._id;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job application ID");
  }

  const application = await JobApplication.findById(id);
  if (!application) throw new ApiError(404, "Job application not found");

  if (application.status === "hired") {
    throw new ApiError(400, "Candidate already hired");
  }

  const { fullName, email, phone, gender, dob, designation } = application;

  const trimmedEmail = email.trim().toLowerCase();
  let username = trimmedEmail
    .split("@")[0]
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ email: trimmedEmail }, { username }],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "A user with the same email or username already exists"
    );
  }

  // Check avatar
  const avatarPath = req.files?.avatar?.[0]?.path;
  if (!avatarPath) throw new ApiError(400, "Avatar is required for hiring");

  const avatar = await uploadOnCloudinary(avatarPath);
  if (!avatar?.url) throw new ApiError(500, "Failed to upload avatar");

  // Generate secure password
  const password = generateRandomPassword(fullName);

  // Create new user
  const newUser = await User.create({
    fullName,
    email: trimmedEmail,
    username,
    password,
    avatar: avatar.url,
    phone,
    gender,
    dob,
    designation,
  });

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    newUser._id
  );
  newUser.refreshToken = refreshToken;
  await newUser.save();

  // Update job application
  application.status = "hired";
  application.hiredAs = newUser._id;
  application.stageHistory.push({
    stage: application.currentStage,
    updatedBy: createdBy,
    notes: "[HIRED] Finalized and account created",
  });
  await application.save();
  // 🎯 Add delayed welcome email to queue (6 days = 518400 sec)
  welcomeEmailQueue.process(async (job) => {
    const { email, fullName, password } = job.data;
    const resetURL = `${process.env.CORS_ORIGIN}/forgot-password`;
    const btnName = "Forget Password";
    
    const plainTextMessage = `
🎉 Welcome to Our Company!

Hi ${fullName},

Your account has been successfully created. Here are your login details:

Email: ${email}
Temporary Password: ${password}

Please log in and change your password as soon as possible for security reasons.

We're excited to have you on board!

- HR Team
  `;

    try {
      await sendEmail({
        to: email,
        subject: "🎉 Welcome Aboard!",
        name: fullName,
        text: plainTextMessage,
        resetUrl: resetURL,
        btnName,
      });

      console.log(`✅ Welcome email sent to ${email}`);
    } catch (err) {
      console.error("❌ Failed to send welcome email:", err);
    }
  });
  await welcomeEmailQueue.add(
    { email, fullName, password },
    {
      delay: 0,
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 60000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  // Prepare safe user object
  const safeUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  // Respond with cookie and data
  return res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(200)
    .json(
      new ApiResponse(
        200,
        { accessToken, user: safeUser, application },
        "Candidate hired and account created"
      )
    );
});

// ======================= MARK CANDIDATE AS Not-HIRED =======================
// PATCH /api/job-applications/:id/not-hired
// Body: { reason: "not_qualified" }
const markAsNotHired = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const reviewerId = req.user?._id;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job application ID");
  }

  const application = await JobApplication.findById(id);
  if (!application) {
    throw new ApiError(404, "Job application not found");
  }

  if (application.status === "not_hired") {
    throw new ApiError(400, "Candidate already marked as not hired");
  }

  if (application.status === "hired") {
    throw new ApiError(400, "Cannot reject a hired candidate");
  }

  application.status = "not_hired";
  application.rejection = {
    reason: reason || "Candidate not selected",
    rejectedBy: reviewerId,
    rejectedAt: new Date(),
  };

  application.stageHistory.push({
    stage: application.currentStage,
    updatedBy: reviewerId,
    notes: `[NOT HIRED] ${reason || "Candidate rejected without a specific reason"}`,
  });

  await application.save();
  // 🎯 Add delayed Reject email to queue (1 days = 518400 sec)
  rejectionEmailQueue.process(async (job) => {
    const { email, fullName, reason } = job.data;

    const message = `
Dear ${fullName},

Thank you for taking the time to apply and interview with us.

After careful consideration, we regret to inform you that you have not been selected for the role.

Reason (if shared): ${reason || "Not specified"}

We appreciate your interest and encourage you to apply again in the future.

Best regards,  
HR Team
`;

    try {
      await sendEmail({
        to: email,
        subject: "Application Update - Thank You",
        name: fullName,
        text: message,
      });

      console.log(`📨 Rejection email sent to ${email}`);
    } catch (err) {
      console.error("❌ Failed to send rejection email to", email, err);
    }
  });
  await rejectionEmailQueue.add(
    {
      email: application.email,
      fullName: application.fullName,
      reason,
    },
    {
      delay: 86400 * 1000, // 1 day
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 60000,
      },
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, application, "Candidate marked as not hired"));
});
// ======================= ADD EVALUATION AND RATING =======================
// PATCH /api/job-applications/:id/evaluation
// Body: { stage: "face_to_face", rating: 4, feedback: "
const addEvaluationAndRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stage, rating, feedback } = req.body;
  const userId = req.user?._id;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job application ID");
  }

  if (!stage || typeof rating !== "number" || !feedback) {
    throw new ApiError(
      400,
      "stage, rating (number), and feedback are required"
    );
  }

  const application = await JobApplication.findById(id);
  if (!application) {
    throw new ApiError(404, "Job application not found");
  }

  application.evaluations.push({
    stage,
    rating,
    feedback,
    evaluatedBy: userId,
    evaluatedAt: new Date(),
  });

  await application.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        application,
        "Evaluation and rating added successfully"
      )
    );
});
// ======================= ARCHIVE APPLICATION =======================
// PATCH /api/job-applications/:id/archive
const archiveApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { archiveReason } = req.body;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid application ID");
  }

  if (!archiveReason || !ARCHIVE_REASONS.includes(archiveReason)) {
    throw new ApiError(400, "Invalid or missing archiveReason");
  }

  const application = await JobApplication.findById(id);
  if (!application) {
    throw new ApiError(404, "Job application not found");
  }

  if (application.archived) {
    throw new ApiError(409, "Application is already archived");
  }

  application.archived = true;
  application.archiveReason = archiveReason;

  await application.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, application, "Application archived successfully")
    );
});

// ======================= UNARCHIVE APPLICATION =======================
// PATCH /api/job-applications/:id/unarchive
const unarchiveApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job application ID");
  }

  // Find the job application
  const application = await JobApplication.findById(id);
  if (!application) {
    throw new ApiError(404, "Job application not found");
  }

  // Already active
  if (!application.archived) {
    throw new ApiError(409, "Application is already active");
  }

  // Unarchive
  application.archived = false;
  application.archiveReason = undefined;

  await application.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, application, "Application unarchived successfully")
    );
});

// ======================= BLOCK CANDIDATE =======================
// PATCH /api/job-applications/:id/block
const blockCandidate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = "other" } = req.body;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job application ID");
  }

  if (!["merged_with_original", "other"].includes(reason)) {
    throw new ApiError(400, "Invalid archive reason for blocking");
  }

  const application = await JobApplication.findById(id);
  if (!application) {
    throw new ApiError(404, "Job application not found");
  }

  if (application.archived && application.tags.includes("blocked")) {
    throw new ApiError(409, "Candidate is already blocked");
  }

  // Update fields
  application.status = "not_hired";
  application.archived = true;
  application.archiveReason = reason;
  if (!application.tags.includes("blocked")) {
    application.tags.push("blocked");
  }

  await application.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        application,
        "Candidate has been blocked successfully"
      )
    );
});
// ======================= UNBLOCK CANDIDATE =======================
// PATCH /api/job-applications/:id/unblock
const unblockCandidate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job application ID");
  }

  const application = await JobApplication.findById(id);
  if (!application) {
    throw new ApiError(404, "Job application not found");
  }

  if (!application.archived || !application.tags.includes("blocked")) {
    throw new ApiError(400, "Candidate is not blocked or already active");
  }

  // Revert changes
  application.status = "active";
  application.archived = false;
  application.archiveReason = undefined;
  application.tags = application.tags.filter((tag) => tag !== "blocked");

  await application.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        application,
        "Candidate has been unblocked successfully"
      )
    );
});

// ======================= SEARCH JOB APPLICATIONS =======================
// GET /api/job-applications/search?q=&id=&stage=&status=&rejectionReason=&archived=true&page=1&limit=20
const searchJobApplications = asyncHandler(async (req, res) => {
  const {
    q,
    id,
    stage,
    status,
    rejectionReason,
    archived,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
    export: exportType,
  } = req.query;

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const allowedSortFields = ["createdAt", "fullName", "email", "status"];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  // ========== Direct Search by ID ==========
  if (id) {
    if (!isValidObjectId(id))
      throw new ApiError(400, "Invalid Job Application ID");

    const application = await JobApplication.findById(id);
    if (!application)
      throw new ApiError(404, "No job application found with this ID");

    return res
      .status(200)
      .json(new ApiResponse(200, [application], "Application found by ID"));
  }

  // ========== Match Stage Builder ==========
  const buildMatchStage = () => {
    const match = {};

    if (q?.trim()) {
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const safeQ = escapeRegex(q.trim());

      match.$or = [
        { fullName: { $regex: `^${safeQ}`, $options: "i" } },
        { email: { $regex: safeQ, $options: "i" } },
        { phone: { $regex: safeQ } },
        { tags: { $elemMatch: { $regex: safeQ, $options: "i" } } },
      ];
    }

    if (stage) match.currentStage = stage;
    if (status) match.status = status;
    if (rejectionReason) match.rejectionReason = rejectionReason;
    if (archived !== undefined) match.archived = archived === "true";

    return match;
  };

  const matchStage = buildMatchStage();

  // ========== Excel Export ==========
  if (exportType === "excel") {
    // Optional: Authorization check for export
    // if (!req.user?.isAdmin) throw new ApiError(403, "Unauthorized export");

    const applications = await JobApplication.find(matchStage)
      .sort({ [safeSortBy]: sortDirection })
      .lean();

    if (applications.length === 0) {
      throw new ApiError(404, "No applications found to export");
    }

    const data = applications.map((app) => ({
      FullName: app.fullName,
      Email: app.email,
      Phone: app.phone,
      Stage: app.currentStage,
      Status: app.status,
      RejectionReason: app.rejectionReason || "-",
      Archived: app.archived ? "Yes" : "No",
      AppliedAt: new Date(app.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=applications.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    return res.send(buffer);
  }

  // ========== Aggregation Pipeline ==========
  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        applications: [
          { $sort: { [safeSortBy]: sortDirection } },
          { $skip: skip },
          { $limit: limitNum },
        ],
        total: [{ $count: "count" }],
        byStage: [
          { $group: { _id: "$currentStage", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
      },
    },
    {
      $project: {
        applications: 1,
        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        byStage: 1,
      },
    },
  ];

  const [result] = await JobApplication.aggregate(pipeline);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: result.total,
        page: pageNum,
        pageSize: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
        hasNextPage: pageNum * limitNum < result.total,
        hasPrevPage: pageNum > 1,
        applications: result.applications,
        stageStats: result.byStage,
      },
      q || stage || status || rejectionReason || typeof archived !== "undefined"
        ? "Filtered applications retrieved"
        : "All applications retrieved"
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
  markAsNotHired,
  addEvaluationAndRating,
  archiveApplication,
  unarchiveApplication,
  blockCandidate,
  unblockCandidate,
  searchJobApplications,
};
