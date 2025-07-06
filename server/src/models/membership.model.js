import mongoose, { Schema } from "mongoose";

const VALID_ROLES = ["head", "admin", "employee", "superadmin", "hr"];

const membershipSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    role: {
      type: String,
      enum: VALID_ROLES,
      required: true,
    },
    meta: {
      type: Schema.Types.Mixed, // allows flexibility for future extensions (e.g., notes, timestamps, history)
      default: {},
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// 🚫 Prevent duplicate (user + department) combinations
membershipSchema.index({ user: 1, department: 1 }, { unique: true });

export const Membership = mongoose.model("Membership", membershipSchema);
