import mongoose, { Schema } from 'mongoose';

const afterSalesSchema = new Schema(
  {
    ticketTitle: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    issueType: {
      type: String,
      trim: true,
      enum: [
        'installation',
        'repair',
        'warranty',
        'billing',
        'general inquiry',
        'other'
      ],
      default: 'other',
    },

    assignedEmployee: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },

    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    customer: {
      type: mongoose.Types.ObjectId,
      ref: 'User', // If customers are stored as Users
    },

    customerFeedback: {
      type: String,
      trim: true,
    },

    resolutionNotes: {
      type: String,
      trim: true,
    },

    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Auto-set resolvedAt timestamp
afterSalesSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'resolved') {
    this.resolvedAt = new Date();
  }
  next();
});

export const AfterSales = mongoose.model('AfterSales', afterSalesSchema);