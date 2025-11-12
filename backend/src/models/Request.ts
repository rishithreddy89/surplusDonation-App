import mongoose, { Document, Schema } from 'mongoose';

export interface IRequest extends Document {
  ngoId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'food' | 'clothing' | 'medical' | 'educational' | 'other';
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'partially-fulfilled' | 'fulfilled' | 'closed';
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  neededBy?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new Schema<IRequest>(
  {
    ngoId: {
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
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'partially-fulfilled', 'fulfilled', 'closed'],
      default: 'open',
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
    neededBy: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model<IRequest>('Request', requestSchema);

export default Request;
