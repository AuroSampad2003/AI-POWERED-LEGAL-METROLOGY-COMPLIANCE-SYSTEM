import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  getAllComplaintsForAdmin,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createComplaintSchema, updateComplaintStatusSchema } from '../validators/complaintValidators.js';

const router = express.Router();

router.post('/', protect, validate(createComplaintSchema), createComplaint);
router.get('/', protect, getMyComplaints);

// NEW: admin — list all complaints (place BEFORE '/:id' so it isn't swallowed as an id param)
router.get('/admin/all', protect, getAllComplaintsForAdmin);

router.get('/:id', protect, getComplaintById);
router.patch('/:id/status', protect, validate(updateComplaintStatusSchema), updateComplaintStatus);

export default router;