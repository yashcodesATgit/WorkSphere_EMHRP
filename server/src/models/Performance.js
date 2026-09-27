import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
    },
    reviewPeriod: {
      type: String,
      required: [true, 'Review period is required'],
      trim: true,
    },
    reviewDate: {
      type: Date,
      required: [true, 'Review date is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    goals: { type: String, default: '', trim: true },
    strengths: { type: String, default: '', trim: true },
    improvements: { type: String, default: '', trim: true },
    comments: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['DRAFT', 'COMPLETED'],
      default: 'DRAFT',
    },
  },
  { timestamps: true }
);

const Performance = mongoose.model('Performance', performanceSchema);
export default Performance;
