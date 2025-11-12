import twilio from 'twilio';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const isDemoMode = process.env.SMS_DEMO_MODE === 'true' || !accountSid || !authToken;

// Debug log to check if credentials are loaded
console.log('🔍 Twilio Setup Check:');
console.log('Account SID:', accountSid ? `${accountSid.substring(0, 10)}...` : 'NOT SET');
console.log('Auth Token:', authToken ? `${authToken.substring(0, 6)}...` : 'NOT SET');
console.log('Phone Number:', twilioPhoneNumber || 'NOT SET');
console.log('Environment:', process.env.NODE_ENV);

let twilioClient: any = null;

// Initialize Twilio client - simplified check
if (!isDemoMode && accountSid && authToken && twilioPhoneNumber && 
    accountSid.startsWith('AC') && accountSid.length > 30) {
  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized successfully');
  } catch (error: any) {
    console.error('❌ Failed to initialize Twilio client:', error.message);
  }
} else {
  console.warn('⚠️  Twilio not configured properly.');
  console.warn('Check:', {
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasPhoneNumber: !!twilioPhoneNumber,
    accountSidValid: accountSid?.startsWith('AC') && (accountSid?.length || 0) > 30
  });
}

export const sendOTPSMS = async (phone: string, otp: string, name: string) => {
  // Always log to console for debugging
  console.log('\n🔐 ===== AADHAAR OTP VERIFICATION =====');
  console.log(`👤 Name: ${name}`);
  console.log(`📱 Phone: ${phone}`);
  console.log(`🔢 OTP: ${otp}`);
  console.log(`⏰ Valid for: 5 minutes`);
  console.log('=====================================\n');

  // If demo mode or Twilio not configured, return demo response
  if (isDemoMode || !twilioClient) {
    console.log('📱 Demo Mode: SMS not sent, OTP logged to console');
    return {
      success: true,
      demoMode: true,
      demoOtp: otp,
      message: `Demo Mode: OTP is ${otp}`
    };
  }

  // Try to send real SMS via Twilio
  try {
    const message = await twilioClient.messages.create({
      body: `Your Surplus Spark Network Aadhaar verification OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`,
      from: twilioPhoneNumber,
      to: phone
    });

    console.log('✅ SMS sent successfully:', message.sid);
    
    return {
      success: true,
      demoMode: false,
      messageSid: message.sid,
      message: 'OTP sent to your phone'
    };
  } catch (error: any) {
    console.error('❌ Twilio SMS Error:', {
      code: error.code,
      message: error.message,
      status: error.status,
      moreInfo: error.moreInfo
    });

    // Fallback to demo mode if SMS fails
    console.log('📱 [FALLBACK] OTP:', otp);
    
    return {
      success: true,
      demoMode: true,
      demoOtp: otp,
      error: error.message,
      message: `SMS sending failed. Demo OTP: ${otp}`
    };
  }
};
