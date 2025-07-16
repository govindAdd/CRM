import mongoose, { Schema } from "mongoose";

// ===================== Leave Request Schema =====================
const leaveRequestSchema = new Schema(
  {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String, trim: true, maxlength: 500 },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    type: {
      type: String,
      enum: ["leave", "week-off", "holiday", "other"],
      default: "leave",
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: { type: Date, default: null },
    reviewComment: { type: String, trim: true, maxlength: 300 },
  },
  {
    _id: false,
    timestamps: true,
  }
);

// ===================== HR Schema =====================
const hrSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    leaveRequests: [leaveRequestSchema],

    noticePeriod: { type: String, trim: true },

    onboardingStatus: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },

    resignationStatus: {
      type: String,
      enum: ["none", "resigned", "accepted", "rejected"],
      default: "none",
    },

    isSuperAdmin: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===================== Indexes =====================
hrSchema.index({ employee: 1, isDeleted: 1 });

// ===================== Virtuals =====================
hrSchema.virtual("totalLeaves").get(function () {
  return this.leaveRequests?.length || 0;
});

// ===================== Query Helpers =====================
hrSchema.query.withLeaveStatus = function (status) {
  return this.where("leaveRequests.status").equals(status);
};

hrSchema.query.withLeaveType = function (type) {
  return this.where("leaveRequests.type").equals(type);
};

// ===================== Pre-find Hook (soft delete filter) =====================
hrSchema.pre(/^find/, function (next) {
  const filter = this.getFilter();
  if (!Object.prototype.hasOwnProperty.call(filter, "isDeleted")) {
    this.where({ isDeleted: false });
  }

  next();
});


// ===================== Statics =====================
hrSchema.statics.getLeaveCountsPerEmployee = async function () {
  return this.aggregate([
    { $unwind: "$leaveRequests" },
    {
      $group: {
        _id: "$employee",
        totalLeaves: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ["$leaveRequests.status", "pending"] }, 1, 0] },
        },
        approved: {
          $sum: { $cond: [{ $eq: ["$leaveRequests.status", "approved"] }, 1, 0] },
        },
        rejected: {
          $sum: { $cond: [{ $eq: ["$leaveRequests.status", "rejected"] }, 1, 0] },
        },
        weekOffs: {
          $sum: { $cond: [{ $eq: ["$leaveRequests.type", "week-off"] }, 1, 0] },
        },
      },
    },
  ]);
};

hrSchema.statics.getLeaveHistory = async function (employeeId) {
  return this.findOne({ employee: employeeId }, "leaveRequests").lean();
};

// ===================== Export =====================
export const HR = mongoose.model("HR", hrSchema);