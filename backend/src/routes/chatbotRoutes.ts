import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { chat, getSuggestions } from '../controllers/chatbotController';

const router = express.Router();

router.post('/chat', authenticate, authorizeRoles('donor'), chat);
router.get('/suggestions', authenticate, authorizeRoles('donor'), getSuggestions);

export default router;
