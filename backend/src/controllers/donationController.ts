import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MonetaryDonation from '../models/MonetaryDonation';
import NGO80G from '../models/NGO80G';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import { generateDonationReceipt, getFinancialYear } from '../utils/pdfGenerator';

export const getEligibleNGOs = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 Fetching eligible NGOs...');
    
    const ngos = await NGO80G.find({
      has80G: true,
      acceptsMonetaryDonations: true,
      certificateValidUntil: { $gte: new Date() }
    }).populate('ngoId', 'name email location').select('-accountNo');

    console.log(`✅ Found ${ngos.length} eligible NGOs`);
    
    res.json({ success: true, data: ngos });
  } catch (error: any) {
    console.error('❌ Error fetching NGOs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDonation = async (req: AuthRequest, res: Response) => {
  try {
    const { ngoId, amount, donorPAN, paymentMethod, hasTaxBenefit } = req.body;

    console.log('📥 Received donation request:', { ngoId, amount, paymentMethod, hasTaxBenefit, donorPAN: donorPAN ? 'PROVIDED' : 'NOT PROVIDED' });

    // Validate amount
    if (amount < 10 || amount > 100000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be between ₹10 and ₹1,00,000' 
      });
    }

    // Validate PAN if tax benefit requested
    if (hasTaxBenefit) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!donorPAN || !panRegex.test(donorPAN)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid PAN required for tax benefits' 
        });
      }
    }

    console.log('🔍 Looking for NGO with ngoId:', ngoId);

    // Verify NGO
    const ngo = await NGO80G.findOne({
      ngoId: ngoId,
      has80G: true,
      acceptsMonetaryDonations: true,
      certificateValidUntil: { $gte: new Date() }
    });

    console.log('📊 NGO found:', ngo ? ngo.name : 'NOT FOUND');

    if (!ngo) {
      console.log('❌ NGO not found with ngoId:', ngoId);
      console.log('💡 Available 80G NGOs:', await NGO80G.find({}).select('ngoId name'));
      return res.status(404).json({ 
        success: false, 
        message: 'NGO not found or not eligible for donations' 
      });
    }

    const donor = await User.findById(req.user?.userId);
    const donationId = `DNT-${uuidv4().substring(0, 8).toUpperCase()}`;
    const financialYear = getFinancialYear();

    // Create donation record
    const donation = new MonetaryDonation({
      donationId,
      donorId: req.user?.userId,
      donorName: donor?.name || 'Anonymous',
      donorEmail: donor?.email || '',
      donorPAN: hasTaxBenefit ? donorPAN : '', // Only save PAN if tax benefit is requested
      ngoId: ngo.ngoId,
      amount,
      paymentMethod,
      hasTaxBenefit,
      financialYear,
      paymentStatus: 'pending',
    });

    await donation.save();

    // Simulate payment (in real app, integrate Razorpay/UPI)
    const paymentLink = generateMockPaymentLink(donation, ngo);

    res.json({
      success: true,
      message: 'Donation initiated successfully',
      data: {
        donationId: donation.donationId,
        amount: donation.amount,
        ngoName: ngo.name,
        paymentLink,
        status: 'pending'
      }
    });
  } catch (error: any) {
    console.error('❌ Donation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { donationId, transactionId } = req.body;

    const donation = await MonetaryDonation.findOne({ 
      donationId,
      donorId: req.user?.userId 
    });

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.paymentStatus === 'success') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment already confirmed' 
      });
    }

    // Update donation status
    donation.paymentStatus = 'success';
    donation.transactionId = transactionId || `TXN-${Date.now()}`;

    // Generate receipt if tax benefit requested
    if (donation.hasTaxBenefit && donation.donorPAN) {
      const ngo = await NGO80G.findOne({ ngoId: donation.ngoId });
      if (ngo) {
        const receiptNumber = `80G-MON-${Date.now().toString(36).toUpperCase()}`;
        
        const pdfPath = await generateDonationReceipt({
          receiptNumber,
          donorName: donation.donorName,
          donorPAN: donation.donorPAN, // Now TypeScript knows it's not undefined because of the check above
          ngoName: ngo.name,
          ngo80GRegNo: ngo.registrationNo,
          amount: donation.amount,
          transactionId: donation.transactionId!,
          donationDate: new Date(),
          financialYear: donation.financialYear,
        });

        donation.receiptNumber = receiptNumber;
        donation.receiptUrl = `receipts/monetary/receipt-${receiptNumber}.pdf`;
      }
    }

    await donation.save();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        donationId: donation.donationId,
        transactionId: donation.transactionId,
        receiptUrl: donation.receiptUrl,
        hasTaxBenefit: donation.hasTaxBenefit
      }
    });
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDonationHistory = async (req: AuthRequest, res: Response) => {
  try {
    const donations = await MonetaryDonation.find({ donorId: req.user?.userId })
      .populate('ngoId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: donations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadDonationReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const { donationId } = req.params;

    const donation = await MonetaryDonation.findOne({
      donationId,
      donorId: req.user?.userId,
      paymentStatus: 'success',
      hasTaxBenefit: true
    });

    if (!donation || !donation.receiptUrl) {
      return res.status(404).json({ 
        success: false, 
        message: 'Receipt not found' 
      });
    }

    const path = require('path');
    const fs = require('fs');
    const filePath = path.resolve(__dirname, '../../uploads', donation.receiptUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Receipt file not found' 
      });
    }

    res.sendFile(filePath);
  } catch (error: any) {
    console.error('Download receipt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to generate mock payment link
function generateMockPaymentLink(donation: any, ngo: any): string {
  if (ngo.upiId) {
    return `upi://pay?pa=${ngo.upiId}&pn=${encodeURIComponent(ngo.name)}&am=${donation.amount}&cu=INR&tn=Donation`;
  }
  return `https://mock-payment-gateway.com/pay?id=${donation.donationId}&amount=${donation.amount}`;
}
