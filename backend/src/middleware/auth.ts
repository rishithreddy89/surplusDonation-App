import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface DecodedToken {
  id: string;
  userId?: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
  iat: number;
  exp: number;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    isVerified?: boolean;
  };
}

// Helper function to verify JWT token
const verifyToken = (token: string): DecodedToken => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as DecodedToken;
};

// Protect routes - verify JWT token
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Get user from token - handle both 'id' and 'userId' from token
      const userId = decoded.userId || decoded.id;
      req.user = await User.findById(userId).select('-password');

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      next();
    } catch (err) {
      console.error('Token verification error:', err);
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
};

// Authorize specific roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
      return;
    }

    next();
  };
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    // Handle both 'id' and 'userId' from token
    const userId = decoded.userId || decoded.id;
    
    req.user = {
      userId: userId,
      email: decoded.email || '',
      role: decoded.role || '',
      isVerified: decoded.isVerified
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    next();
  };
};

export const requireVerification = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Check if it's a temporary user
  if (req.user.userId.startsWith('temp_')) {
    return res.status(403).json({
      success: false,
      message: 'Please complete Aadhaar verification to access this feature',
      requiresAadhaarVerification: true,
    });
  }

  // For donors, require verification
  if (req.user.role === 'donor' && !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your Aadhaar to access this feature',
      requiresAadhaarVerification: true,
    });
  }

  next();
};
