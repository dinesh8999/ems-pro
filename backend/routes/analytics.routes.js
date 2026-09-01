import express from 'express';
import { getAnalytics } from '../controllers/analytics.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();

// Admin only
router.get('/', verifyToken, requireRole('admin'), getAnalytics);

export default router;
