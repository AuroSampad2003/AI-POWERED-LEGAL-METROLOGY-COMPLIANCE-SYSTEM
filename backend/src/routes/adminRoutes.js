import express from 'express';

import { protect } from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllInspections,
  getInspectionByIdAdmin,
  updateInspectionStatus,
} from '../controllers/adminController.js';

const router = express.Router();

// ADMIN PROTECTION
// router.use(protect);
// router.use(adminMiddleware);

// DASHBOARD
router.get('/dashboard', getDashboardStats);

// USER MANAGEMENT
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// INSPECTION MANAGEMENT
router.get('/inspections', getAllInspections);
router.get('/inspections/:id', getInspectionByIdAdmin);
router.patch('/inspections/:id/status', updateInspectionStatus);

export default router;