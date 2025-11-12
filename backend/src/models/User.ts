import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'donor' | 'ngo' | 'logistics' | 'admin';
  location: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Donor specific fields
  donorType?: 'individual' | 'restaurant' | 'grocery' | 'hotel';
  aadhaarMasked?: string;
  aadhaarHash?: string;
  isAadhaarVerified?: boolean;
  aadhaarVerifiedAt?: Date;
  
  // NGO specific fields
  ngoRegistrationId?: string;
  
  // Logistics specific fields
  vehicleType?: 'bike' | 'car' | 'van' | 'truck';
  
  // Volunteer stats
  volunteerStats?: {
    totalDeliveries: number;
    activeDeliveries: number;
    peopleHelped: number;
    points: number;
    badges: string[];
    currentStreak: number;
    lastDeliveryDate?: Date;
  };
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['donor', 'ngo', 'logistics', 'admin'],
      required: [true, 'Role is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    
    // Donor specific fields
    donorType: {
      type: String,
      enum: ['individual', 'restaurant', 'grocery', 'hotel'],
      required: false,
    },
    aadhaarMasked: {
      type: String,
      required: false,
    },
    aadhaarHash: {
      type: String,
      required: false,
    },
    isAadhaarVerified: {
      type: Boolean,
      default: false,
    },
    aadhaarVerifiedAt: {
      type: Date,
      required: false,
    },
    
    // NGO specific fields
    ngoRegistrationId: {
      type: String,
      required: false,
    },
    
    // Logistics specific fields
    vehicleType: {
      type: String,
      enum: ['bike', 'car', 'van', 'truck'],
      required: false,
    },

    // Volunteer stats
    volunteerStats: {
      type: {
        totalDeliveries: { type: Number, default: 0 },
        activeDeliveries: { type: Number, default: 0 },
        peopleHelped: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
        badges: [{ type: String }],
        currentStreak: { type: Number, default: 0 },
        lastDeliveryDate: { type: Date },
      },
      required: false,
      default: () => ({
        totalDeliveries: 0,
        activeDeliveries: 0,
        peopleHelped: 0,
        points: 0,
        badges: [],
        currentStreak: 0,
      }),
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
