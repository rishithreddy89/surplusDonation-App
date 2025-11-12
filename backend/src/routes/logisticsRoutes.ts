import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import {
  getAvailableTasks,
  getMyTasks,
  acceptTask,
  updateTaskStatus,
  getPerformance,
  volunteerPickupTask,
  completeVolunteerDelivery,
  getVolunteerStats,
  getLeaderboard,
  getPublicProfile,
} from '../controllers/logisticsController';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('logistics'));

router.get('/tasks', getAvailableTasks);
router.get('/my-tasks', getMyTasks);
router.post('/tasks/accept/:id', acceptTask);
router.patch('/tasks/status/:id', updateTaskStatus);
router.get('/performance', getPerformance);

// Volunteer routes
router.post('/volunteer/pickup/:id', volunteerPickupTask);
router.post('/volunteer/complete/:id', completeVolunteerDelivery);
router.get('/volunteer/stats', getVolunteerStats);
router.get('/volunteer/leaderboard', getLeaderboard);
router.get('/volunteer/profile/:userId', getPublicProfile);

export default router;
