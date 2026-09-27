import express from 'express';
import { getPayrolls, getPayroll, createPayroll, updatePayroll, deletePayroll, updatePayrollStatus } from '../controllers/payrollController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getPayrolls);
router.get('/:id', getPayroll);
router.post('/', authorizeRoles('ADMIN', 'HR'), createPayroll);
router.patch('/:id', authorizeRoles('ADMIN', 'HR'), updatePayroll);
router.delete('/:id', authorizeRoles('ADMIN', 'HR'), deletePayroll);
router.patch('/:id/status', authorizeRoles('ADMIN', 'HR'), updatePayrollStatus);

export default router;
