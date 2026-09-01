import express from 'express';
import * as attendanceController from '../controllers/attendance.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Protected attendance routes
router.get('/', verifyToken, attendanceController.getAllAttendance);
router.get('/stats', verifyToken, attendanceController.getAttendanceStats);
router.get('/department-codes', verifyToken, attendanceController.getDepartmentCodes);
router.get('/today-code', verifyToken, attendanceController.getTodayAttendanceCode);
router.post('/checkin', verifyToken, attendanceController.checkIn);
router.post('/checkout', verifyToken, attendanceController.checkOut);
router.post('/', verifyToken, attendanceController.markAttendance);
router.put('/:id', verifyToken, attendanceController.updateAttendance);
router.delete('/:id', verifyToken, attendanceController.deleteAttendance);

export default router;
