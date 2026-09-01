import express from 'express';
import * as departmentController from '../controllers/department.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';


const router = express.Router();

// Admin-only department management
router.get('/', verifyToken, requireRole('admin'), departmentController.getAllDepartments);
router.get('/stats', verifyToken, requireRole('admin'), departmentController.getDepartmentStats);
router.get('/:id', verifyToken, requireRole('admin'), departmentController.getDepartmentById);
router.post('/', verifyToken, requireRole('admin'), departmentController.createDepartment);
router.put('/:id', verifyToken, requireRole('admin'), departmentController.updateDepartment);
router.delete('/:id', verifyToken, requireRole('admin'), departmentController.deleteDepartment);

export default router;
