import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';

export const getLeaves = async (req, res, next) => {
  try {
    const { employee, status, leaveType, from, to, page = 1, limit = 10, sort = 'appliedOn', order = 'desc' } = req.query;
    const query = {};

    if (req.user.role === 'EMPLOYEE') {
      const emp = await Employee.findOne({ user: req.user._id });
      if (!emp) return res.status(404).json({ success: false, message: 'Employee record not found.' });
      query.employee = emp._id;
    } else {
      if (employee) query.employee = employee;
    }

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (from || to) {
      query.startDate = {};
      if (from) query.startDate.$gte = new Date(from);
      if (to) query.startDate.$lte = new Date(to);
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('reviewedBy', 'name')
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: leaves,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

export const getLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId user')
      .populate('reviewedBy', 'name');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found.' });

    if (req.user.role === 'EMPLOYEE') {
      if (!leave.employee.user || leave.employee.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }
    res.json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

export const applyLeave = async (req, res, next) => {
  try {
    const { employee: bodyEmployee, leaveType, startDate, endDate, reason } = req.body;

    let employeeId = bodyEmployee;

    // EMPLOYEE role: always use their own employee record
    if (req.user.role === 'EMPLOYEE') {
      const emp = await Employee.findOne({ user: req.user._id });
      if (!emp) return res.status(404).json({ success: false, message: 'Employee record not found.' });
      employeeId = emp._id;
    }

    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Employee, leave type, start date, end date, and reason are required.' });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date.' });
    }

    const leave = await Leave.create({ employee: employeeId, leaveType, startDate, endDate, reason });
    await leave.populate('employee', 'firstName lastName employeeId');
    res.status(201).json({ success: true, message: 'Leave application submitted.', data: leave });
  } catch (err) {
    next(err);
  }
};

export const updateLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employee', 'user');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found.' });

    if (req.user.role === 'EMPLOYEE') {
      if (!leave.employee.user || leave.employee.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (leave.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Cannot edit a leave that is not pending.' });
      }
    }

    const { leaveType, startDate, endDate, reason } = req.body;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date.' });
    }
    if (leaveType) leave.leaveType = leaveType;
    if (startDate) leave.startDate = startDate;
    if (endDate) leave.endDate = endDate;
    if (reason) leave.reason = reason;
    await leave.save();
    await leave.populate('employee', 'firstName lastName employeeId');
    res.json({ success: true, message: 'Leave updated.', data: leave });
  } catch (err) {
    next(err);
  }
};

export const deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employee', 'user');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found.' });

    if (req.user.role === 'EMPLOYEE') {
      if (!leave.employee.user || leave.employee.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (leave.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Only pending leaves can be cancelled.' });
      }
    }
    leave.status = 'CANCELLED';
    await leave.save();
    res.json({ success: true, message: 'Leave cancelled.', data: leave });
  } catch (err) {
    next(err);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED.' });
    }
    if (status === 'REJECTED' && !remarks?.trim()) {
      return res.status(400).json({ success: false, message: 'Remark is required when rejecting.' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found.' });
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Only pending leaves can be reviewed.' });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    if (remarks) leave.remarks = remarks;
    await leave.save();
    await leave.populate('employee', 'firstName lastName employeeId');
    await leave.populate('reviewedBy', 'name');
    res.json({ success: true, message: `Leave ${status.toLowerCase()}.`, data: leave });
  } catch (err) {
    next(err);
  }
};
