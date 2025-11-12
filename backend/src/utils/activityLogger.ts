import ActivityLog from '../models/ActivityLog';
import mongoose from 'mongoose';

interface LogActivityParams {
  userId: mongoose.Types.ObjectId | string;
  action: string;
  resourceType: string;
  resourceId?: mongoose.Types.ObjectId | string;
  description: string;
  metadata?: any;
  ipAddress?: string;
}

export const logActivity = async (params: LogActivityParams) => {
  try {
    await ActivityLog.create({
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      description: params.description,
      metadata: params.metadata,
      ipAddress: params.ipAddress,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error - logging shouldn't break the main flow
  }
};
