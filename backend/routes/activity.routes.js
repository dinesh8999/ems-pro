import express from 'express';
import * as activityController from '../controllers/activity.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();

router.get('/', activityController.getAllLogs);
router.get('/recent', activityController.getRecentActivity);
router.get('/stats', activityController.getActivityStats);
router.get('/:entityType/:entityId', activityController.getLogsByEntity);

// Create activity (any authenticated user)
router.post('/', verifyToken, activityController.createActivity);

// Delete activity (admin only)
router.delete('/:id', verifyToken, requireRole('admin'), activityController.deleteActivity);

export default router;
