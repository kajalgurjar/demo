import express from 'express';
import verifyAPIKey from '../middleware/verifyAPIKey.js';
import { changePasswordCorporate ,changePasswordEmployee} from '../controllers/settings.controller.js';

const router = express.Router();

// Route to send an invitation
router.put('/change-passwordEmployee/:id', verifyAPIKey, changePasswordEmployee);
router.put('/change-passwordCorporate/:id', verifyAPIKey,  changePasswordCorporate);

export default router;

