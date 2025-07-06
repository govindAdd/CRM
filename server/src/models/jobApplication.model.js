import mongoose, { Schema } from 'mongoose';

// ===================== Job Application Schema =====================
const jobApplicationSchema = new Schema({
  applicantName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'interviewed', 'hired', 'rejected'],
    default: 'applied',
  },
  resumeUrl: {
    type: String, // Cloudinary or external URL
  },
  department: {
    type: mongoose.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  reviewedBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
    trim: true,
  },
  source: {
    type: String,
    trim: true,
    enum: ['LinkedIn', 'Indeed', 'Referral', 'Website', 'Other'],
  },
  interviewDate: {
    type: Date,
  },
  feedback: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// ===================== Export =====================
export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
