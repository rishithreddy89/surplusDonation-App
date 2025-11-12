import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { startAadhaarVerify, confirmAadhaarVerify, getAadhaarStatus } from '../controllers/aadhaarController';

const router = express.Router();

// Rate limiting for OTP generation - returns JSON
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Increased to 10 requests for development (change to 3 in production)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime 
      ? Math.ceil((new Date(resetTime).getTime() - Date.now()) / 1000)
      : 900; // 15 minutes in seconds as fallback
    
    res.status(429).json({
      success: false,
      message: 'Too many OTP requests. Please try again after 15 minutes.',
      retryAfter
    });
  }
});

router.post('/start-aadhaar-verify', authenticate, authorizeRoles('donor'), otpLimiter, startAadhaarVerify);
router.post('/confirm-aadhaar-verify', authenticate, authorizeRoles('donor'), confirmAadhaarVerify);
router.get('/aadhaar-status', authenticate, authorizeRoles('donor'), getAadhaarStatus);

export default router;
