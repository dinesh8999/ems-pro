import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    default: '09:00'
  },
  endDate: {
    type: Date,
    required: true
  },
  endTime: {
    type: String,
    default: '18:00'
  },
  duration: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedDate: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);
