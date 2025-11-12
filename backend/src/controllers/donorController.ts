import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Surplus from '../models/Surplus';
import Task from '../models/Task';
import { validationResult } from 'express-validator';
import Notification from '../models/Notification';
import User from '../models/User';
import NGO80G from '../models/NGO80G';
import TaxReceipt from '../models/TaxReceipt';
import { generateTaxReceipt, getFinancialYear, generateReceiptNumber } from '../utils/pdfGenerator';
import path from 'path';
import fs from 'fs';

export const createSurplus = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const surplus = new Surplus({
      ...req.body,
      donorId: req.user?.userId,
    });

    await surplus.save();

    res.status(201).json({
      success: true,
      message: 'Surplus item created successfully',
      data: surplus,
    });
  } catch (error: any) {
    console.error('Create surplus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDonorSurplus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, category } = req.query;
    const query: any = { donorId: req.user?.userId };

    if (status) query.status = status;
    if (category) query.category = category;

    const surplus = await Surplus.find(query)
      .populate('claimedBy', 'name email')
      .populate('logisticsPartnerId', 'name email vehicleType')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: surplus });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSurplusById = async (req: AuthRequest, res: Response) => {
  try {
    const surplus = await Surplus.findOne({
      _id: req.params.id,
      donorId: req.user?.userId,
    })
      .populate('claimedBy', 'name email')
      .populate('logisticsPartnerId', 'name email vehicleType');

    if (!surplus) {
      return res.status(404).json({ success: false, message: 'Surplus not found' });
    }

    res.json({ success: true, data: surplus });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSurplus = async (req: AuthRequest, res: Response) => {
  try {
    const surplus = await Surplus.findOneAndUpdate(
      { _id: req.params.id, donorId: req.user?.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!surplus) {
      return res.status(404).json({ success: false, message: 'Surplus not found' });
    }

    res.json({ success: true, message: 'Surplus updated', data: surplus });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDonorImpact = async (req: AuthRequest, res: Response) => {
  try {
    // Only count donations that have been picked up by logistics (in-transit or delivered)
    const totalDonations = await Surplus.countDocuments({ 
      donorId: req.user?.userId,
      status: { $in: ['in-transit', 'delivered'] } 
    });
    
    const deliveredDonations = await Surplus.countDocuments({
      donorId: req.user?.userId,
      status: 'delivered',
    });

    const totalQuantity = await Surplus.aggregate([
      { 
        $match: { 
          donorId: req.user?.userId, 
          status: { $in: ['in-transit', 'delivered'] } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);

    // Calculate badges based on picked-up donations only
    const badges = [];
    if (totalDonations >= 10) badges.push({ name: 'Bronze Donor', icon: '🥉' });
    if (totalDonations >= 50) badges.push({ name: 'Silver Donor', icon: '🥈' });
    if (totalDonations >= 100) badges.push({ name: 'Gold Donor', icon: '🥇' });

    res.json({
      success: true,
      data: {
        totalDonations, // Only picked-up donations (in-transit + delivered)
        deliveredDonations, // Only delivered donations
        totalQuantity: totalQuantity[0]?.total || 0,
        badges,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackDonation = async (req: AuthRequest, res: Response) => {
  try {
    const surplus = await Surplus.findOne({
      _id: req.params.id,
      donorId: req.user?.userId,
    });

    if (!surplus) {
      return res.status(404).json({ success: false, message: 'Surplus not found' });
    }

    const task = await Task.findOne({ surplusId: surplus._id })
      .populate('logisticsPartnerId', 'name email phone vehicleType')
      .populate('ngoId', 'name email location');

    res.json({
      success: true,
      data: {
        surplus,
        task,
        timeline: {
          created: surplus.createdAt,
          claimed: surplus.status !== 'available' ? surplus.updatedAt : null,
          pickedUp: task?.actualPickup,
          delivered: task?.actualDelivery,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptSurplusRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const surplus = await Surplus.findOne({
      _id: id,
      donorId: req.user?.userId,
      status: 'claimed',
    }).populate('claimedBy', 'name');

    if (!surplus) {
      return res.status(404).json({ success: false, message: 'Surplus request not found' });
    }

    // Change status to 'accepted' - a new intermediate status
    // This prevents the buttons from showing again after reload
    surplus.status = 'accepted' as any; // TypeScript workaround
    await surplus.save();

    // Update task status to 'assigned' (ready for logistics to accept)
    const task = await Task.findOneAndUpdate(
      { surplusId: surplus._id },
      { status: 'assigned' },
      { new: true }
    );

    // Create notification for NGO
    const donor = await User.findById(req.user?.userId);
    await new Notification({
      userId: surplus.claimedBy,
      type: 'request_received',
      title: 'Request Accepted',
      message: `${donor?.name || 'Donor'} has accepted your request for: ${surplus.title}. Waiting for logistics to pick it up.`,
      data: {
        surplusId: surplus._id,
        donorId: req.user?.userId,
        taskId: task?._id,
      },
    }).save();

    res.json({
      success: true,
      message: 'Request accepted. Task is now available for logistics partners to pick up.',
      data: { surplus, task },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectSurplusRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const surplus = await Surplus.findOne({
      _id: id,
      donorId: req.user?.userId,
      status: 'claimed',
    }).populate('claimedBy', 'name');

    if (!surplus) {
      return res.status(404).json({ success: false, message: 'Surplus request not found' });
    }

    const ngoId = surplus.claimedBy;

    // Reset surplus to available
    surplus.status = 'available';
    surplus.claimedBy = undefined;
    await surplus.save();

    // Delete associated task
    await Task.findOneAndDelete({ surplusId: surplus._id });

    // Create notification for NGO
    const donor = await User.findById(req.user?.userId);
    await new Notification({
      userId: ngoId,
      type: 'request_received',
      title: 'Request Declined',
      message: `${donor?.name || 'Donor'} has declined your request for: ${surplus.title}`,
      data: {
        surplusId: surplus._id,
        donorId: req.user?.userId,
      },
    }).save();

    res.json({
      success: true,
      message: 'Request rejected. Item is now available for other NGOs.',
      data: surplus,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateImpactCard = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const surplus = await Surplus.findOne({
      _id: id,
      donorId: req.user?.userId,
      status: 'delivered',
    }).populate('claimedBy', 'name');

    if (!surplus) {
      return res.status(404).json({ success: false, message: 'Delivered donation not found' });
    }

    const donor = await User.findById(req.user?.userId);
    const totalDonations = await Surplus.countDocuments({
      donorId: req.user?.userId,
      status: 'delivered',
    });

    const totalImpact = await Surplus.aggregate([
      { $match: { donorId: req.user?.userId, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);

    // Calculate estimated people helped based on category
    let peopleHelped = 0;
    if (surplus.category === 'food') {
      peopleHelped = Math.floor(surplus.quantity / 3);
    } else if (surplus.category === 'clothing') {
      peopleHelped = surplus.quantity;
    } else {
      peopleHelped = Math.floor(surplus.quantity / 2);
    }

    const impactCard = {
      donorName: donor?.name || 'Anonymous Donor',
      donationTitle: surplus.title,
      quantity: surplus.quantity,
      unit: surplus.unit,
      peopleHelped,
      ngoName: (surplus.claimedBy as any)?.name || 'NGO',
      date: surplus.updatedAt,
      totalDonations,
      totalImpact: totalImpact[0]?.total || 0,
      shareUrl: `${process.env.FRONTEND_URL}/donor/${req.user?.userId}`,
    };

    res.json({ success: true, data: impactCard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicDonorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { donorId } = req.params;

    const donor = await User.findById(donorId).select('name createdAt');
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const totalDonations = await Surplus.countDocuments({
      donorId,
      status: 'delivered',
    });

    const categoryBreakdown = await Surplus.aggregate([
      { $match: { donorId, status: 'delivered' } },
      { $group: { _id: '$category', count: { $sum: 1 }, quantity: { $sum: '$quantity' } } },
    ]);

    const totalImpact = await Surplus.aggregate([
      { $match: { donorId, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);

    // Calculate badges
    const badges = [];
    if (totalDonations >= 1) badges.push({ name: 'First Donation', icon: '🎉', description: 'Made your first donation' });
    if (totalDonations >= 5) badges.push({ name: 'Consistent Contributor', icon: '⭐', description: '5+ donations completed' });
    if (totalDonations >= 10) badges.push({ name: 'Bronze Donor', icon: '🥉', description: '10+ donations completed' });
    if (totalDonations >= 25) badges.push({ name: 'Silver Donor', icon: '🥈', description: '25+ donations completed' });
    if (totalDonations >= 50) badges.push({ name: 'Gold Donor', icon: '🥇', description: '50+ donations completed' });
    if (totalDonations >= 100) badges.push({ name: 'Impact Hero', icon: '🏆', description: '100+ donations completed' });

    // Estimate people helped
    let totalPeopleHelped = 0;
    categoryBreakdown.forEach((cat: any) => {
      if (cat._id === 'food') {
        totalPeopleHelped += Math.floor(cat.quantity / 3);
      } else if (cat._id === 'clothing') {
        totalPeopleHelped += cat.quantity;
      } else {
        totalPeopleHelped += Math.floor(cat.quantity / 2);
      }
    });

    res.json({
      success: true,
      data: {
        donorName: donor.name,
        memberSince: donor.createdAt,
        totalDonations,
        totalImpact: totalImpact[0]?.total || 0,
        totalPeopleHelped,
        categoryBreakdown,
        badges,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestTaxReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const { surplusId } = req.params;
    const { donorPAN, donorAddress } = req.body;

    // Validate PAN format (basic)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(donorPAN)) {
      return res.status(400).json({ success: false, message: 'Invalid PAN format' });
    }

    const surplus = await Surplus.findOne({
      _id: surplusId,
      donorId: req.user?.userId,
      status: 'delivered',
    }).populate('claimedBy');

    if (!surplus) {
      return res.status(404).json({ success: false, message: 'Delivered donation not found' });
    }

    // Check if NGO is 80G verified
    let ngo80G = await NGO80G.findOne({ 
      ngoId: surplus.claimedBy,
      has80G: true,
      certificateValidUntil: { $gte: new Date() }
    });

    // Auto-create 80G record for testing if in development mode
    if (!ngo80G && process.env.NODE_ENV === 'development') {
      const ngoUser = await User.findById(surplus.claimedBy);
      if (ngoUser) {
        ngo80G = new NGO80G({
          ngoId: surplus.claimedBy,
          name: ngoUser.name,
          pan: `${ngoUser.name.substring(0, 5).toUpperCase().replace(/[^A-Z]/g, 'A')}${Math.floor(1000 + Math.random() * 9000)}F`,
          has80G: true,
          registrationNo: `80G-DEV-${Date.now()}`,
          certificateValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3),
          contactEmail: ngoUser.email,
          address: ngoUser.location || 'India',
          verifiedAt: new Date(),
        });
        await ngo80G.save();
        console.log(`✅ Auto-created 80G record for ${ngoUser.name} (Development mode)`);
      }
    }

    if (!ngo80G) {
      return res.status(400).json({ 
        success: false, 
        message: 'This NGO is not eligible for 80G tax benefits. Please contact support to verify the NGO.' 
      });
    }

    // Check if receipt already exists
    const existingReceipt = await TaxReceipt.findOne({ surplusId });
    if (existingReceipt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tax receipt already generated for this donation',
        data: existingReceipt
      });
    }

    const donor = await User.findById(req.user?.userId);
    const receiptNumber = generateReceiptNumber();
    const financialYear = getFinancialYear();

    // Estimate donation value (simple calculation)
    let estimatedValue = surplus.quantity * 100; // ₹100 per unit as base
    if (surplus.category === 'food') estimatedValue = surplus.quantity * 50;
    if (surplus.category === 'medical') estimatedValue = surplus.quantity * 200;

    // Generate PDF
    const pdfPath = await generateTaxReceipt({
      receiptNumber,
      donorName: donor?.name || 'Anonymous',
      donorPAN,
      donorAddress,
      ngoName: ngo80G.name,
      ngo80GRegNo: ngo80G.registrationNo,
      donationDescription: `${surplus.quantity} ${surplus.unit} of ${surplus.title}`,
      donationValue: estimatedValue,
      issueDate: new Date(),
      financialYear,
    });

    // Save receipt record with correct URL path
    const receipt = new TaxReceipt({
      donorId: req.user?.userId,
      ngoId: surplus.claimedBy,
      surplusId,
      donorName: donor?.name,
      donorPAN,
      donorEmail: donor?.email,
      donorAddress,
      ngoName: ngo80G.name,
      ngo80GRegNo: ngo80G.registrationNo,
      donationDescription: `${surplus.quantity} ${surplus.unit} of ${surplus.title}`,
      donationValue: estimatedValue,
      receiptNumber,
      financialYear,
      pdfUrl: `receipts/receipt-${receiptNumber}.pdf`, // Fixed: removed /uploads prefix
    });

    await receipt.save();

    res.json({
      success: true,
      message: 'Tax receipt generated successfully',
      data: receipt,
    });
  } catch (error: any) {
    console.error('Tax receipt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTaxReceipts = async (req: AuthRequest, res: Response) => {
  try {
    const receipts = await TaxReceipt.find({ donorId: req.user?.userId })
      .populate('ngoId', 'name')
      .populate('surplusId', 'title category')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: receipts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const get80GEligibleNGOs = async (req: AuthRequest, res: Response) => {
  try {
    const eligibleNGOs = await NGO80G.find({
      has80G: true,
      certificateValidUntil: { $gte: new Date() }
    }).populate('ngoId', 'name email location');

    res.json({ success: true, data: eligibleNGOs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPAN = async (req: AuthRequest, res: Response) => {
  try {
    const { pan } = req.body;

    // Basic PAN validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      return res.json({ success: false, valid: false, message: 'Invalid PAN format' });
    }

    // Fetch user details
    const user = await User.findById(req.user?.userId);
    
    // Mock verification (in production, integrate with Income Tax API)
    const isValid = true; // Simulate API call
    const holderName = user?.name || 'Verified User';

    res.json({
      success: true,
      valid: isValid,
      holderName,
      message: 'PAN verified successfully (Demo)',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadTaxReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const { receiptId } = req.params;

    console.log(`📥 Download request for receipt: ${receiptId} by user: ${req.user?.userId}`);

    const receipt = await TaxReceipt.findOne({
      _id: receiptId,
      donorId: req.user?.userId,
    });

    if (!receipt) {
      console.log(`❌ Receipt not found: ${receiptId}`);
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    if (!receipt.pdfUrl) {
      console.log(`❌ PDF URL not found for receipt: ${receiptId}`);
      return res.status(404).json({ success: false, message: 'PDF URL not found' });
    }

    const filePath = path.resolve(__dirname, '../../uploads', receipt.pdfUrl);
    console.log(`📂 Looking for PDF at: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ PDF file not found at: ${filePath}`);
      return res.status(404).json({ success: false, message: 'PDF file not found on server' });
    }

    console.log(`✅ Sending PDF file: ${filePath}`);
    
    // Use res.sendFile with absolute path
    res.sendFile(filePath, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="80G-Receipt-${receipt.receiptNumber}.pdf"`,
      }
    }, (err) => {
      if (err) {
        console.error('❌ Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Error downloading file' });
        }
      } else {
        console.log(`✅ File sent successfully: ${receipt.receiptNumber}`);
      }
    });
  } catch (error: any) {
    console.error('❌ Download receipt error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const getPublicNGORequests = async (req: AuthRequest, res: Response) => {
  try {
    // Import Request model at the top if not already imported
    const Request = require('../models/Request').default;
    
    // Get all open NGO requests that donors can see
    const requests = await Request.find({
      status: 'open',
    })
      .populate('ngoId', 'name email location')
      .sort({ urgency: -1, createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('Error fetching public NGO requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const directDonateToNGO = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const surplus = await Surplus.findOne({
      _id: id,
      donorId: req.user?.userId,
      status: 'accepted', // Only accepted items can be directly donated
    }).populate('claimedBy', 'name email');

    if (!surplus) {
      return res.status(404).json({ 
        success: false, 
        message: 'Surplus not found or not in accepted status' 
      });
    }

    // Update status directly to in-transit (donor is delivering themselves)
    surplus.status = 'in-transit';
    await surplus.save();

    // Update task to show donor is handling delivery
    const task = await Task.findOneAndUpdate(
      { surplusId: surplus._id },
      { 
        status: 'picked-up',
        actualPickup: new Date(),
        notes: 'Donor delivering directly (self-delivery)'
      },
      { new: true }
    );

    // Notify NGO
    const donor = await User.findById(req.user?.userId);
    await new Notification({
      userId: surplus.claimedBy,
      type: 'delivery_update',
      title: 'Donor Direct Delivery',
      message: `${donor?.name || 'Donor'} is delivering ${surplus.title} directly to you. Please expect delivery soon.`,
      data: {
        surplusId: surplus._id,
        donorId: req.user?.userId,
        taskId: task?._id,
      },
    }).save();

    res.json({
      success: true,
      message: 'Direct delivery initiated. Please deliver the item to the NGO.',
      data: { surplus, task },
    });
  } catch (error: any) {
    console.error('❌ Direct donate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};