import { Request, Response } from 'express';
import MockAadhaar from '../models/MockAadhaar';
import User from '../models/User';
import { maskAadhaar, hashAadhaar, generateOTP, storeOTP, verifyOTP } from '../utils/aadhaarHelper';
import { generateToken } from '../utils/jwt';
import { sendOTPSMS } from '../utils/smsService';
import { getTempUser, deleteTempUser } from '../utils/tempUserStorage';
import { logActivity } from '../utils/activityLogger';
import mongoose from 'mongoose';

export const startAadhaarVerify = async (req: Request, res: Response) => {
  try {
    const { aadhaar } = req.body;
    const userEmail = (req as any).user?.email;

    if (!aadhaar || aadhaar.length !== 12 || !/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number. Must be 12 digits.',
      });
    }

    // First check if temp user exists (for new registrations)
    const tempUser = getTempUser(userEmail);
    
    if (!tempUser) {
      // If no temp user, check if actual user exists (for existing donors re-verifying)
      const existingUser = await User.findOne({ email: userEmail });
      
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please register first.',
        });
      }

      if (existingUser.role !== 'donor') {
        return res.status(403).json({
          success: false,
          message: 'Aadhaar verification is only available for donors',
        });
      }

      // Check if already verified
      if (existingUser.isAadhaarVerified) {
        return res.status(400).json({
          success: false,
          message: 'Aadhaar already verified',
        });
      }
    }

    // Look up in mock database
    const mockRecord = await MockAadhaar.findOne({ aadhaar });
    
    if (!mockRecord) {
      return res.status(404).json({
        success: false,
        message: 'Aadhaar number not found in our records',
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(aadhaar, otp);

    // Send OTP via SMS
    const smsResult = await sendOTPSMS(mockRecord.linkedPhone, otp, mockRecord.name);

    const responseData: any = {
      maskedPhone: `XXXXXX${mockRecord.linkedPhone.slice(-4)}`,
    };

    // Include OTP in response only in demo mode
    if (smsResult.demoMode) {
      responseData.demoOtp = otp;
      responseData.demoMessage = '🔐 Demo Mode: Use the OTP shown in console or above';
    }

    const message = smsResult.demoMode 
      ? `Demo Mode: OTP sent to console. OTP: ${otp}`
      : `OTP sent to ${responseData.maskedPhone}`;

    res.status(200).json({
      success: true,
      message,
      data: responseData,
    });
  } catch (error: any) {
    console.error('Start Aadhaar verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Aadhaar verification',
    });
  }
};

export const confirmAadhaarVerify = async (req: Request, res: Response) => {
  try {
    const { aadhaar, otp } = req.body;
    const userEmail = (req as any).user?.email;

    if (!aadhaar || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar and OTP are required',
      });
    }

    // Verify OTP
    const verification = verifyOTP(aadhaar, otp);
    
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    // Get temporary user data
    const tempUser = getTempUser(userEmail);
    
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: 'Registration session expired. Please register again.',
      });
    }

    // Create user in database now that Aadhaar is verified
    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      role: 'donor',
      location: tempUser.location,
      donorType: tempUser.donorType,
      aadhaarMasked: maskAadhaar(aadhaar),
      aadhaarHash: hashAadhaar(aadhaar),
      isAadhaarVerified: true,
      aadhaarVerifiedAt: new Date(),
      isVerified: true,
    });

    await newUser.save();

    // Delete temporary user data
    deleteTempUser(userEmail);

    // Log registration activity
    await logActivity({
      userId: newUser._id as mongoose.Types.ObjectId,
      action: 'register',
      resourceType: 'user',
      resourceId: newUser._id as mongoose.Types.ObjectId,
      description: `New donor account created with Aadhaar verification: ${newUser.name}`,
      metadata: { email: newUser.email, role: 'donor', aadhaarVerified: true },
      ipAddress: req.ip,
    });

    // Generate new token with actual user ID
    const newToken = generateToken({
      userId: String(newUser._id),
      email: newUser.email,
      role: newUser.role,
      isVerified: true,
    });

    res.status(200).json({
      success: true,
      message: 'Aadhaar verified successfully! Your registration is now complete.',
      data: {
        aadhaarMasked: newUser.aadhaarMasked,
        isVerified: true,
        verifiedAt: newUser.aadhaarVerifiedAt,
        token: newToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          location: newUser.location,
          donorType: newUser.donorType,
          isVerified: true,
          isAadhaarVerified: true,
          aadhaarMasked: newUser.aadhaarMasked,
        },
      },
    });
  } catch (error: any) {
    console.error('Confirm Aadhaar verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify Aadhaar',
    });
  }
};

export const getAadhaarStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    // Check if it's a temporary user
    if (userId.startsWith('temp_')) {
      return res.status(200).json({
        success: true,
        data: {
          aadhaarMasked: null,
          isVerified: false,
          verifiedAt: null,
        },
      });
    }

    const user = await User.findById(userId).select('aadhaarMasked isAadhaarVerified aadhaarVerifiedAt role');

    if (!user || user.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        aadhaarMasked: user.aadhaarMasked || null,
        isVerified: user.isAadhaarVerified || false,
        verifiedAt: user.aadhaarVerifiedAt || null,
      },
    });
  } catch (error: any) {
    console.error('Get Aadhaar status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Aadhaar status',
    });
  }
};
