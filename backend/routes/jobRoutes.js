import { Router } from 'express';
import {
  createJob,
  getAllJobs,
  getMyJobs,
  getClientJobs,
  assignTechnician,
  updateStatus,
  adminUpdateStatus,
  addNote,
  getNotes
} from '../controllers/jobController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, authorizeRoles('admin'), createJob);
router.get('/', authenticate, authorizeRoles('admin'), getAllJobs);
router.get('/my', authenticate, authorizeRoles('technician'), getMyJobs);
router.get('/client', authenticate, authorizeRoles('client'), getClientJobs);
router.patch('/:id/assign', authenticate, authorizeRoles('admin'), assignTechnician);
router.patch('/:id/status', authenticate, authorizeRoles('technician'), updateStatus);
router.patch('/:id/admin-status', authenticate, authorizeRoles('admin'), adminUpdateStatus);
router.post('/:id/notes', authenticate, addNote);
router.get('/:id/notes', authenticate, getNotes);

export default router;