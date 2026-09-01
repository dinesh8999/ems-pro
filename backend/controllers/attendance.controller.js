import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import ActivityLog from '../models/ActivityLog.js';
import { validateAttendanceCode, getTodayCode } from '../config/departmentCodes.js';
import mongoose from 'mongoose';

export const syncApprovedLeavesToAttendance = async () => {
  try {
    const approvedLeaves = await Leave.find({ status: 'Approved' });
    for (const leave of approvedLeaves) {
      if (!leave.startDate || !leave.endDate) continue;
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
        } else if (existing.status !== 'On Leave' && !existing.checkIn) {
          existing.status = 'On Leave';
          await existing.save();
        }

        cur.setDate(cur.getDate() + 1);
      }
    }
  } catch (err) {
    console.error('Error syncing approved leaves to attendance:', err);
  }
};

export const autoMarkAbsentEmployees = async () => {
  try {
    const employees = await Employee.find({ status: { $ne: 'inactive' } });
    if (employees.length === 0) return;

    // Get all distinct dates from existing attendance & approved leaves
    const attendanceDates = await Attendance.find({}, 'date');
    const leaveDates = await Leave.find({ status: 'Approved' }, 'startDate endDate');

    const dateMap = new Map();
    
    // Process existing attendance dates
    attendanceDates.forEach(a => {
      if (a.date) {
        const d = new Date(a.date);
        d.setHours(0, 0, 0, 0);
        dateMap.set(d.getTime(), d);
      }
    });

    // Process approved leave dates
    leaveDates.forEach(l => {
      if (l.startDate && l.endDate) {
        let cur = new Date(l.startDate);
        cur.setHours(0, 0, 0, 0);
        const end = new Date(l.endDate);
        end.setHours(23, 59, 59, 999);
        while (cur <= end) {
          const d = new Date(cur);
          d.setHours(0, 0, 0, 0);
          dateMap.set(d.getTime(), d);
          cur.setDate(cur.getDate() + 1);
        }
      }
    });

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    for (const [timestamp, dayDate] of dateMap.entries()) {
      // If date is today and current time is before 6:00 PM (18:00), skip today's auto-absent mark
      if (timestamp === todayMidnight && now.getHours() < 18) {
        continue;
      }

      for (const emp of employees) {
        // Skip employee if date is before employee's join/creation date
        const empCreated = emp.joinDate || emp.createdAt;
        if (empCreated) {
          const empStart = new Date(empCreated);
          empStart.setHours(0, 0, 0, 0);
          if (dayDate < empStart) continue;
        }

        const existing = await Attendance.findOne({
          employee: emp._id,
          date: dayDate
        });

        if (!existing) {
          await Attendance.create({
            employee: emp._id,
            date: dayDate,
            status: 'Absent',
            workHours: 0,
            notes: 'Auto-marked Absent (No check-in by EOD)'
          });
        }
      }
    }
  } catch (err) {
    console.error('Error auto-marking absentees:', err);
  }
};

