import mongoose, { Schema } from "mongoose";
import validator from "validator";

const { isEmail } = validator;

// ========== ENUMS ==========
const SOURCES = [
  "referral",
  "linkedin",
  "website",
  "email",
  "walkin",
  "internal",
  "other",
];

export const STAGES = [
  "application_review",
  "telephone_interview",
  "face_to_face",
  "virtual_interview",
  "offered",
  "document_processing",
  "offer_letter_sent",
  "appointment_set",
  "onboarded",
];

const FINAL_STATUSES = ["hired", "not_hired"];

export const ARCHIVE_REASONS = [
  "rejected_in_interview",
  "rejected_in_face_to_face",
  "merged_with_original",
  "other",
];

export const REJECTION_REASONS = [
  "not_qualified",
  "candidate_not_interested",
  "candidate_not_reachable",
  "not_suitable",
  "no_fit_for_current_need",
  "location_issue",
  "salary_not_comfortable",
];

// ========== SCHEMA ==========
const jobApplicationSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\d{10,15}$/.test(v),
        message: "Phone number must be 10–15 digits",
      },
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: [isEmail, "Invalid email address"],
    },

    location: {
      type: String,
      trim: true,
    },

    source: {
      type: String,
      enum: SOURCES,
      default: "other",
    },

    resumeUrl: {
      type: String,
      required: true,
      trim: true,
    },

    currentStage: {
      type: String,
      enum: STAGES,
      default: "application_review",
    },

    stageHistory: [
      {
        stage: { type: String, enum: STAGES },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        notes: { type: String, trim: true, maxlength: 1000 },
      },
    ],

    status: {
      type: String,
      enum: FINAL_STATUSES,
      default: "not_hired",
    },

    rejectionReason: {
      type: String,
      enum: REJECTION_REASONS,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    evaluation: {
      type: String,
      maxlength: 2000,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    noticePeriodDays: {
      type: Number,
      min: 0,
    },

    availableFrom: {
      type: Date,
    },

    isDuplicate: {
      type: Boolean,
      default: false,
    },

    archived: {
      type: Boolean,
      default: false,
    },

    archiveReason: {
      type: String,
      enum: ARCHIVE_REASONS,
      validate: {
        validator(value) {
          return !this.archived || !!value;
        },
        message: "archiveReason is required when archived is true",
      },
    },

    membership: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ========== INDEXES ==========
jobApplicationSchema.index({ email: 1, phone: 1 }, { unique: true });
jobApplicationSchema.index({ currentStage: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ tags: 1 });
jobApplicationSchema.index({ archived: 1 });
jobApplicationSchema.index({ "stageHistory.updatedAt": -1 });

// ========== VIRTUALS ==========
jobApplicationSchema.virtual("isHired").get(function () {
  return this.status === "hired";
});

jobApplicationSchema.virtual("isRejected").get(function () {
  return !!this.rejectionReason;
});

// ========== HOOKS ==========
jobApplicationSchema.pre("save", function (next) {
  if (!this.archived) {
    this.archiveReason = undefined;
  }
  next();
});

// ========== QUERY HELPERS ==========
jobApplicationSchema.query.byEmailOrPhone = function (input) {
  return this.where({
    $or: [
      { email: new RegExp(`^${input}$`, "i") },
      { phone: new RegExp(`^${input}$`) },
    ],
  });
};

jobApplicationSchema.query.byName = function (name) {
  return this.where({
    fullName: new RegExp(name, "i"),
  });
};

jobApplicationSchema.query.byTags = function (tags) {
  return this.where({
    tags: { $in: Array.isArray(tags) ? tags : [tags] },
  });
};

jobApplicationSchema.query.byStage = function (stage) {
  return this.where({ currentStage: stage });
};

jobApplicationSchema.query.byStatus = function (status) {
  return this.where({ status });
};

jobApplicationSchema.query.byRejectionReason = function (reason) {
  return this.where({ rejectionReason: reason });
};

jobApplicationSchema.query.smartSearch = function (q) {
  return this.where({
    $or: [
      { email: new RegExp(q, "i") },
      { phone: new RegExp(q) },
      { fullName: new RegExp(q, "i") },
      { tags: { $in: [q] } },
    ],
  });
};

// ========== EXPORT ==========
export const JobApplication = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);