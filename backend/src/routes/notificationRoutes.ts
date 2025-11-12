import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
