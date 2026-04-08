import { Router } from 'express';
import {
  getClients,
  getTechnicians,
  getAllUsers,
  updateUser,
  deleteUser,
  changePassword
} from '../controllers/userController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/clients', authenticate, authorizeRoles('admin'), getClients);
router.get('/technicians', authenticate, authorizeRoles('admin'), getTechnicians);
router.get('/', authenticate, authorizeRoles('admin'), getAllUsers);
router.put('/:id', authenticate, authorizeRoles('admin'), updateUser);
router.put('/profile/password', authenticate, changePassword);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteUser);

export default router;