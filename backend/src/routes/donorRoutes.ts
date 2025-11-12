import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorizeRoles, requireVerification } from '../middleware/auth';
import {
  createSurplus,
  getDonorSurplus,
  getSurplusById,
  updateSurplus,
  getDonorImpact,
  trackDonation,
  acceptSurplusRequest,
  rejectSurplusRequest,
  generateImpactCard,
  getPublicDonorProfile,
  requestTaxReceipt,
  getTaxReceipts,
  get80GEligibleNGOs,
  verifyPAN,
  downloadTaxReceipt,
  getPublicNGORequests,
  directDonateToNGO,
} from '../controllers/donorController';
import { getDonorLeaderboard } from '../controllers/leaderboardController';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('donor'));

const surplusValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['food', 'clothing', 'medical', 'educational', 'other']),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('unit').trim().notEmpty().withMessage('Unit is required'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
];

// ==================== SURPLUS ROUTES ====================
router.post('/surplus', surplusValidation, requireVerification, createSurplus);
router.get('/surplus', getDonorSurplus);
router.get('/surplus/:id', getSurplusById);
router.patch('/surplus/:id', updateSurplus);
router.post('/surplus/:id/accept', requireVerification, acceptSurplusRequest);
router.post('/surplus/:id/reject', requireVerification, rejectSurplusRequest);
router.post('/surplus/:id/direct-donate', requireVerification, directDonateToNGO);

// ==================== TAX RECEIPT ROUTES (MUST COME FIRST) ====================
router.get('/tax-receipts', getTaxReceipts);
router.get('/tax-receipt/download/:receiptId', downloadTaxReceipt);
router.post('/tax-receipt/:surplusId', requireVerification, requestTaxReceipt);

// ==================== OTHER ROUTES ====================
router.get('/impact', getDonorImpact);
router.get('/tracking/:id', trackDonation);
router.get('/leaderboard', getDonorLeaderboard);
router.get('/impact-card/:id', generateImpactCard);
router.get('/public-profile/:donorId', getPublicDonorProfile);
router.get('/80g-ngos', get80GEligibleNGOs);
router.post('/verify-pan', verifyPAN);

// ==================== NGO REQUESTS ROUTE ====================
router.get('/ngo-requests', getPublicNGORequests);

export default router;
