import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    enum: ['Admin', 'Employee']
  },
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    enum: ['Employee', 'Leave', 'Attendance', 'Performance', 'Department', 'Auth'],
    required: true
  },
  entityId: mongoose.Schema.Types.ObjectId,
  details: String,
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
