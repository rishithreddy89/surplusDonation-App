import mongoose, { Document, Schema } from 'mongoose';

export interface ISurplus extends Document {
  donorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'food' | 'clothing' | 'medical' | 'educational' | 'other';
  quantity: number;
  unit: string;
  expiryDate?: Date;
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: 'available' | 'claimed' | 'accepted' | 'in-transit' | 'delivered' | 'expired';
  claimedBy?: mongoose.Types.ObjectId;
  logisticsPartnerId?: mongoose.Types.ObjectId;
  images?: string[];
  ngoFeedback?: {
    rating: number;
    title: string;
    message: string;
    impact: string;
    submittedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const surplusSchema = new Schema<ISurplus>(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['food', 'clothing', 'medical', 'educational', 'other'],
      required: [true, 'Category is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
    },
    expiryDate: {
      type: Date,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    status: {
      type: String,
      enum: ['available', 'claimed', 'accepted', 'in-transit', 'delivered', 'expired'],
      default: 'available',
    },
    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    logisticsPartnerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    images: [String],
    ngoFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      title: String,
      message: String,
      impact: String,
      submittedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
surplusSchema.index({ 'location.coordinates': '2dsphere' });

const Surplus = mongoose.model<ISurplus>('Surplus', surplusSchema);

export default Surplus;
