import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  userId: mongoose.Types.ObjectId;
  userRole: 'donor' | 'ngo' | 'logistics' | 'admin';
  title: string;
  description: string;
  category: 'service' | 'delivery' | 'quality' | 'behavior' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  relatedTo?: {
    type: 'surplus' | 'request' | 'task' | 'user';
    id: mongoose.Types.ObjectId;
  };
  proofUrls: string[];
  adminResponse?: string;
  adminId?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['donor', 'ngo', 'logistics', 'admin'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['service', 'delivery', 'quality', 'behavior', 'technical', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['surplus', 'request', 'task', 'user']
    },
    id: Schema.Types.ObjectId
  },
  proofUrls: [{
    type: String
  }],
  adminResponse: {
    type: String,
    trim: true
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date
}, {
  timestamps: true
});

// Indexes for faster queries
ComplaintSchema.index({ userId: 1, status: 1 });
ComplaintSchema.index({ status: 1, priority: 1 });
ComplaintSchema.index({ createdAt: -1 });

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
