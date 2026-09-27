import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', ''],
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
    },
    employmentStatus: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
      default: 'Full-time',
    },
    salary: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-generate employeeId before saving
employeeSchema.pre('save', async function (next) {
  if (this.employeeId) return next();
  const count = await mongoose.model('Employee').countDocuments();
  this.employeeId = `EMP${String(count + 1).padStart(3, '0')}`;
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
