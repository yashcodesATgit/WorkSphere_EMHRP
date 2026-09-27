import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2000,
    },
    basicSalary: { type: Number, default: 0, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    grossSalary: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, default: 0, min: 0 },
    workingDays: { type: Number, default: 0, min: 0 },
    presentDays: { type: Number, default: 0, min: 0 },
    leaveDays: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'PAID'],
      default: 'PENDING',
    },
    paidOn: { type: Date, default: null },
    remarks: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
