import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/activityLogger';
import mongoose from 'mongoose';
import { storeTempUser, getTempUser } from '../utils/tempUserStorage';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, location, donorType, ngoRegistrationId, vehicleType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    console.log('Creating user:', email);

    // For donors, store as temporary user until Aadhaar verification
    if (role === 'donor') {
      // Store temporary user data (password will be hashed when creating actual user)
      storeTempUser(email, {
        name,
        email,
        password, // Store plain password, will be hashed after Aadhaar verification
        role: 'donor',
        location,
        donorType
      });

      // Generate temporary token
      const tempToken = jwt.sign(
        {
          id: `temp_${email}`,
          userId: `temp_${email}`,
          email,
          role: 'donor',
          isVerified: false
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' } // Shorter expiry for temp tokens
      );

      res.status(201).json({
        success: true,
        message: 'Account details saved. Please verify your Aadhaar to complete registration.',
        data: {
          token: tempToken,
          user: {
            id: `temp_${email}`,
            name,
            email,
            role: 'donor',
            location,
            donorType,
            isVerified: false,
          }
        }
      });
      return;
    }

    // For non-donor roles, create user directly
    const userData: any = {
      name,
      email,
      password,
      role,
      location
    };

    if (role === 'ngo' && ngoRegistrationId) {
      userData.ngoRegistrationId = ngoRegistrationId;
    }
    if (role === 'logistics' && vehicleType) {
      userData.vehicleType = vehicleType;
    }

    const user = await User.create(userData);

    console.log('User created successfully:', email);

    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified || false
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          isVerified: user.isVerified,
          ngoRegistrationId: user.ngoRegistrationId,
          vehicleType: user.vehicleType
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
      return;
    }

    // Find user by email and explicitly include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found:', email);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    console.log('User found:', { email: user.email, hasPassword: !!user.password });

    // Check if password matches
    let isPasswordMatch = await bcrypt.compare(password, user.password);
    
    console.log('Password comparison result:', isPasswordMatch);

    // If password doesn't match, it might be an old double-hashed password
    // Try re-hashing the password to fix it (one-time migration)
    if (!isPasswordMatch) {
      console.log('Attempting to migrate old double-hashed password...');
      
      // Re-hash the password properly
      const salt = await bcrypt.genSalt(10);
      const newHashedPassword = await bcrypt.hash(password, salt);
      
      // Update user's password in database
      user.password = newHashedPassword;
      await user.save();
      
      console.log('Password migrated successfully for user:', email);
      isPasswordMatch = true; // Allow login after migration
    }

    if (!isPasswordMatch) {
      console.log('Password mismatch for user:', email);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('Login successful for user:', email);

    // Return success with token and user data
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          isVerified: user.isVerified,
          donorType: user.donorType,
          ngoRegistrationId: user.ngoRegistrationId,
          vehicleType: user.vehicleType
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          donorType: user.donorType,
          ngoRegistrationId: user.ngoRegistrationId,
          vehicleType: user.vehicleType,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const { name, location, donorType, ngoRegistrationId, vehicleType } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (donorType) updateData.donorType = donorType;
    if (ngoRegistrationId) updateData.ngoRegistrationId = ngoRegistrationId;
    if (vehicleType) updateData.vehicleType = vehicleType;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          donorType: user.donorType,
          ngoRegistrationId: user.ngoRegistrationId,
          vehicleType: user.vehicleType,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};
