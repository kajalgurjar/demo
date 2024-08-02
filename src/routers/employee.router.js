import express from 'express';
import { sendEmployeeInvitation,
    resendEmployeeInvitation,
    deleteInvitation,
     completeEmployeeRegistration ,
     getAllEmployees,getEmployeeStatus,
      deleteEmployee,getEmployeeById
    } from '../controllers/employee.controller.js';

import verifyAPIKey from '../middleware/verifyAPIKey.js';
import upload from "../middleware/multer.middleware.js"
const router = express.Router();

router.post('/send-invitation', verifyAPIKey, sendEmployeeInvitation);
router.post('/resendInvitation',verifyAPIKey, resendEmployeeInvitation)
router.delete('/invitations/:id',verifyAPIKey, deleteInvitation);
router.post('/complete-registration', verifyAPIKey, completeEmployeeRegistration);
router.get('/get-employees/:companyId', verifyAPIKey, getAllEmployees);
router.get('/get-status/:companyId', verifyAPIKey, getEmployeeStatus);
router.delete('/employees/:id', verifyAPIKey, deleteEmployee);
router.get('/employees/:id', getEmployeeById);

export default router;
