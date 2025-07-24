import mongoose, { Schema } from "mongoose";
import { isEmail } from "validator";

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

const STAGES = [
  "application review",
  "telephone interview",
  "face to face",
  "virtual interview",
  "offered",
  "document processing",
  "offer letter sent",
  "appointment set",
  "onboarded",
];

const FINAL_STATUSES = ["hired", "not hired"];

const ARCHIVE_REASONS = [
  "rejected in interview",
  "rejected in face to face",
  "other",
];

const REJECTION_REASONS = [
  "not qualified",
  "candidate not interested",
  "candidate not reachable",
  "not suitable",
  "no fit for current_need",
  "location issue",
  "salary not comfortable",
];

// ========== SCHEMA ==========
const jobApplicationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\d{10,15}$/.test(v),
        message: "Invalid phone number",
      },
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
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

    resume: {
      type: String,
      required: true,

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
        validator: function (value) {
          return !this.archived || !!value;
        },
        message: "archiveReason is required when archived is true",
      },
    },

    rejectionReason: {
      type: String,
      enum: REJECTION_REASONS,
    },

    currentStage: {
      type: String,
      enum: STAGES,
      default: "application review",
    },

    stageHistory: [
      {
        stage: { type: String, enum: STAGES },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        notes: { type: String, trim: true },
      },
    ],

    status: {
      type: String,
      enum: FINAL_STATUSES,
      default: "not hired",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    evaluation: {
      type: String,
      maxlength: 1000,
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

    // Links
    membership: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// ========== HOOKS ==========
jobApplicationSchema.pre("save", function (next) {
  if (!this.archived) {
    this.archiveReason = undefined;
  }
  next();
});

// ========== VIRTUALS ==========
jobApplicationSchema.virtual("isHired").get(function () {
  return this.status === "hired";
});

jobApplicationSchema.virtual("isRejected").get(function () {
  return !!this.rejectionReason;
});

// ========== EXPORT ==========
export default mongoose.model("JobApplication", jobApplicationSchema);