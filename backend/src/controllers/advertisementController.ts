import { Request, Response } from 'express';
import Advertisement from '../models/Advertisement';

// Create new advertisement (Admin only)
export const createAdvertisement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, imageUrl, link, targetRoles, isActive } = req.body;

    // Validate target roles
    if (!targetRoles || targetRoles.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one target role must be specified'
      });
      return;
    }

    const advertisement = new Advertisement({
      title,
      description,
      imageUrl,
      link,
      targetRoles,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: (req as any).user.id
    });

    await advertisement.save();

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: advertisement
    });
  } catch (error: any) {
    console.error('Error creating advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create advertisement',
      error: error.message
    });
  }
};

// Get all advertisements (Admin)
export const getAllAdvertisements = async (req: Request, res: Response): Promise<void> => {
  try {
    const advertisements = await Advertisement.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: advertisements
    });
  } catch (error: any) {
    console.error('Error fetching advertisements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisements',
      error: error.message
    });
  }
};

// Get active advertisements for specific role
export const getActiveAdvertisements = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user.role;

    const advertisements = await Advertisement.find({
      isActive: true,
      targetRoles: userRole
    }).sort({ createdAt: -1 });

    // Increment impressions
    const adIds = advertisements.map(ad => ad._id);
    await Advertisement.updateMany(
      { _id: { $in: adIds } },
      { $inc: { impressions: 1 } }
    );

    res.status(200).json({
      success: true,
      data: advertisements
    });
  } catch (error: any) {
    console.error('Error fetching active advertisements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisements',
      error: error.message
    });
  }
};

// Get single advertisement
export const getAdvertisement = async (req: Request, res: Response): Promise<void> => {
  try {
    const advertisement = await Advertisement.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!advertisement) {
      res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: advertisement
    });
  } catch (error: any) {
    console.error('Error fetching advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisement',
      error: error.message
    });
  }
};

// Update advertisement (Admin only)
export const updateAdvertisement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, imageUrl, link, targetRoles, isActive } = req.body;

    const advertisement = await Advertisement.findById(req.params.id);

    if (!advertisement) {
      res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
      return;
    }

    // Update fields
    if (title) advertisement.title = title;
    if (description) advertisement.description = description;
    if (imageUrl !== undefined) advertisement.imageUrl = imageUrl;
    if (link !== undefined) advertisement.link = link;
    if (targetRoles) advertisement.targetRoles = targetRoles;
    if (isActive !== undefined) advertisement.isActive = isActive;

    await advertisement.save();

    res.status(200).json({
      success: true,
      message: 'Advertisement updated successfully',
      data: advertisement
    });
  } catch (error: any) {
    console.error('Error updating advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update advertisement',
      error: error.message
    });
  }
};

// Toggle advertisement active status (Admin only)
export const toggleAdvertisementStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);

    if (!advertisement) {
      res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
      return;
    }

    advertisement.isActive = !advertisement.isActive;
    await advertisement.save();

    res.status(200).json({
      success: true,
      message: `Advertisement ${advertisement.isActive ? 'activated' : 'deactivated'} successfully`,
      data: advertisement
    });
  } catch (error: any) {
    console.error('Error toggling advertisement status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle advertisement status',
      error: error.message
    });
  }
};

// Delete advertisement (Admin only)
export const deleteAdvertisement = async (req: Request, res: Response): Promise<void> => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);

    if (!advertisement) {
      res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
      return;
    }

    await advertisement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete advertisement',
      error: error.message
    });
  }
};

// Track advertisement click
export const trackClick = async (req: Request, res: Response): Promise<void> => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);

    if (!advertisement) {
      res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
      return;
    }

    advertisement.clicks += 1;
    await advertisement.save();

    res.status(200).json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error: any) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click',
      error: error.message
    });
  }
};

// Get advertisement statistics (Admin only)
export const getAdvertisementStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Advertisement.aggregate([
      {
        $group: {
          _id: null,
          totalAds: { $sum: 1 },
          activeAds: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          totalClicks: { $sum: '$clicks' },
          totalImpressions: { $sum: '$impressions' }
        }
      }
    ]);

    const topPerforming = await Advertisement.find()
      .sort({ clicks: -1 })
      .limit(5)
      .select('title clicks impressions');

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          totalAds: 0,
          activeAds: 0,
          totalClicks: 0,
          totalImpressions: 0
        },
        topPerforming
      }
    });
  } catch (error: any) {
    console.error('Error fetching advertisement stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisement statistics',
      error: error.message
    });
  }
};
