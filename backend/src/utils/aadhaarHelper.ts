import crypto from 'crypto';

const AADHAAR_SALT = process.env.AADHAAR_SALT || 'default-salt-change-in-production';

export const maskAadhaar = (aadhaar: string): string => {
  return `XXXX XXXX ${aadhaar.slice(-4)}`;
};

export const hashAadhaar = (aadhaar: string): string => {
  return crypto
    .createHmac('sha256', AADHAAR_SALT)
    .update(aadhaar)
    .digest('hex');
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// In-memory OTP storage (use Redis in production)
interface OTPStore {
  otp: string;
  attempts: number;
  expiresAt: number;
}

const otpStore = new Map<string, OTPStore>();

export const storeOTP = (aadhaar: string, otp: string): void => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(aadhaar, { otp, attempts: 0, expiresAt });
};

export const verifyOTP = (aadhaar: string, otp: string): { success: boolean; message: string } => {
  const stored = otpStore.get(aadhaar);
  
  if (!stored) {
    return { success: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(aadhaar);
    return { success: false, message: 'OTP expired' };
  }
  
  if (stored.attempts >= 5) {
    otpStore.delete(aadhaar);
    return { success: false, message: 'Maximum OTP attempts exceeded' };
  }
  
  stored.attempts++;
  
  if (stored.otp !== otp) {
    return { success: false, message: 'Invalid OTP' };
  }
  
  otpStore.delete(aadhaar);
  return { success: true, message: 'OTP verified successfully' };
};

export const clearOTP = (aadhaar: string): void => {
  otpStore.delete(aadhaar);
};
