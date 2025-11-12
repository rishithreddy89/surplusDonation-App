import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 20, unreadOnly } = req.query;
    const query: any = { userId: req.user?.userId };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({
      userId: req.user?.userId,
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user?.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { userId: req.user?.userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
