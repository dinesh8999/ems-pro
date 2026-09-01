import express from 'express';
import * as performanceController from '../controllers/performance.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';


const router = express.Router();

// Admin-only performance management
router.get('/', verifyToken, requireRole('admin'), performanceController.getAllReviews);
router.get('/stats', verifyToken, requireRole('admin'), performanceController.getPerformanceStats);
router.get('/:id', verifyToken, requireRole('admin'), performanceController.getReviewById);
router.post('/', verifyToken, requireRole('admin'), performanceController.createReview);
router.put('/:id', verifyToken, requireRole('admin'), performanceController.updateReview);
router.delete('/:id', verifyToken, requireRole('admin'), performanceController.deleteReview);

export default router;
