import express from 'express';
import {
  createAdvertisement,
  getAllAdvertisements,
  getActiveAdvertisements,
  getAdvertisement,
  updateAdvertisement,
  toggleAdvertisementStatus,
  deleteAdvertisement,
  trackClick,
  getAdvertisementStats
} from '../controllers/advertisementController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public/User routes
router.get('/active', protect, getActiveAdvertisements);
router.post('/:id/click', protect, trackClick);

// Admin only routes
router.post('/', protect, authorize('admin'), createAdvertisement);
router.get('/', protect, authorize('admin'), getAllAdvertisements);
router.get('/stats', protect, authorize('admin'), getAdvertisementStats);
router.get('/:id', protect, authorize('admin'), getAdvertisement);
router.put('/:id', protect, authorize('admin'), updateAdvertisement);
router.patch('/:id/toggle', protect, authorize('admin'), toggleAdvertisementStatus);
router.delete('/:id', protect, authorize('admin'), deleteAdvertisement);

export default router;
