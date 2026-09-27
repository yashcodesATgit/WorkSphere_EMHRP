import express from 'express';
import { getEmployees, getEmployee, createEmployee, updateEmployee, updateEmployeeStatus, createEmployeeAccount } from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('ADMIN', 'HR'), getEmployees);
router.get('/:id', getEmployee);
router.post('/', authorizeRoles('ADMIN', 'HR'), createEmployee);
router.post('/:id/account', authorizeRoles('ADMIN', 'HR'), createEmployeeAccount);
router.patch('/:id', authorizeRoles('ADMIN', 'HR'), updateEmployee);
router.patch('/:id/status', authorizeRoles('ADMIN', 'HR'), updateEmployeeStatus);

export default router;
