import mongoose, { Schema } from 'mongoose';

// ======================= Training Schema =======================
const trainingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  trainer: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },

  materialURLs: [
    {
      type: String,
      trim: true,
    },
  ],

  scheduledDate: {
    type: Date,
  },

  durationInMinutes: {
    type: Number,
    min: 0,
  },

  location: {
    type: String,
    trim: true,
  },

  participants: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  ],

  completionStatus: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed'],
    default: 'scheduled',
  },

  feedbacks: [
    {
      participant: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comments: {
        type: String,
        trim: true,
      },
    },
  ],
}, {
  timestamps: true,
});

// ======================= Export Model =======================
export const Training = mongoose.model('Training', trainingSchema);
