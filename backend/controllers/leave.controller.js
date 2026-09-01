import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';
import ActivityLog from '../models/ActivityLog.js';
import mongoose from 'mongoose';

// Get all leaves
export const getAllLeaves = async (req, res) => {
  try {
    const { status, employeeId, employee: employeeParam, startDate, endDate } = req.query;
    let query = {};
    
    // Auth role check: If user is an employee, strictly force query.employee to currentUser.id
    const currentUser = req.user || req.admin;
    if (currentUser && currentUser.role === 'employee') {
      query.employee = currentUser.id;
    } else {
      const targetEmp = employeeId || employeeParam;
      if (targetEmp) query.employee = targetEmp;
    }
    
    if (status) query.status = status;
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.startDate = { $lte: new Date(endDate) };
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'name email department position')
      .populate('approvedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get leave by ID
export const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'name email department position')
      .populate('approvedBy', 'username email');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create leave request
export const createLeave = async (req, res) => {
  try {
    const { employee, leaveType, startDate, endDate, reason } = req.body;

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      employee,
      leaveType,
      startDate,
      endDate,
      duration,
      reason
    });

    // Log activity
    await ActivityLog.create({
      user: employee,
      userModel: 'Employee',
      action: 'Created leave request',
      entityType: 'Leave',
      entityId: leave._id,
      details: `${leaveType} for ${duration} days`
    });

    res.status(201).json({ success: true, message: 'Leave request created', data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update leave status
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason, approvedBy } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    leave.status = status;
    if (status === 'Approved' || status === 'Rejected') {
      leave.approvedBy = approvedBy;
      leave.approvedDate = new Date();
    }
    if (status === 'Rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    // Auto-sync to Attendance table when leave is approved
    if (status === 'Approved' && leave.startDate && leave.endDate) {
      const cur = new Date(leave.startDate);
      cur.setHours(0, 0, 0, 0);
      const end = new Date(leave.endDate);
      end.setHours(23, 59, 59, 999);

      while (cur <= end) {
        const dayDate = new Date(cur);
        dayDate.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({
          employee: leave.employee,
          date: dayDate
        });

        if (!existing) {
          await Attendance.create({
            employee: leave.employee,
            date: dayDate,
            status: 'On Leave',
            notes: `Approved ${leave.leaveType}`
          });
        } else if (!existing.checkIn) {
          existing.status = 'On Leave';
          await existing.save();
        }

        cur.setDate(cur.getDate() + 1);
      }
    }

    // Log activity
    await ActivityLog.create({
      user: approvedBy,
      userModel: 'Admin',
      action: `${status} leave request`,
      entityType: 'Leave',
      entityId: leave._id
    });

    res.json({ success: true, message: `Leave ${status.toLowerCase()}`, data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Cancel leave (employee cancels their own pending leave)
export const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending leaves can be cancelled' });
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Leave request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete leave
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    res.json({ success: true, message: 'Leave deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get leave statistics
export const getLeaveStats = async (req, res) => {
  try {
    const currentUser = req.user || req.admin;
    let matchQuery = {};
    if (currentUser && currentUser.role === 'employee' && currentUser.id) {
      matchQuery.employee = new mongoose.Types.ObjectId(currentUser.id);
    }

    const stats = await Leave.aggregate([
      ...(Object.keys(matchQuery).length > 0 ? [{ $match: matchQuery }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$duration' }
        }
      }
    ]);

    const leaveTypeStats = await Leave.aggregate([
      ...(Object.keys(matchQuery).length > 0 ? [{ $match: matchQuery }] : []),
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ success: true, data: { statusStats: stats, typeStats: leaveTypeStats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
