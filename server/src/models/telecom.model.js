import mongoose, { Schema } from 'mongoose';

// ======================= Telecom Schema =======================
const telecomSchema = new Schema(
  {
    callType: {
      type: String,
      enum: ['internal', 'external'],
      required: true,
    },

    callPurpose: {
      type: String,
      enum: ['support', 'sales', 'feedback', 'follow-up', 'other'],
      required: true,
    },

    staff: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    client: {
      type: mongoose.Types.ObjectId,
      ref: 'User', // Optional customer or external user
    },

    callDuration: {
      type: Number, // in seconds
      min: 0,
    },

    startTime: {
      type: Date,
    },

    endTime: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },

    outcome: {
      type: String,
      enum: [
        'successful',
        'missed',
        'follow-up needed',
        'no response',
        'escalated',
        'resolved',
        'other',
      ],
      default: 'other',
      trim: true,
    },

    recordingUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ======================= Auto-Calculate Call Duration =======================
telecomSchema.pre('save', function (next) {
  if (this.startTime && this.endTime && !this.callDuration) {
    const durationInMs = this.endTime - this.startTime;
    this.callDuration = Math.floor(durationInMs / 1000); // Convert to seconds
  }
  next();
});

// ======================= Export Model =======================
export const Telecom = mongoose.model('Telecom', telecomSchema);