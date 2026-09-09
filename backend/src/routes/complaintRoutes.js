import express from 'express';
import { createComplaint, getMyComplaints, getComplaintById, getComplaintReport } from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createComplaintSchema } from '../validators/complaintValidators.js';

const router = express.Router();

router.post('/', protect, validate(createComplaintSchema), createComplaint);
router.get('/', protect, getMyComplaints);
router.get('/:id', protect, getComplaintById);
router.get('/:id/report', protect, getComplaintReport);

export default router;