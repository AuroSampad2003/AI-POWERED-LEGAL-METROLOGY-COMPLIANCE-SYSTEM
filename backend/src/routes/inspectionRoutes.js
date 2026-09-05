import express from 'express';
import {
  createInspection,
  getMyInspections,
  getInspectionById,
  getDashboardStats,
} from '../controllers/inspectionController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.post('/', protect, upload.array('images', 6), createInspection);
router.get('/', protect, getMyInspections);
router.get('/stats/dashboard', protect, getDashboardStats);
router.get('/:id', protect, getInspectionById);

export default router;