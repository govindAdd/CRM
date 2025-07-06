import mongoose, { Schema } from 'mongoose';

const leaveRequestSchema = new Schema({
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { _id: false, timestamps: true });

const hrSchema = new Schema(
  {
    employee: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one HR record per employee
    },

    leaveRequests: [leaveRequestSchema],

    noticePeriod: {
      type: String, // e.g. "2 weeks", "1 month"
      trim: true,
    },

    onboardingStatus: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },

    resignationStatus: {
      type: String,
      enum: ['none', 'resigned', 'accepted', 'rejected'],
      default: 'none',
    },

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Export model
export const HR = mongoose.model('HR', hrSchema);