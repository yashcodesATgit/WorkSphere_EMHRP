import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import { calcPayroll } from '../utils/payrollCalc.js';

export const getPayrolls = async (req, res, next) => {
  try {
    const { employee, month, year, status, page = 1, limit = 10, sort = 'year', order = 'desc' } = req.query;
    const query = {};

    if (req.user.role === 'EMPLOYEE') {
      const emp = await Employee.findOne({ user: req.user._id });
      if (!emp) return res.status(404).json({ success: false, message: 'Employee record not found.' });
      query.employee = emp._id;
    } else {
      if (employee) query.employee = employee;
    }

    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (status) query.status = status;

    const total = await Payroll.countDocuments(query);
    const data = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .sort({ [sort]: order === 'asc' ? 1 : -1, month: order === 'asc' ? 1 : -1 })
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

export const getPayroll = async (req, res, next) => {
  try {
    const record = await Payroll.findById(req.params.id).populate('employee', 'firstName lastName employeeId user');
    if (!record) return res.status(404).json({ success: false, message: 'Payroll record not found.' });

    if (req.user.role === 'EMPLOYEE') {
      if (!record.employee.user || record.employee.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const createPayroll = async (req, res, next) => {
  try {
    const { employee, month, year, basicSalary = 0, allowances = 0, deductions = 0, workingDays = 0, presentDays = 0, leaveDays = 0, remarks } = req.body;
    if (!employee || !month || !year) {
      return res.status(400).json({ success: false, message: 'Employee, month, and year are required.' });
    }
    const { grossSalary, netSalary } = calcPayroll(Number(basicSalary), Number(allowances), Number(deductions));
    const record = await Payroll.create({
      employee, month: Number(month), year: Number(year),
      basicSalary: Number(basicSalary), allowances: Number(allowances), deductions: Number(deductions),
      grossSalary, netSalary,
      workingDays: Number(workingDays), presentDays: Number(presentDays), leaveDays: Number(leaveDays),
      remarks,
    });
    await record.populate('employee', 'firstName lastName employeeId');
    res.status(201).json({ success: true, message: 'Payroll record created.', data: record });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Payroll already exists for this employee for the selected month/year.' });
    next(err);
  }
};

export const updatePayroll = async (req, res, next) => {
  try {
    const record = await Payroll.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    if (record.status === 'PAID') return res.status(400).json({ success: false, message: 'Cannot edit a paid payroll record.' });

    const { basicSalary, allowances, deductions, workingDays, presentDays, leaveDays, remarks } = req.body;
    if (basicSalary !== undefined) record.basicSalary = Number(basicSalary);
    if (allowances !== undefined) record.allowances = Number(allowances);
    if (deductions !== undefined) record.deductions = Number(deductions);
    if (workingDays !== undefined) record.workingDays = Number(workingDays);
    if (presentDays !== undefined) record.presentDays = Number(presentDays);
    if (leaveDays !== undefined) record.leaveDays = Number(leaveDays);
    if (remarks !== undefined) record.remarks = remarks;

    const { grossSalary, netSalary } = calcPayroll(record.basicSalary, record.allowances, record.deductions);
    record.grossSalary = grossSalary;
    record.netSalary = netSalary;
    await record.save();
    await record.populate('employee', 'firstName lastName employeeId');
    res.json({ success: true, message: 'Payroll updated.', data: record });
  } catch (err) {
    next(err);
  }
};

export const deletePayroll = async (req, res, next) => {
  try {
    const record = await Payroll.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.json({ success: true, message: 'Payroll record deleted.' });
  } catch (err) {
    next(err);
  }
};

export const updatePayrollStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['PENDING','PROCESSED','PAID'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const record = await Payroll.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    record.status = status;
    if (status === 'PAID') record.paidOn = new Date();
    await record.save();
    await record.populate('employee', 'firstName lastName employeeId');
    res.json({ success: true, message: `Payroll status updated to ${status}.`, data: record });
  } catch (err) {
    next(err);
  }
};
