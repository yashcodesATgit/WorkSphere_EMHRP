import express from 'express';
import { getLeaves, getLeave, applyLeave, updateLeave, deleteLeave, updateLeaveStatus } from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getLeaves);
router.post('/', applyLeave);
router.get('/:id', getLeave);
router.patch('/:id', updateLeave);
router.delete('/:id', deleteLeave);
router.patch('/:id/status', authorizeRoles('ADMIN', 'HR'), updateLeaveStatus);

export default router;
