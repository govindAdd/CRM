import mongoose, { Schema } from 'mongoose';

const salesSchema = new Schema(
  {
    leadName: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ['prospect', 'contacted', 'negotiation', 'won', 'lost'],
      default: 'prospect',
    },

    assignedRep: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },

    dealSize: {
      type: Number, // Expected value
      min: 0,
    },

    revenue: {
      type: Number, // Actual revenue (if closed)
      min: 0,
    },

    expectedCloseDate: {
      type: Date,
    },

    closeDate: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },

    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }]
  },
  {
    timestamps: true,
  }
);

export const Sales = mongoose.model('Sales', salesSchema);