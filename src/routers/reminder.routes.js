// // routes/commentRoutes.js
// import express from 'express';
// import { addReminder,getAllReminders} from '../controllers/addReminder.controller.js';
// import authMiddleware from '../middleware/auth.Middleware.js'; // Assuming you have an authentication middleware
// import verifyAPIKey from '../middleware/verifyAPIKey.js';

// const router = express.Router();

// // router.get('/reminders', getRemindersByDateTime);
// // router.post('/add/reminders/:leadId', addReminder);

// // router.get('/getAllReminders',getAllReminders)


// router.post('/add', addReminder); // POST /api/v1/reminder/add
// router.get('/getAll', getAllReminders); // GET /api/v1/reminder/getAll
// export default router;

// src/routes/reminderRoutes.js
import express from 'express';
import { addReminder, getAllReminders } from '../controllers/addReminder.controller.js';
import authMiddleware from '../middleware/auth.Middleware.js'; // Authentication middleware

const router = express.Router();

// POST /api/v1/reminder/add
router.post('/add', addReminder); 

// GET /api/v1/reminder/getAll
router.get('/getAll/:id', getAllReminders); 

export default router;


