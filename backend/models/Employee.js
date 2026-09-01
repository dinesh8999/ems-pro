import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@ems\.com$/, 'Email address must end with @ems.com (e.g. user@ems.com)']
  },
  avatar: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    default: 'employee',
    enum: ['employee']
  },
  isRegistered: {
    type: Boolean,
    default: false // True when employee completes registration
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations', 'Other']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: 0
  },
  joinDate: {
    type: Date,
    required: [true, 'Join date is required'],
    default: Date.now
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive', 'on-leave']
  }
}, {
  timestamps: true
});

// Index for search functionality
employeeSchema.index({ name: 'text', email: 'text' });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
