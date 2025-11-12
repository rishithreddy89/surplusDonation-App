import mongoose, { Schema, Document } from 'mongoose';

export interface IMonetaryDonation extends Document {
  donationId: string;
  donorId: mongoose.Types.ObjectId;
  donorName: string;
  donorEmail: string;
  donorPAN?: string;
  ngoId: mongoose.Types.ObjectId;
  amount: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentMethod: 'upi' | 'card' | 'netbanking';
  transactionId?: string;
  hasTaxBenefit: boolean;
  receiptUrl?: string;
  receiptNumber?: string;
  financialYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const MonetaryDonationSchema = new Schema({
  donationId: { type: String, required: true, unique: true },
  donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  donorPAN: { type: String, required: false },
  ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 10, max: 100000 },
  paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['upi', 'card', 'netbanking'], required: true },
  transactionId: String,
  hasTaxBenefit: { type: Boolean, default: false },
  receiptUrl: String,
  receiptNumber: String,
  financialYear: { type: String, required: true },
}, { timestamps: true });

// Simple PAN masking for demo purposes
MonetaryDonationSchema.pre('save', function(next) {
  if (this.isModified('donorPAN') && this.donorPAN && this.donorPAN.length === 10) {
    try {
      // Store format: XXXXX1234F (show last 5 chars for demo)
      this.donorPAN = 'XXXXX' + this.donorPAN.slice(-5);
      console.log('✅ PAN masked successfully');
    } catch (error) {
      console.error('❌ PAN masking error:', error);
    }
  }
  next();
});

export default mongoose.model<IMonetaryDonation>('MonetaryDonation', MonetaryDonationSchema);
