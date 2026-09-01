import express from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  updateEmployeeProfile,
  deleteEmployee,
  updatePassword
} from '../controllers/employee.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// All routes are protected
router.use(verifyToken);

router.route('/')
  .get(getEmployees)
  .post(createEmployee);

router.route('/:id')
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

// Employee self-update (limited fields)
router.route('/:id/profile')
  .put(updateEmployeeProfile);

router.route('/:id/password')
  .put(updatePassword);

export default router;
