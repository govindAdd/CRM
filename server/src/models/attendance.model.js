import mongoose, { Schema } from "mongoose";

// ======================= Attendance Schema =======================
const attendanceSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "half-day", "leave", "weekoff"],
      required: true,
    },

    shift: {
      type: String,
      enum: ["morning", "evening", "night"],
    },

    clockIn: {
      type: Date,
    },

    clockOut: {
      type: Date,
    },

    remarks: {
      type: String,
      trim: true,
    },

    location: {
      lat: { type: Number },
      lng: { type: Number },
    },

    isLate: {
      type: Boolean,
      default: false,
    },

    overtimeMinutes: {
      type: Number,
      default: 0,
    },

    type: {
      type: String,
      enum: ["manual", "biometric", "web", "mobile", "system"],
      default: "manual",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ======================= Indexes =======================
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ department: 1 });
attendanceSchema.index({ isDeleted: 1 });
attendanceSchema.index({ employee: 1, status: 1 });
attendanceSchema.index({ department: 1, date: -1 });

// ======================= Virtuals =======================
attendanceSchema.virtual("workedMinutes").get(function () {
  if (this.clockIn && this.clockOut) {
    return Math.floor((this.clockOut - this.clockIn) / 60000);
  }
  return 0;
});

attendanceSchema.virtual("workedHours").get(function () {
  const minutes =
    this.clockIn && this.clockOut
      ? Math.floor((this.clockOut - this.clockIn) / 60000)
      : 0;
  return (minutes / 60).toFixed(2);
});

// ======================= Pre-save Hooks =======================
attendanceSchema.pre("save", async function (next) {
  const attendance = this;

  // Validate clockIn < clockOut
  if (
    attendance.clockIn &&
    attendance.clockOut &&
    attendance.clockIn > attendance.clockOut
  ) {
    return next(new Error("Clock-in time must be before clock-out time"));
  }

  // Auto-mark isLate
  if (attendance.clockIn && attendance.shift) {
    const shiftStart = {
      morning: 9,
      evening: 14,
      night: 21,
    }[attendance.shift];

    const hour = attendance.clockIn.getHours();
    attendance.isLate = hour > shiftStart;
  }

  // Auto-calculate overtime
  if (attendance.clockIn && attendance.clockOut) {
    const worked = Math.floor(
      (attendance.clockOut - attendance.clockIn) / 60000
    );
    attendance.overtimeMinutes = worked > 480 ? worked - 480 : 0;
  }

  // Auto-assign department if missing
  if (!attendance.department && attendance.employee) {
    const { Membership } = await import("./membership.model.js");
    const membership = await Membership.findOne({
      user: attendance.employee,
    }).select("department");
    if (membership) {
      attendance.department = membership.department;
    }
  }

  next();
});

// ======================= Pre-find Hook (soft delete filter) =======================
attendanceSchema.pre(/^find/, function (next) {
  if (!this.getFilter().hasOwnProperty("isDeleted")) {
    this.where({ isDeleted: false });
  }
  next();
});

// ======================= Export Model =======================
export const Attendance = mongoose.model("Attendance", attendanceSchema);
