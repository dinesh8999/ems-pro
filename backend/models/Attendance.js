import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date
  },
  checkOut: Date,
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half-Day', 'On Leave'],
    default: 'Present'
  },
  workHours: {
    type: Number,
    default: 0
  },
  departmentCode: {
    type: String,
    trim: true
  },
  notes: String
}, { timestamps: true });

// Index for efficient queries
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
