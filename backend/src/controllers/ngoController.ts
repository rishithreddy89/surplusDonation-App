import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Surplus from '../models/Surplus';
import Request from '../models/Request';
import Task from '../models/Task';
import Notification from '../models/Notification';
import User from '../models/User';
import { validationResult } from 'express-validator';

export const getAvailableSurplus = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search } = req.query;
    const query: any = { status: 'available' };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const surplus = await Surplus.find(query)
      .populate('donorId', 'name location donorType')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: surplus });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const request = new Request({
      ...req.body,
      ngoId: req.user?.userId,
    });

    await request.save();

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: request,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNGORequests = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = { ngoId: req.user?.userId };

    if (status) query.status = status;

    const requests = await Request.find(query).sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRequest = async (req: AuthRequest, res: Response) => {
  try {
    const request = await Request.findOneAndUpdate(
      { _id: req.params.id, ngoId: req.user?.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, message: 'Request updated', data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const claimSurplus = async (req: AuthRequest, res: Response) => {
  try {
    const surplus = await Surplus.findById(req.params.id).populate('donorId', 'name');

    if (!surplus) {
      return res.status(404).json({ success: false, message: 'Surplus not found' });
    }

    if (surplus.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Surplus already claimed' });
    }

    const ngo = await User.findById(req.user?.userId);

    surplus.status = 'claimed';
    surplus.claimedBy = req.user?.userId as any;
    await surplus.save();

    // Create delivery task
    const task = new Task({
      surplusId: surplus._id,
      donorId: surplus.donorId,
      ngoId: req.user?.userId,
      pickupLocation: surplus.location,
      deliveryLocation: req.body.deliveryLocation,
      status: 'pending',
    });
    await task.save();

    // Create notification for donor
    await new Notification({
      userId: surplus.donorId,
      type: 'surplus_claimed',
      title: 'Surplus Item Claimed',
      message: `${ngo?.name || 'An NGO'} has requested your surplus item: ${surplus.title}`,
      data: {
        surplusId: surplus._id,
        ngoId: req.user?.userId,
        ngoName: ngo?.name,
        taskId: task._id,
      },
    }).save();

    res.json({
      success: true,
      message: 'Surplus claimed successfully. Donor has been notified.',
      data: { surplus, task },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClaimedSurplus = async (req: AuthRequest, res: Response) => {
  try {
    // Get all surplus items claimed by this NGO
    const claimedSurplus = await Surplus.find({
      claimedBy: req.user?.userId,
    })
      .populate('donorId', 'name location')
      .populate('logisticsPartnerId', 'name vehicleType')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: claimedSurplus });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmSurplusReceived = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const surplus = await Surplus.findOne({
      _id: id,
      claimedBy: req.user?.userId,
    });

    if (!surplus) {
      return res.status(404).json({ 
        success: false, 
        message: 'Surplus not found or not claimed by you' 
      });
    }

    // Check if item is in-transit or already delivered
    if (surplus.status !== 'in-transit' && surplus.status !== 'delivered') {
      return res.status(400).json({ 
        success: false, 
        message: 'Item must be in-transit or delivered to confirm receipt' 
      });
    }

    // Update status to delivered if it's in-transit
    if (surplus.status === 'in-transit') {
      surplus.status = 'delivered';
      await surplus.save();

      // Update associated task
      await Task.findOneAndUpdate(
        { surplusId: surplus._id },
        { status: 'delivered', actualDelivery: new Date() }
      );
    }

    // Create notification for donor
    const ngo = await User.findById(req.user?.userId);
    
    await new Notification({
      userId: surplus.donorId,
      type: 'delivery_update',
      title: 'Delivery Confirmed',
      message: `${ngo?.name || 'NGO'} has confirmed receipt of your donation: ${surplus.title}. Thank you for your contribution!`,
      data: {
        surplusId: surplus._id,
        ngoId: req.user?.userId,
      },
    }).save();

    // Also notify logistics partner if assigned
    if (surplus.logisticsPartnerId) {
      await new Notification({
        userId: surplus.logisticsPartnerId,
        type: 'delivery_update',
        title: 'Delivery Confirmed by Recipient',
        message: `${ngo?.name || 'NGO'} has confirmed receipt of ${surplus.title}`,
        data: {
          surplusId: surplus._id,
          ngoId: req.user?.userId,
        },
      }).save();
    }

    res.json({
      success: true,
      message: 'Receipt confirmed successfully',
      data: surplus,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNGOImpact = async (req: AuthRequest, res: Response) => {
  try {
    const totalRequests = await Request.countDocuments({ ngoId: req.user?.userId });
    const fulfilledRequests = await Request.countDocuments({
      ngoId: req.user?.userId,
      status: 'fulfilled',
    });

    const receivedItems = await Surplus.countDocuments({
      claimedBy: req.user?.userId,
      status: 'delivered',
    });

    const totalQuantity = await Surplus.aggregate([
      { $match: { claimedBy: req.user?.userId, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);

    // Get monthly distribution data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Surplus.aggregate([
      {
        $match: {
          claimedBy: req.user?.userId,
          status: 'delivered',
          updatedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Format monthly data into an array for the last 6 months
    const monthlyDistribution = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const monthData = monthlyData.find(
        (d) => d._id.year === year && d._id.month === month
      );
      
      monthlyDistribution.push({
        month: date.toLocaleString('en-US', { month: 'short' }),
        year: year,
        count: monthData?.count || 0,
        quantity: monthData?.totalQuantity || 0,
      });
    }

    res.json({
      success: true,
      data: {
        totalRequests,
        fulfilledRequests,
        receivedItems,
        totalQuantity: totalQuantity[0]?.total || 0,
        estimatedPeopleServed: (totalQuantity[0]?.total || 0) * 3, // Mock calculation
        monthlyDistribution,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUrgentNeeds = async (req: AuthRequest, res: Response) => {
  try {
    // Get requests with high or critical urgency that are still open
    const urgentRequests = await Request.find({
      urgency: { $in: ['high', 'critical'] },
      status: 'open',
    })
      .populate('ngoId', 'name location')
      .sort({ urgency: -1, createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: urgentRequests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markRequestReceived = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const request = await Request.findOne({
      _id: id,
      ngoId: req.user?.userId,
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = 'fulfilled';
    await request.save();

    res.json({
      success: true,
      message: 'Request marked as received',
      data: request,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitDonationFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, title, message, impact } = req.body;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and message are required' 
      });
    }

    // Find the surplus item claimed by this NGO
    const surplus = await Surplus.findOne({
      _id: id,
      claimedBy: req.user?.userId,
    }).populate('donorId', 'name email');

    if (!surplus) {
      return res.status(404).json({ 
        success: false, 
        message: 'Surplus not found or not claimed by you' 
      });
    }

    // Check if item is delivered
    if (surplus.status !== 'delivered') {
      return res.status(400).json({ 
        success: false, 
        message: 'You can only give feedback on delivered donations' 
      });
    }

    // Check if feedback already exists
    if (surplus.ngoFeedback) {
      return res.status(400).json({ 
        success: false, 
        message: 'Feedback already submitted for this donation' 
      });
    }

    // Add feedback to surplus
    surplus.ngoFeedback = {
      rating,
      title,
      message,
      impact,
      submittedAt: new Date(),
    };

    await surplus.save();

    // Create notification for donor
    const ngo = await User.findById(req.user?.userId);
    
    await new Notification({
      userId: surplus.donorId,
      type: 'feedback_received',
      title: '❤️ Feedback on Your Donation',
      message: `${ngo?.name || 'An NGO'} has given ${rating}-star feedback on your donation: ${surplus.title}`,
      data: {
        surplusId: surplus._id,
        ngoId: req.user?.userId,
        rating,
      },
    }).save();

    res.json({
      success: true,
      message: 'Thank you for your feedback! The donor has been notified.',
      data: surplus,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
