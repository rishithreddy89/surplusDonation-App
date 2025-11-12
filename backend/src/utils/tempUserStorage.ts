// In-memory storage for temporary users (use Redis in production)
interface TempUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  location: string;
  donorType?: string;
  createdAt: number;
}

const tempUsers = new Map<string, TempUserData>();

// Clean up expired temp users (older than 1 hour)
const TEMP_USER_EXPIRY = 60 * 60 * 1000; // 1 hour

setInterval(() => {
  const now = Date.now();
  for (const [email, data] of tempUsers.entries()) {
    if (now - data.createdAt > TEMP_USER_EXPIRY) {
      tempUsers.delete(email);
      console.log(`🗑️  Cleaned up expired temp user: ${email}`);
    }
  }
}, 10 * 60 * 1000); // Check every 10 minutes

export const storeTempUser = (email: string, userData: Omit<TempUserData, 'createdAt'>): void => {
  tempUsers.set(email, {
    ...userData,
    createdAt: Date.now()
  });
  console.log(`💾 Stored temporary user: ${email}`);
};

export const getTempUser = (email: string): TempUserData | null => {
  const user = tempUsers.get(email);
  if (!user) {
    console.log(`❌ Temp user not found: ${email}`);
    return null;
  }
  
  // Check if expired
  if (Date.now() - user.createdAt > TEMP_USER_EXPIRY) {
    tempUsers.delete(email);
    console.log(`⏰ Temp user expired: ${email}`);
    return null;
  }
  
  console.log(`✅ Retrieved temp user: ${email}`);
  return user;
};

export const deleteTempUser = (email: string): void => {
  tempUsers.delete(email);
  console.log(`🗑️  Deleted temp user: ${email}`);
};
