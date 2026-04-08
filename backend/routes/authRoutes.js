import express from 'express';
const router = express.Router();

import { login, register } from '../controllers/authController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

router.post('/login', login);
router.post('/register', authenticate, authorizeRoles('admin'), register);

export default router;
