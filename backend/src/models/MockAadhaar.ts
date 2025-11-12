import mongoose, { Document, Schema } from 'mongoose';

export interface IMockAadhaar extends Document {
  aadhaar: string;
  linkedPhone: string;
  name: string;
  createdAt: Date;
}

const mockAadhaarSchema = new Schema<IMockAadhaar>(
  {
    aadhaar: {
      type: String,
      required: true,
      unique: true,
      length: 12,
    },
    linkedPhone: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MockAadhaar = mongoose.model<IMockAadhaar>('MockAadhaar', mockAadhaarSchema);

export default MockAadhaar;
