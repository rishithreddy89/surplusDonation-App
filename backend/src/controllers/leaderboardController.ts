import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Surplus from '../models/Surplus';
import Request from '../models/Request';

export const getDonorLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    // Only aggregate donations that have been picked up
    const leaderboard = await Surplus.aggregate([
      {
        $match: {
          status: { $in: ['in-transit', 'delivered'] }, // Only count picked-up donations
        },
      },
      {
        $group: {
          _id: '$donorId',
          totalDonations: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'donor',
        },
      },
      {
        $unwind: '$donor',
      },
      {
        $project: {
          donorId: '$_id',
          name: '$donor.name',
          location: '$donor.location',
          donorType: '$donor.donorType',
          totalDonations: 1,
          totalQuantity: 1,
          points: {
            $add: [
              { $multiply: ['$totalDonations', 10] }, // 10 points per picked-up donation
              '$totalQuantity', // 1 point per unit
            ],
          },
        },
      },
      {
        $sort: { points: -1 },
      },
      {
        $limit: Number(limit),
      },
    ]);

    // Get current user's rank and stats (only for picked-up donations)
    let currentUserStats = null;
    if (req.user) {
      const allDonors = await Surplus.aggregate([
        {
          $match: {
            status: { $in: ['in-transit', 'delivered'] }, // Only picked-up donations
          },
        },
        {
          $group: {
            _id: '$donorId',
            totalDonations: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
          },
        },
        {
          $project: {
            donorId: '$_id',
            totalDonations: 1,
            totalQuantity: 1,
            points: {
              $add: [
                { $multiply: ['$totalDonations', 10] },
                '$totalQuantity',
              ],
            },
          },
        },
        {
          $sort: { points: -1 },
        },
      ]);

      const userIndex = allDonors.findIndex(
        (d) => d.donorId.toString() === req.user?.userId
      );

      if (userIndex !== -1) {
        const userStats = allDonors[userIndex];
        const nextRankPoints = allDonors[userIndex - 1]?.points || userStats.points;

        currentUserStats = {
          rank: userIndex + 1,
          totalDonations: userStats.totalDonations, // Only picked-up donations
          totalQuantity: userStats.totalQuantity,
          points: userStats.points,
          pointsToNextRank: Math.max(0, nextRankPoints - userStats.points),
        };
      }
    }

    res.json({
      success: true,
      data: {
        leaderboard,
        currentUser: currentUserStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNGOLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    // Aggregate requests by NGO
    const leaderboard = await Request.aggregate([
      {
        $group: {
          _id: '$ngoId',
          totalRequests: { $sum: 1 },
          fulfilledRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'ngo',
        },
      },
      {
        $unwind: '$ngo',
      },
      {
        $project: {
          ngoId: '$_id',
          name: '$ngo.name',
          location: '$ngo.location',
          totalRequests: 1,
          fulfilledRequests: 1,
          points: {
            $add: [
              { $multiply: ['$fulfilledRequests', 15] },
              { $multiply: ['$totalRequests', 5] },
            ],
          },
        },
      },
      {
        $sort: { points: -1 },
      },
      {
        $limit: Number(limit),
      },
    ]);

    // Get current NGO's rank and stats
    let currentNGOStats = null;
    if (req.user) {
      const allNGOs = await Request.aggregate([
        {
          $group: {
            _id: '$ngoId',
            totalRequests: { $sum: 1 },
            fulfilledRequests: {
              $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            ngoId: '$_id',
            totalRequests: 1,
            fulfilledRequests: 1,
            points: {
              $add: [
                { $multiply: ['$fulfilledRequests', 15] },
                { $multiply: ['$totalRequests', 5] },
              ],
            },
          },
        },
        {
          $sort: { points: -1 },
        },
      ]);

      const ngoIndex = allNGOs.findIndex(
        (n) => n.ngoId.toString() === req.user?.userId
      );

      if (ngoIndex !== -1) {
        const ngoStats = allNGOs[ngoIndex];
        const nextRankPoints = allNGOs[ngoIndex - 1]?.points || ngoStats.points;

        currentNGOStats = {
          rank: ngoIndex + 1,
          totalRequests: ngoStats.totalRequests,
          fulfilledRequests: ngoStats.fulfilledRequests,
          points: ngoStats.points,
          pointsToNextRank: nextRankPoints - ngoStats.points,
        };
      }
    }

    res.json({
      success: true,
      data: {
        leaderboard,
        currentNGO: currentNGOStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
