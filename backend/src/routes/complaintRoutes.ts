import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintStats
} from '../controllers/complaintController';

const router = express.Router();

// User routes
router.post('/', authenticate, createComplaint);
router.get('/my-complaints', authenticate, getUserComplaints);

// Admin routes
router.get('/all', authenticate, getAllComplaints);
router.put('/:id/status', authenticate, updateComplaintStatus);
router.get('/stats', authenticate, getComplaintStats);

export default router;