// Get all attendance records
export const getAllAttendance = async (req, res) => {
  try {
    await syncApprovedLeavesToAttendance();
    await autoMarkAbsentEmployees();

    const { employeeId, employee: employeeParam, startDate, endDate, status } = req.query;
    const empId = employeeId || employeeParam;
    let query = {};
    
    if (empId) query.employee = empId;
    if (status) query.status = status;
    if (startDate && endDate) {
      const [sY, sM, sD] = startDate.split('-');
      const start = new Date(Number(sY), Number(sM) - 1, Number(sD), 0, 0, 0, 0);
      
      const [eY, eM, eD] = endDate.split('-');
      const end = new Date(Number(eY), Number(eM) - 1, Number(eD), 23, 59, 59, 999);
      
      query.date = { 
        $gte: start, 
        $lte: end 
      };
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'name email department position')
      .sort({ date: -1 });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check-in
export const checkIn = async (req, res) => {
  try {
    const { employee, departmentCode } = req.body;
    
    // Get employee details
    const emp = await Employee.findById(employee);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Validate today's attendance code
    if (!validateAttendanceCode(departmentCode)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid attendance code. Please ask your administrator for today\'s code.' 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await Attendance.findOne({
      employee,
      date: today
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const checkInTime = new Date();
    const workStartTime = new Date(today);
    workStartTime.setHours(9, 0, 0, 0); // 9 AM

    const status = checkInTime > workStartTime ? 'Late' : 'Present';

    const attendance = await Attendance.create({
      employee,
      date: today,
      checkIn: checkInTime,
      status,
      departmentCode
    });

    // Log activity
    await ActivityLog.create({
      user: employee,
      userModel: 'Employee',
      action: 'Checked in',
      entityType: 'Attendance',
      entityId: attendance._id,
      details: `Status: ${status}`
    });

    res.status(201).json({ 
      success: true, 
      message: `Checked in successfully as ${status}`, 
      data: attendance 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Check-out
export const checkOut = async (req, res) => {
  try {
    const { employee } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No check-in record found' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out' });
    }

    const checkOutTime = new Date();
    attendance.checkOut = checkOutTime;
    
    // Calculate work hours
    const workHours = (checkOutTime - attendance.checkIn) / (1000 * 60 * 60);
    attendance.workHours = parseFloat(workHours.toFixed(2));

    // Update status based on work hours
    if (workHours < 4) {
      attendance.status = 'Half-Day';
    }

    await attendance.save();

    // Log activity
    await ActivityLog.create({
      user: employee,
      userModel: 'Employee',
      action: 'Checked out',
      entityType: 'Attendance',
      entityId: attendance._id,
      details: `Work hours: ${attendance.workHours}`
    });

    res.json({ success: true, message: 'Checked out successfully', data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Mark attendance manually
export const markAttendance = async (req, res) => {
  try {
    const { employee, date, status, checkIn, checkOut, notes } = req.body;

    let workHours = 0;
    if (checkIn && checkOut) {
      workHours = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
      workHours = parseFloat(workHours.toFixed(2));
    }

    const attendance = await Attendance.create({
      employee,
      date,
      status,
      checkIn: checkIn || new Date(),
      checkOut,
      workHours,
      notes
    });

    res.status(201).json({ success: true, message: 'Attendance marked', data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get attendance statistics
export const getAttendanceStats = async (req, res) => {
  try {
    const { employeeId, month, year, startDate, endDate } = req.query;
    
    let matchQuery = {};
    if (employeeId) matchQuery.employee = new mongoose.Types.ObjectId(employeeId);
    
    // Use date range if provided, otherwise use month/year
    if (startDate && endDate) {
      const [sY, sM, sD] = startDate.split('-');
      const start = new Date(Number(sY), Number(sM) - 1, Number(sD), 0, 0, 0, 0);
      
      const [eY, eM, eD] = endDate.split('-');
      const end = new Date(Number(eY), Number(eM) - 1, Number(eD), 23, 59, 59, 999);
      
      matchQuery.date = { 
        $gte: start, 
        $lte: end 
      };
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      matchQuery.date = { $gte: start, $lte: end };
    }

    const stats = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgWorkHours: { $avg: '$workHours' }
        }
      }
    ]);

    const totalDays = await Attendance.countDocuments(matchQuery);
    const totalWorkHours = await Attendance.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$workHours' } } }
    ]);

    // Format the response for easier frontend consumption
    const present = stats.find(s => s._id === 'Present')?.count || 0;
    const late = stats.find(s => s._id === 'Late')?.count || 0;
    const absent = stats.find(s => s._id === 'Absent')?.count || 0;
    
    const attendanceRate = totalDays > 0 
      ? ((present + late) / totalDays) * 100 
      : 0;

    res.json({ 
      success: true, 
      data: { 
        present,
        late,
        absent,
        attendanceRate,
        statusStats: stats, 
        totalDays,
        totalWorkHours: totalWorkHours[0]?.total || 0
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update attendance
export const updateAttendance = async (req, res) => {
  try {
    const { status, checkOut, notes } = req.body;
    
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (status) attendance.status = status;
    if (checkOut) {
      attendance.checkOut = checkOut;
      const workHours = (new Date(checkOut) - attendance.checkIn) / (1000 * 60 * 60);
      attendance.workHours = parseFloat(workHours.toFixed(2));
    }
    if (notes) attendance.notes = notes;

    await attendance.save();

    res.json({ success: true, message: 'Attendance updated', data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete attendance
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.json({ success: true, message: 'Attendance deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get department codes
export const getDepartmentCodes = async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({ success: false, message: 'Department is required' });
    }

    const { getDepartmentCodes: getCodes } = await import('../config/departmentCodes.js');
    const codes = getCodes(department);

    res.json({ 
      success: true, 
      data: { department, codes } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get today's attendance code (Admin only)
export const getTodayAttendanceCode = async (req, res) => {
  try {
    const todayCode = getTodayCode();
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    res.json({ 
      success: true, 
      data: { 
        code: todayCode,
        date: date,
        message: 'Share this code with employees for today\'s attendance'
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
