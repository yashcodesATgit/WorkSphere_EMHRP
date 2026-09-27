import express from 'express';
import {
  getAttendance, getAttendanceById, createAttendance,
  updateAttendance, deleteAttendance, checkIn, checkOut
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getAttendance);
router.post('/check-in', authorizeRoles('EMPLOYEE'), checkIn);
router.post('/check-out', authorizeRoles('EMPLOYEE'), checkOut);
router.post('/', authorizeRoles('ADMIN', 'HR'), createAttendance);
router.get('/:id', getAttendanceById);
router.patch('/:id', authorizeRoles('ADMIN', 'HR'), updateAttendance);
router.delete('/:id', authorizeRoles('ADMIN', 'HR'), deleteAttendance);

export default router;
