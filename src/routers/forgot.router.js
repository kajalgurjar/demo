import express from 'express';
import { requestPasswordReset, validateResetToken, resetPassword } from '../controllers/forgot.controller.js';
import verifyAPIKey from '../middleware/verifyAPIKey.js';

const router = express.Router();

// Request Password Reset
router.post('/forgot-password',verifyAPIKey, requestPasswordReset);

// Validate Reset Token
router.get('/reset/:token', validateResetToken);

// Reset Password
router.post('/reset/:token',verifyAPIKey, resetPassword);

export default router;
