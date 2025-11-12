import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'surplus_claimed' | 'request_received' | 'delivery_update' | 'task_assigned' | 'volunteer_pickup' | 'general';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'surplus_claimed',
        'request_received',
        'delivery_update',
        'task_assigned',
        'volunteer_pickup',
        'general'
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: Schema.Types.Mixed,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
