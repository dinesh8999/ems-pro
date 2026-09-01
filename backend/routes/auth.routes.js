import express from 'express';
import { signup, login, verifyTokenController, employeeRegister, updateAdminProfile, changeAdminPassword, logout } from '../controllers/auth.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { body } from 'express-validator';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// Public routes
router.post(
  '/signup',
  [
    body('username').isString().trim().notEmpty().withMessage('Username is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validateRequest,
  signup
);

router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  login
);

router.post(
  '/employee-register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').optional().isString().trim()
  ],
  validateRequest,
  employeeRegister
);

// Protected routes
router.get('/verify', verifyToken, verifyTokenController);
router.put('/profile', verifyToken, updateAdminProfile);
router.put('/change-password', verifyToken, changeAdminPassword);
router.post('/logout', verifyToken, logout);

export default router;
