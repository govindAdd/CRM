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

    keySkills: {
      type: [String],
      trim: true,
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "Maximum 20 key skills allowed",
      },
    },

    responsibilities: {
      type: [String],
      trim: true,
      validate: {
        validator: (arr) => arr.length <= 50,
        message: "Maximum 50 responsibilities allowed",
      },
    },

    salary: {
      amount: {
        type: Number,
        min: 0,
        validate: {
          validator: function (v) {
            return this.role !== "employee" || v > 0;
          },
          message: "Salary amount is required for employees",
        },
      },
      currency: { type: String, default: "INR" },
      period: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    },

    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// 🚫 Prevent duplicate (user + department) combinations
membershipSchema.index({ user: 1, department: 1 }, { unique: true });
membershipSchema.index({ role: 1 });

export const Membership = mongoose.model("Membership", membershipSchema);