import Performance from '../models/Performance.js';
import Employee from '../models/Employee.js';

export const getPerformanceReviews = async (req, res, next) => {
  try {
    const { employee, reviewPeriod, status, rating, page = 1, limit = 10, sort = 'reviewDate', order = 'desc' } = req.query;
    const query = {};

    if (req.user.role === 'EMPLOYEE') {
      const emp = await Employee.findOne({ user: req.user._id });
      if (!emp) return res.status(404).json({ success: false, message: 'Employee record not found.' });
      query.employee = emp._id;
    } else {
      if (employee) query.employee = employee;
    }

    if (reviewPeriod) query.reviewPeriod = new RegExp(reviewPeriod, 'i');
    if (status) query.status = status;
    if (rating) query.rating = Number(rating);

    const total = await Performance.countDocuments(query);
    const data = await Performance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('reviewer', 'name')
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

export const getPerformanceReview = async (req, res, next) => {
  try {
    const review = await Performance.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId user')
      .populate('reviewer', 'name');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (req.user.role === 'EMPLOYEE') {
      if (!review.employee.user || review.employee.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const createPerformanceReview = async (req, res, next) => {
  try {
    const { employee, reviewPeriod, reviewDate, rating, goals, strengths, improvements, comments } = req.body;
    if (!employee || !reviewPeriod || !reviewDate || rating === undefined) {
      return res.status(400).json({ success: false, message: 'Employee, review period, review date, and rating are required.' });
    }
    const r = Number(rating);
    if (r < 1 || r > 5 || !Number.isInteger(r)) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }
    const review = await Performance.create({
      employee, reviewer: req.user._id, reviewPeriod, reviewDate, rating: r,
      goals, strengths, improvements, comments,
    });
    await review.populate('employee', 'firstName lastName employeeId');
    await review.populate('reviewer', 'name');
    res.status(201).json({ success: true, message: 'Performance review created.', data: review });
  } catch (err) {
    next(err);
  }
};

export const updatePerformanceReview = async (req, res, next) => {
  try {
    const review = await Performance.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (review.status === 'COMPLETED') return res.status(400).json({ success: false, message: 'Cannot edit a completed review.' });

    const { reviewPeriod, reviewDate, rating, goals, strengths, improvements, comments } = req.body;
    if (rating !== undefined) {
      const r = Number(rating);
      if (r < 1 || r > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
      review.rating = r;
    }
    if (reviewPeriod) review.reviewPeriod = reviewPeriod;
    if (reviewDate) review.reviewDate = reviewDate;
    if (goals !== undefined) review.goals = goals;
    if (strengths !== undefined) review.strengths = strengths;
    if (improvements !== undefined) review.improvements = improvements;
    if (comments !== undefined) review.comments = comments;
    await review.save();
    await review.populate('employee', 'firstName lastName employeeId');
    await review.populate('reviewer', 'name');
    res.json({ success: true, message: 'Review updated.', data: review });
  } catch (err) {
    next(err);
  }
};

export const deletePerformanceReview = async (req, res, next) => {
  try {
    const review = await Performance.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
};

export const completePerformanceReview = async (req, res, next) => {
  try {
    const review = await Performance.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (review.status === 'COMPLETED') return res.status(400).json({ success: false, message: 'Review is already completed.' });
    review.status = 'COMPLETED';
    await review.save();
    await review.populate('employee', 'firstName lastName employeeId');
    await review.populate('reviewer', 'name');
    res.json({ success: true, message: 'Review marked as completed.', data: review });
  } catch (err) {
    next(err);
  }
};
