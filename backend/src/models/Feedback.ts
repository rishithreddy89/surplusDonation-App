import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  userRole: 'donor' | 'ngo' | 'logistics' | 'admin';
  type: 'general' | 'feature-request' | 'improvement' | 'appreciation' | 'bug-report';
  rating: number; // 1-5
  title: string;
  description: string;
  relatedTo?: {
    type: 'surplus' | 'request' | 'task' | 'delivery';
    id: mongoose.Types.ObjectId;
  };
  proofUrls: string[];
  isPublic: boolean;
  helpful: number;
  adminReviewed: boolean;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema({
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
  type: {
    type: String,
    enum: ['general', 'feature-request', 'improvement', 'appreciation', 'bug-report'],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
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
  relatedTo: {
    type: {
      type: String,
      enum: ['surplus', 'request', 'task', 'delivery']
    },
    id: Schema.Types.ObjectId
  },
  proofUrls: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  adminReviewed: {
    type: Boolean,
    default: false
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
FeedbackSchema.index({ userId: 1 });
FeedbackSchema.index({ rating: -1, createdAt: -1 });
FeedbackSchema.index({ type: 1, adminReviewed: 1 });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
