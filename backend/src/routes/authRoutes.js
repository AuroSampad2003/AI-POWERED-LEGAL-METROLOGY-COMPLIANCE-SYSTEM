import express from 'express';

import {
  registerUser,
  loginUser,
  getMe,
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

import { validate } from '../middleware/validate.js';

import {
  registerSchema,
  loginSchema,
} from '../validators/authValidators.js';

const router = express.Router();

// Normal user registration
router.post('/register', validate(registerSchema), registerUser);

// Normal user login
router.post('/login', validate(loginSchema), loginUser);

// Get current logged-in user
router.get('/me', protect, getMe);

export default router;