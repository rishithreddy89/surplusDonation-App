import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address (e.g., example@email.com)'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['donor', 'ngo', 'logistics', 'admin']).withMessage('Invalid role'),
  body('location').trim().notEmpty().withMessage('Location is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);

export default router;
