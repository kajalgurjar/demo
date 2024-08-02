import express from 'express';
import { signup , logout, getCorporateById,verifyOTP } from '../controllers/corporate.controller.js';

import authMiddleware from '../middleware/auth.Middleware.js'; // Assuming you have this middleware
import rolemiddleware from '../middleware/role.middleware.js';
import verifyAPIKey from '../middleware/verifyAPIKey.js';

const router = express.Router();

// Only allow admins to access the company signup route
router.post('/signup', verifyAPIKey, signup);
router.post('/logout',authMiddleware,logout); 
router.get('/get-corporate/:id', getCorporateById);
router.post('/verify-otp', verifyOTP);
export default router;
