import express from 'express';
import { corporateAndEmployeelogin } from '../controllers/employee.controller.js';
import verifyAPIKey from '../middleware/verifyAPIKey.js';
const router = express.Router();

// Route for login
router.post('/login', verifyAPIKey, corporateAndEmployeelogin);

export default router;
