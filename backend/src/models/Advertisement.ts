import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertisement extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  targetRoles: ('donor' | 'ngo' | 'logistics')[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  clicks: number;
  impressions: number;
  createdAt: Date;
  updatedAt: Date;
}

const advertisementSchema = new Schema<IAdvertisement>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  targetRoles: {
    type: [String],
    enum: ['donor', 'ngo', 'logistics'],
    required: true,
    validate: {
      validator: function(v: string[]) {
        return v && v.length > 0;
      },
      message: 'At least one target role must be specified'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
advertisementSchema.index({ isActive: 1, targetRoles: 1 });
advertisementSchema.index({ createdAt: -1 });

export default mongoose.model<IAdvertisement>('Advertisement', advertisementSchema);
