import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: mongoose.Types.ObjectId;
  description: string;
  metadata?: any;
  ipAddress?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete', 'login', 'logout', 'register', 'claim', 'accept', 'deliver'],
    },
    resourceType: {
      type: String,
      required: true,
      enum: ['user', 'surplus', 'task', 'request', 'notification', 'auth'],
    },
    resourceId: {
      type: Schema.Types.ObjectId,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: Schema.Types.Mixed,
    ipAddress: String,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ resourceType: 1 });
activityLogSchema.index({ action: 1 });

const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

export default ActivityLog;
