import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  surplusId: mongoose.Types.ObjectId;
  donorId: mongoose.Types.ObjectId;
  ngoId: mongoose.Types.ObjectId;
  logisticsPartnerId?: mongoose.Types.ObjectId;
  status: 'pending' | 'assigned' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  pickupLocation: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  deliveryLocation: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  scheduledPickup?: Date;
  actualPickup?: Date;
  scheduledDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isVolunteerPickup?: boolean;
}

const taskSchema = new Schema<ITask>(
  {
    surplusId: {
      type: Schema.Types.ObjectId,
      ref: 'Surplus',
      required: true,
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ngoId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logisticsPartnerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    pickupLocation: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    deliveryLocation: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    scheduledPickup: Date,
    actualPickup: Date,
    scheduledDelivery: Date,
    actualDelivery: Date,
    notes: String,
    isVolunteerPickup: { 
      type: Boolean, 
      default: false 
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task;
