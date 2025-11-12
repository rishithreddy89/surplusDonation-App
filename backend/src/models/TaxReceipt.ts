import mongoose, { Schema, Document } from 'mongoose';

export interface ITaxReceipt extends Document {
  donorId: mongoose.Types.ObjectId;
  ngoId: mongoose.Types.ObjectId;
  surplusId: mongoose.Types.ObjectId;
  donorName: string;
  donorPAN: string;
  donorEmail: string;
  donorAddress?: string;
  ngoName: string;
  ngo80GRegNo: string;
  donationDescription: string;
  donationValue: number;
  receiptNumber: string;
  issueDate: Date;
  financialYear: string;
  pdfUrl?: string;
}

const TaxReceiptSchema = new Schema({
  donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  surplusId: { type: Schema.Types.ObjectId, ref: 'Surplus', required: true },
  donorName: { type: String, required: true },
  donorPAN: { type: String, required: true, uppercase: true },
  donorEmail: { type: String, required: true },
  donorAddress: String,
  ngoName: { type: String, required: true },
  ngo80GRegNo: { type: String, required: true },
  donationDescription: { type: String, required: true },
  donationValue: { type: Number, required: true },
  receiptNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, default: Date.now },
  financialYear: { type: String, required: true },
  pdfUrl: String,
}, { timestamps: true });

export default mongoose.model<ITaxReceipt>('TaxReceipt', TaxReceiptSchema);
