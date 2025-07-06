import mongoose, { Schema } from 'mongoose';

const dataMiningSchema = new Schema(
  {
    datasetName: {
      type: String,
      required: true,
      trim: true,
    },

    assignedAnalyst: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    miningType: {
      type: String,
      enum: ['sentiment', 'forecasting', 'clustering', 'classification', 'regression', 'association'],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    progress: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'error'],
      default: 'not-started',
    },

    resultSummary: {
      type: String,
      trim: true,
    },

    outputFiles: [{
      type: String, // URLs to files (CSV, JSON, images)
      trim: true,
    }],

    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],

    reviewedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },

    completedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

// ======================= Auto-set completedAt =======================
dataMiningSchema.pre('save', function (next) {
  if (this.isModified('progress') && this.progress === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

export const DataMining = mongoose.model('DataMining', dataMiningSchema);
