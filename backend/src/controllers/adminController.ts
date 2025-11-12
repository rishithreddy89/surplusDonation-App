import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Surplus from '../models/Surplus';
import Request from '../models/Request';
import Task from '../models/Task';
import ActivityLog from '../models/ActivityLog';

export const getOverview = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNGOs = await User.countDocuments({ role: 'ngo' });
    const totalLogistics = await User.countDocuments({ role: 'logistics' });

    const totalSurplus = await Surplus.countDocuments();
    const availableSurplus = await Surplus.countDocuments({ status: 'available' });
    const deliveredSurplus = await Surplus.countDocuments({ status: 'delivered' });

    const totalRequests = await Request.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'delivered' });

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, donors: totalDonors, ngos: totalNGOs, logistics: totalLogistics },
        surplus: { total: totalSurplus, available: availableSurplus, delivered: deliveredSurplus },
        requests: { total: totalRequests },
        tasks: { total: totalTasks, completed: completedTasks },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, isVerified, search } = req.query;
    const query: any = {};

    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: isVerified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: user 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Surplus by category
    const surplusByCategory = await Surplus.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
    ]);

    // Requests by urgency
    const requestsByUrgency = await Request.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } },
    ]);

    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Monthly trends
    const monthlyTrends = await Surplus.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        surplusByCategory,
        requestsByUrgency,
        tasksByStatus,
        monthlyTrends,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActivityLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50, resourceType } = req.query;
    const query: any = {};

    if (resourceType && resourceType !== 'all') {
      query.resourceType = resourceType;
    }

    const logs = await ActivityLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDemandForecast = async (req: AuthRequest, res: Response) => {
  try {
    // Mock AI forecast - in production, integrate with ML model
    const categories = ['food', 'clothing', 'medical', 'educational'];
    const forecast = categories.map(category => ({
      category,
      predictedDemand: Math.floor(Math.random() * 100) + 50,
      confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
      trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)],
    }));

    res.json({
      success: true,
      data: {
        forecast,
        generatedAt: new Date(),
        model: 'demand-prediction-v1',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSurplus = async (req: AuthRequest, res: Response) => {
  try {
    const surplus = await Surplus.find()
      .populate('donorId', 'name email location')
      .populate('claimedBy', 'name email')
      .populate('logisticsPartnerId', 'name email vehicleType')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: surplus });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find()
      .populate('surplusId', 'title quantity unit category')
      .populate('donorId', 'name email location')
      .populate('ngoId', 'name email location')
      .populate('logisticsPartnerId', 'name email vehicleType')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await Request.find()
      .populate('ngoId', 'name email location')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlatformStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNGOs = await User.countDocuments({ role: 'ngo' });
    const totalLogistics = await User.countDocuments({ role: 'logistics' });
    
    const totalSurplus = await Surplus.countDocuments();
    const availableSurplus = await Surplus.countDocuments({ status: 'available' });
    const deliveredSurplus = await Surplus.countDocuments({ status: 'delivered' });
    
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'delivered' });
    const activeTasks = await Task.countDocuments({ 
      status: { $in: ['assigned', 'picked-up', 'in-transit'] } 
    });

    const totalRequests = await Request.countDocuments();
    const pendingVerifications = await User.countDocuments({ isVerified: false });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          donors: totalDonors,
          ngos: totalNGOs,
          logistics: totalLogistics,
          pendingVerifications
        },
        surplus: {
          total: totalSurplus,
          available: availableSurplus,
          delivered: deliveredSurplus
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          active: activeTasks
        },
        requests: {
          total: totalRequests
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
