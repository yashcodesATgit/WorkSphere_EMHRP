import express from 'express';
import { getDepartments, getDepartment, createDepartment, updateDepartment, updateDepartmentStatus } from '../controllers/departmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDepartments);
router.get('/:id', getDepartment);
router.post('/', authorizeRoles('ADMIN', 'HR'), createDepartment);
router.patch('/:id', authorizeRoles('ADMIN', 'HR'), updateDepartment);
router.patch('/:id/status', authorizeRoles('ADMIN', 'HR'), updateDepartmentStatus);

export default router;
