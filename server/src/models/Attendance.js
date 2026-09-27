import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'],
      default: 'PRESENT',
    },
    checkIn: {
      type: String, // stored as 'HH:MM'
      default: '',
    },
    checkOut: {
      type: String,
      default: '',
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same employee on same date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
