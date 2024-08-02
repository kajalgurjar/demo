import express from 'express';
import { updateLeadStatus } from '../controllers/status.controller.js';

const router = express.Router();

// Route to update lead status
router.put('/status/:id', updateLeadStatus);

export default router;



