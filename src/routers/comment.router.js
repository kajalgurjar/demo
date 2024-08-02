// routes/commentRoutes.js
import express from 'express';
import { createComment, updateComment} from '../controllers/comment.controller.js';
import authMiddleware from '../middleware/auth.Middleware.js'; // Assuming you have an authentication middleware
import verifyAPIKey from '../middleware/verifyAPIKey.js';

const router = express.Router();

router.post('/comments', authMiddleware,verifyAPIKey, createComment);
router.put('/comments/:commentId', authMiddleware, updateComment);

export default router;
