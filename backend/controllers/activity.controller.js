import ActivityLog from '../models/ActivityLog.js';

// Get all activity logs
export const getAllLogs = async (req, res) => {
  try {
    const { entityType, userId, startDate, endDate, limit = 100 } = req.query;
    
    let query = {};
    if (entityType) query.entityType = entityType;
    if (userId) query.user = userId;
    if (startDate && endDate) {
      query.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get logs by entity
export const getLogsByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const logs = await ActivityLog.find({ entityType, entityId })
      .populate('user', 'name email username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recent activity
export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const logs = await ActivityLog.find()
      .populate('user', 'name email username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get activity statistics
export const getActivityStats = async (req, res) => {
  try {
    const actionStats = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$entityType',
          count: { $sum: 1 },
          actions: { $push: '$action' }
        }
      }
    ]);

    const userActivityStats = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$user',
          activityCount: { $sum: 1 }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayActivity = await ActivityLog.countDocuments({
      createdAt: { $gte: today }
    });

    res.json({ 
      success: true, 
      data: { 
        byEntity: actionStats,
        topUsers: userActivityStats,
        todayCount: todayActivity
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create activity log
export const createActivity = async (req, res) => {
  try {
    const { user, userModel = 'Admin', action, entityType, entityId, details } = req.body;

    if (!action || !entityType) {
      return res.status(400).json({ success: false, message: 'Action and entityType are required' });
    }

    const log = await ActivityLog.create({
      user,
      userModel,
      action,
      entityType,
      entityId,
      details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || ''
    });

    res.status(201).json({ success: true, message: 'Activity logged', data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete activity log (admin only)
export const deleteActivity = async (req, res) => {
  try {
    const log = await ActivityLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
