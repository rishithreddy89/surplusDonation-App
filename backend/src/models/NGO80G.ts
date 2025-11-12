import mongoose, { Schema, Document } from 'mongoose';

export interface INGO80G extends Document {
  ngoId: mongoose.Types.ObjectId;
  name: string;
  pan: string;
  has80G: boolean;
  registrationNo: string;
  certificateValidUntil: Date;
  contactEmail: string;
  address: string;
  verifiedAt: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  // Payment Details
  upiId?: string;
  accountNo?: string;
  ifscCode?: string;
  bankName?: string;
  acceptsMonetaryDonations: boolean;
}

const NGO80GSchema = new Schema({
  ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  pan: { type: String, required: true, uppercase: true },
  has80G: { type: Boolean, default: false },
  registrationNo: { type: String, required: true },
  certificateValidUntil: { type: Date, required: true },
  contactEmail: { type: String, required: true },
  address: { type: String, required: true },
  verifiedAt: { type: Date, default: Date.now },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  // Payment Details
  upiId: String,
  accountNo: String,
  ifscCode: String,
  bankName: String,
  acceptsMonetaryDonations: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<INGO80G>('NGO80G', NGO80GSchema);
