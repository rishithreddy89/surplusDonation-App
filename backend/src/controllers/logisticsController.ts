import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import Surplus from '../models/Surplus';
import Notification from '../models/Notification';
import User from '../models/User';

export const getAvailableTasks = async (req: AuthRequest, res: Response) => {
  try {
    // Show tasks that are 'pending' OR 'assigned' (donor accepted, ready for pickup)
    const tasks = await Task.find({ 
      status: { $in: ['pending', 'assigned'] },
      logisticsPartnerId: { $exists: false } // Not yet claimed by any logistics partner
    })
      .populate('surplusId', 'title description quantity unit')
      .populate('donorId', 'name location phone')
      .populate('ngoId', 'name location phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = { logisticsPartnerId: req.user?.userId };

    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('surplusId', 'title description quantity unit')
      .populate('donorId', 'name location phone')
      .populate('ngoId', 'name location phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('surplusId', 'title donorId')
      .populate('ngoId', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.logisticsPartnerId) {
      return res.status(400).json({ success: false, message: 'Task already claimed by another partner' });
    }

    if (task.status !== 'pending' && task.status !== 'assigned') {
      return res.status(400).json({ success: false, message: 'Task is not available' });
    }

    // Assign logistics partner to task
    task.logisticsPartnerId = req.user?.userId as any;
    task.status = 'assigned';
    await task.save();

    // Update surplus to show it has a logistics partner assigned
    await Surplus.findByIdAndUpdate(task.surplusId, {
      logisticsPartnerId: req.user?.userId,
    });

    // Get logistics partner and donor info
    const logisticsPartner = await User.findById(req.user?.userId);
    const surplus = task.surplusId as any;
    const ngo = task.ngoId as any;

    // Create notification for donor
    await new Notification({
      userId: surplus.donorId,
      type: 'task_assigned',
      title: 'Logistics Partner Assigned',
      message: `${logisticsPartner?.name || 'A logistics partner'} has accepted the delivery task for your donation: ${surplus.title}. Pickup will be arranged soon.`,
      data: {
        taskId: task._id,
        surplusId: task.surplusId,
        logisticsPartnerId: req.user?.userId,
        logisticsPartnerName: logisticsPartner?.name,
      },
    }).save();

    // Create notification for NGO
    await new Notification({
      userId: task.ngoId,
      type: 'task_assigned',
      title: 'Logistics Partner Assigned',
      message: `${logisticsPartner?.name || 'A logistics partner'} will deliver ${surplus.title} to your location soon.`,
      data: {
        taskId: task._id,
        surplusId: task.surplusId,
        logisticsPartnerId: req.user?.userId,
        logisticsPartnerName: logisticsPartner?.name,
      },
    }).save();

    res.json({ 
      success: true, 
      message: 'Task accepted. Donor and NGO have been notified. Please proceed to pickup location.', 
      data: task 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const task = await Task.findOne({
      _id: req.params.id,
      logisticsPartnerId: req.user?.userId,
    })
      .populate('surplusId', 'title donorId')
      .populate('donorId', 'name')
      .populate('ngoId', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const surplus = task.surplusId as any;
    const donor = task.donorId as any;
    const ngo = task.ngoId as any;
    const logisticsPartner = await User.findById(req.user?.userId);

    task.status = status;

    if (status === 'picked-up') {
      task.actualPickup = new Date();
      // ONLY NOW change surplus status to in-transit (donation is actually picked up)
      await Surplus.findByIdAndUpdate(task.surplusId, { status: 'in-transit' });

      // Notify donor that item was picked up
      await new Notification({
        userId: surplus.donorId,
        type: 'delivery_update',
        title: 'Item Picked Up',
        message: `${logisticsPartner?.name || 'Logistics partner'} has picked up your donation: ${surplus.title}. It's now on the way to ${ngo?.name || 'the NGO'}.`,
        data: {
          taskId: task._id,
          surplusId: task.surplusId,
          status: 'picked-up',
        },
      }).save();

      // Notify NGO that item is on the way
      await new Notification({
        userId: task.ngoId,
        type: 'delivery_update',
        title: 'Item On The Way',
        message: `${surplus.title} has been picked up and is on the way to your location.`,
        data: {
          taskId: task._id,
          surplusId: task.surplusId,
          status: 'picked-up',
        },
      }).save();
    } else if (status === 'delivered') {
      task.actualDelivery = new Date();
      task.status = 'delivered';
      // Change surplus status to delivered
      await Surplus.findByIdAndUpdate(task.surplusId, { status: 'delivered' });

      // Notify donor that delivery is complete
      await new Notification({
        userId: surplus.donorId,
        type: 'delivery_update',
        title: 'Delivery Completed',
        message: `Your donation "${surplus.title}" has been successfully delivered to ${ngo?.name || 'the NGO'}. Thank you for your contribution!`,
        data: {
          taskId: task._id,
          surplusId: task.surplusId,
          status: 'delivered',
        },
      }).save();

      // Notify NGO that item was delivered
      await new Notification({
        userId: task.ngoId,
        type: 'delivery_update',
        title: 'Delivery Received',
        message: `${surplus.title} has been delivered to your location. Please confirm receipt.`,
        data: {
          taskId: task._id,
          surplusId: task.surplusId,
          status: 'delivered',
        },
      }).save();
    }

    await task.save();

    res.json({ success: true, message: 'Status updated', data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPerformance = async (req: AuthRequest, res: Response) => {
  try {
    const totalTasks = await Task.countDocuments({ logisticsPartnerId: req.user?.userId });
    const completedTasks = await Task.countDocuments({
      logisticsPartnerId: req.user?.userId,
      status: 'delivered',
    });

    const onTimeTasks = await Task.countDocuments({
      logisticsPartnerId: req.user?.userId,
      status: 'delivered',
      $expr: { $lte: ['$actualDelivery', '$scheduledDelivery'] },
    });

    const rating = totalTasks > 0 ? ((completedTasks / totalTasks) * 5).toFixed(1) : '0.0';

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        onTimeTasks,
        rating,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const volunteerPickupTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('surplusId', 'title donorId')
      .populate('ngoId', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.logisticsPartnerId) {
      return res.status(400).json({ success: false, message: 'Task already claimed' });
    }

    // Assign as volunteer pickup
    task.logisticsPartnerId = req.user?.userId as any;
    task.status = 'assigned';
    task.isVolunteerPickup = true;
    await task.save();

    // Update user volunteer stats
    await User.findByIdAndUpdate(req.user?.userId, {
      $inc: { 
        'volunteerStats.totalDeliveries': 0, // Will increment on completion
        'volunteerStats.activeDeliveries': 1 
      }
    });

    await Surplus.findByIdAndUpdate(task.surplusId, {
      logisticsPartnerId: req.user?.userId,
    });

    const logisticsPartner = await User.findById(req.user?.userId);
    const surplus = task.surplusId as any;
    const ngo = task.ngoId as any;

    // Notify donor
    await new Notification({
      userId: surplus.donorId,
      type: 'volunteer_pickup',
      title: 'Volunteer Pickup Accepted',
      message: `${logisticsPartner?.name || 'A volunteer'} has accepted to deliver your donation: ${surplus.title} for free!`,
      data: {
        taskId: task._id,
        surplusId: task.surplusId,
        isVolunteer: true,
      },
    }).save();

    // Notify NGO
    await new Notification({
      userId: task.ngoId,
      type: 'volunteer_pickup',
      title: 'Volunteer Delivery',
      message: `Volunteer ${logisticsPartner?.name || 'driver'} will deliver ${surplus.title} to your location.`,
      data: {
        taskId: task._id,
        surplusId: task.surplusId,
        isVolunteer: true,
      },
    }).save();

    res.json({ 
      success: true, 
      message: 'Volunteer pickup accepted! Thank you for your service.', 
      data: task 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeVolunteerDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      logisticsPartnerId: req.user?.userId,
      isVolunteerPickup: true,
    })
      .populate('surplusId', 'title donorId quantity')
      .populate('ngoId', 'name beneficiaries');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Volunteer task not found' });
    }

    task.status = 'delivered';
    task.actualDelivery = new Date();
    await task.save();

    await Surplus.findByIdAndUpdate(task.surplusId, { status: 'delivered' });

    const surplus = task.surplusId as any;
    const ngo = task.ngoId as any;
    const peopleHelped = ngo.beneficiaries || surplus.quantity || 10;
    const pointsEarned = Math.floor(peopleHelped * 1.5);

    // Update volunteer stats and points
    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      {
        $inc: {
          'volunteerStats.totalDeliveries': 1,
          'volunteerStats.activeDeliveries': -1,
          'volunteerStats.peopleHelped': peopleHelped,
          'volunteerStats.points': pointsEarned,
          'volunteerStats.currentStreak': 1,
        },
        $set: {
          'volunteerStats.lastDeliveryDate': new Date(),
        },
      },
      { new: true }
    );

    // Check for badge achievements
    const badges = [];
    const stats = user?.volunteerStats;
    if (stats?.totalDeliveries === 1) badges.push('first_delivery');
    if (stats?.totalDeliveries === 10) badges.push('champion');
    if (stats?.totalDeliveries === 50) badges.push('hero');
    if (stats?.currentStreak && stats.currentStreak >= 7) badges.push('weekly_warrior');

    if (badges.length > 0) {
      await User.findByIdAndUpdate(req.user?.userId, {
        $addToSet: { 'volunteerStats.badges': { $each: badges } },
      });
    }

    // Notifications
    await new Notification({
      userId: surplus.donorId,
      type: 'delivery_update',
      title: 'Volunteer Delivery Completed',
      message: `Your donation "${surplus.title}" was successfully delivered by our volunteer. Thank you!`,
      data: { taskId: task._id, surplusId: task.surplusId, status: 'delivered' },
    }).save();

    await new Notification({
      userId: task.ngoId,
      type: 'delivery_update',
      title: 'Volunteer Delivery Received',
      message: `${surplus.title} has been delivered by a volunteer. Please confirm receipt.`,
      data: { taskId: task._id, surplusId: task.surplusId, status: 'delivered' },
    }).save();

    res.json({
      success: true,
      message: `Delivery completed! You earned ${pointsEarned} points and helped ${peopleHelped} people!`,
      data: {
        task,
        impact: {
          pointsEarned,
          peopleHelped,
          newBadges: badges,
          totalDeliveries: stats?.totalDeliveries || 1,
          totalPoints: stats?.points || pointsEarned,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVolunteerStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('volunteerStats name');
    
    if (!user?.volunteerStats) {
      return res.json({
        success: true,
        data: {
          totalDeliveries: 0,
          peopleHelped: 0,
          points: 0,
          level: 1,
          badges: [],
          currentStreak: 0,
        },
      });
    }

    const level = Math.floor(user.volunteerStats.points / 100) + 1;
    const nextLevelPoints = level * 100;
    const progressToNextLevel = ((user.volunteerStats.points % 100) / 100) * 100;

    res.json({
      success: true,
      data: {
        ...user.volunteerStats,
        level,
        nextLevelPoints,
        progressToNextLevel,
        name: user.name,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'all' } = req.query;
    let dateFilter = {};

    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { 'volunteerStats.lastDeliveryDate': { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { 'volunteerStats.lastDeliveryDate': { $gte: monthAgo } };
    }

    const leaderboard = await User.find({
      role: 'logistics',
      'volunteerStats.totalDeliveries': { $gt: 0 },
      ...dateFilter,
    })
      .select('name volunteerStats.totalDeliveries volunteerStats.peopleHelped volunteerStats.points volunteerStats.badges')
      .sort({ 'volunteerStats.points': -1 })
      .limit(50);

    const currentUserRank = leaderboard.findIndex(
      (u: any) => u._id.toString() === req.user?.userId
    ) + 1;

    res.json({
      success: true,
      data: {
        leaderboard,
        currentUserRank: currentUserRank || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'name volunteerStats.totalDeliveries volunteerStats.peopleHelped volunteerStats.badges volunteerStats.points'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const level = Math.floor((user.volunteerStats?.points || 0) / 100) + 1;

    res.json({
      success: true,
      data: {
        name: user.name,
        totalDeliveries: user.volunteerStats?.totalDeliveries || 0,
        peopleHelped: user.volunteerStats?.peopleHelped || 0,
        badges: user.volunteerStats?.badges || [],
        level,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
