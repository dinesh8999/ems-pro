import express from 'express';
import * as leaveController from '../controllers/leave.controller.js';
import verifyToken from '../middleware/verifyToken.js';


const router = express.Router();

// Protected leave routes (authenticated users)
router.get('/', verifyToken, leaveController.getAllLeaves);
router.get('/stats', verifyToken, leaveController.getLeaveStats);
router.get('/:id', verifyToken, leaveController.getLeaveById);
router.post('/', verifyToken, leaveController.createLeave);
router.put('/:id/status', verifyToken, leaveController.updateLeaveStatus);
router.delete('/:id/cancel', verifyToken, leaveController.cancelLeave);
router.delete('/:id', verifyToken, leaveController.deleteLeave);

export default router;
