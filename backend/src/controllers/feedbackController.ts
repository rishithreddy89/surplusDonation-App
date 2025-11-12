import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import { moderateContent } from '../utils/contentModeration';

// Create feedback
export const createFeedback = async (req: Request, res: Response) => {
  try {
    const { type, rating, title, description, relatedTo, proofUrls, isPublic } = req.body;
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Moderate content
    const titleModeration = moderateContent(title);
    const descriptionModeration = moderateContent(description);

    if (!titleModeration.isClean) {
      return res.status(400).json({
        success: false,
        message: titleModeration.message,
        field: 'title'
      });
    }

    if (!descriptionModeration.isClean) {
      return res.status(400).json({
        success: false,
        message: descriptionModeration.message,
        field: 'description'
      });
    }

    const feedback = new Feedback({
      userId,
      userRole,
      type,
      rating,
      title,
      description,
      relatedTo,
      proofUrls: proofUrls || [],
      isPublic: isPublic || false
    });

    await feedback.save();

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for your valuable input!',
      data: feedback
    });
  } catch (error: any) {
    console.error('Error creating feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

// Get user's feedback
export const getUserFeedback = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const { type } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const filter: any = { userId };
    if (type) filter.type = type;

    const feedback = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    return res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

// Get all feedback (Admin only)
export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const { type, rating, userRole, adminReviewed } = req.query;

    const filter: any = {};
    if (type) filter.type = type;
    if (rating) filter.rating = parseInt(rating as string);
    if (userRole) filter.userRole = userRole;
    if (adminReviewed !== undefined) filter.adminReviewed = adminReviewed === 'true';

    const feedback = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role');

    return res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error: any) {
    console.error('Error fetching all feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

// Get public feedback
export const getPublicFeedback = async (req: Request, res: Response) => {
  try {
    const { minRating } = req.query;

    const filter: any = { isPublic: true };
    if (minRating) {
      filter.rating = { $gte: parseInt(minRating as string) };
    }

    const feedback = await Feedback.find(filter)
      .sort({ rating: -1, helpful: -1, createdAt: -1 })
      .limit(50)
      .populate('userId', 'name role');

    return res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error: any) {
    console.error('Error fetching public feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

// Mark feedback as helpful
export const markFeedbackHelpful = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error: any) {
    console.error('Error marking feedback helpful:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update feedback',
      error: error.message
    });
  }
};

// Admin review feedback
export const reviewFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes, adminReviewed } = req.body;

    // Moderate admin notes
    if (adminNotes) {
      const moderation = moderateContent(adminNotes);
      if (!moderation.isClean) {
        return res.status(400).json({
          success: false,
          message: moderation.message
        });
      }
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { adminNotes, adminReviewed: adminReviewed !== undefined ? adminReviewed : true },
      { new: true }
    ).populate('userId', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback reviewed successfully',
      data: feedback
    });
  } catch (error: any) {
    console.error('Error reviewing feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to review feedback',
      error: error.message
    });
  }
};

// Get feedback statistics (Admin)
export const getFeedbackStats = async (req: Request, res: Response) => {
  try {
    const [typeStats, ratingStats, roleStats] = await Promise.all([
      Feedback.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Feedback.aggregate([
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ]),
      Feedback.aggregate([
        { $group: { _id: '$userRole', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    const total = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    const unreviewed = await Feedback.countDocuments({ adminReviewed: false });

    return res.status(200).json({
      success: true,
      data: {
        total,
        unreviewed,
        averageRating: avgRating[0]?.average || 0,
        typeStats,
        ratingStats,
        roleStats
      }
    });
  } catch (error: any) {
    console.error('Error fetching feedback stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
