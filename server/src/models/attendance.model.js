import mongoose, { Schema } from 'mongoose';

// ======================= Attendance Schema =======================
const attendanceSchema = new Schema(
  {
    employee: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'leave'],
      required: true,
    },

    shift: {
      type: String,
      enum: ['morning', 'evening', 'night'],
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
      enum: ['manual', 'biometric', 'web', 'mobile'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ======================= Unique Constraint =======================
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// ======================= Virtual Field: Worked Minutes =======================
attendanceSchema.virtual('workedMinutes').get(function () {
  if (this.clockIn && this.clockOut) {
    return Math.floor((this.clockOut - this.clockIn) / 60000); // minutes
  }
  return 0;
});

// ======================= Export Model =======================
export const Attendance = mongoose.model('Attendance', attendanceSchema);