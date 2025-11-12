import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorizeRoles } from '../middleware/auth';
import {
  getAvailableSurplus,
  createRequest,
  getNGORequests,
  updateRequest,
  claimSurplus,
  getNGOImpact,
  getUrgentNeeds,
  markRequestReceived,
  getClaimedSurplus,
  confirmSurplusReceived,
  submitDonationFeedback,
} from '../controllers/ngoController';
import { getNGOLeaderboard } from '../controllers/leaderboardController';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('ngo'));

const requestValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['food', 'clothing', 'medical', 'educational', 'other']),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('urgency').isIn(['low', 'medium', 'high', 'critical']),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
];

router.get('/surplus', getAvailableSurplus);
router.post('/request', requestValidation, createRequest);
router.get('/request', getNGORequests);
router.patch('/request/:id', updateRequest);
router.patch('/request/:id/received', markRequestReceived);
router.post('/claim/:id', claimSurplus);
router.get('/claimed-surplus', getClaimedSurplus);
router.post('/surplus/:id/confirm-received', confirmSurplusReceived);
router.post('/surplus/:id/feedback', submitDonationFeedback);
router.get('/urgent-needs', getUrgentNeeds);
router.get('/impact', getNGOImpact);
router.get('/leaderboard', getNGOLeaderboard);

export default router;
