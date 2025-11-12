import express from 'express';
import { authenticate, requireVerification } from '../middleware/auth';
import {
  getEligibleNGOs,
  createDonation,
  confirmPayment,
  getDonationHistory,
  downloadDonationReceipt,
} from '../controllers/donationController';

const router = express.Router();

router.use(authenticate);

router.get('/ngos', getEligibleNGOs);
router.post('/donate', requireVerification, createDonation);
router.post('/confirm-payment', confirmPayment);
router.get('/history', getDonationHistory);
router.get('/receipt/:donationId', downloadDonationReceipt);

export default router;
