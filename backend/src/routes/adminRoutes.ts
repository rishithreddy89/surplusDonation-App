import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import {
  getAllUsers,
  getAllSurplus,
  getAllTasks,
  getAllRequests,
  verifyUser,
  deleteUser,
  getPlatformStats,
  getActivityLogs,
} from '../controllers/adminController';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorizeRoles('admin'));

// Platform statistics
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:userId/verify', verifyUser);
router.delete('/users/:userId', deleteUser);

// Surplus management
router.get('/surplus', getAllSurplus);

// Task management
router.get('/tasks', getAllTasks);

// Request management
router.get('/requests', getAllRequests);

// Activity logs
router.get('/logs', getActivityLogs);

export default router;
