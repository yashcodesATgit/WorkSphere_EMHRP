import express from 'express';
import { getPerformanceReviews, getPerformanceReview, createPerformanceReview, updatePerformanceReview, deletePerformanceReview, completePerformanceReview } from '../controllers/performanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getPerformanceReviews);
router.get('/:id', getPerformanceReview);
router.post('/', authorizeRoles('ADMIN', 'HR'), createPerformanceReview);
router.patch('/:id', authorizeRoles('ADMIN', 'HR'), updatePerformanceReview);
router.delete('/:id', authorizeRoles('ADMIN', 'HR'), deletePerformanceReview);
router.patch('/:id/complete', authorizeRoles('ADMIN', 'HR'), completePerformanceReview);

export default router;
