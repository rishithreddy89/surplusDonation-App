import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createFeedback,
  getUserFeedback,
  getAllFeedback,
  getPublicFeedback,
  markFeedbackHelpful,
  reviewFeedback,
  getFeedbackStats
} from '../controllers/feedbackController';

const router = express.Router();

// Public routes
router.get('/public', getPublicFeedback);

// User routes
router.post('/', authenticate, createFeedback);
router.get('/my-feedback', authenticate, getUserFeedback);
router.put('/:id/helpful', authenticate, markFeedbackHelpful);

// Admin routes
router.get('/all', authenticate, getAllFeedback);
router.put('/:id/review', authenticate, reviewFeedback);
router.get('/stats', authenticate, getFeedbackStats);

export default router;
