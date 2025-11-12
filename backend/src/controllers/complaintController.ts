import { Request, Response } from 'express';
import Complaint from '../models/Complaint';
import { moderateContent } from '../utils/contentModeration';

// Create a new complaint
export const createComplaint = async (req: Request, res: Response) => {
  try {
    const { title, description, category, priority, relatedTo, proofUrls } = req.body;
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

    const complaint = new Complaint({
      userId,
      userRole,
      title,
      description,
      category,
      priority: priority || 'medium',
      relatedTo,
      proofUrls: proofUrls || []
    });

    await complaint.save();

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });
  } catch (error: any) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: error.message
    });
  }
};

// Get user's complaints
export const getUserComplaints = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const { status, category } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const filter: any = { userId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('adminId', 'name email');

    return res.status(200).json({
      success: true,
      data: complaints
    });
  } catch (error: any) {
    console.error('Error fetching complaints:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};

// Get all complaints (Admin only)
export const getAllComplaints = async (req: Request, res: Response) => {
  try {
    const { status, priority, category, userRole } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (userRole) filter.userRole = userRole;

    const complaints = await Complaint.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .populate('userId', 'name email role')
      .populate('adminId', 'name email');

    return res.status(200).json({
      success: true,
      data: complaints
    });
  } catch (error: any) {
    console.error('Error fetching all complaints:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};

// Update complaint status (Admin only)
export const updateComplaintStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;
    const adminId = req.user?.userId || req.user?.id || req.user?._id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Moderate admin response
    if (adminResponse) {
      const moderation = moderateContent(adminResponse);
      if (!moderation.isClean) {
        return res.status(400).json({
          success: false,
          message: moderation.message
        });
      }
    }

    const updateData: any = { status };
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
      updateData.adminId = adminId;
    }
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error: any) {
    console.error('Error updating complaint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint',
      error: error.message
    });
  }
};

// Get complaint statistics (Admin)
export const getComplaintStats = async (req: Request, res: Response) => {
  try {
    const [statusStats, categoryStats, priorityStats] = await Promise.all([
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Complaint.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'pending' });
    const resolved = await Complaint.countDocuments({ status: 'resolved' });

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        resolved,
        statusStats,
        categoryStats,
        priorityStats
      }
    });
  } catch (error: any) {
    console.error('Error fetching complaint stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
