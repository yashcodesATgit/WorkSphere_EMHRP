import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

function calcWorkingHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  return Math.max(0, (outH * 60 + outM - (inH * 60 + inM)) / 60);
}

export const getAttendance = async (req, res, next) => {
  try {
    const { employee, status, from, to, page = 1, limit = 10, sort = 'date', order = 'desc' } = req.query;
    const query = {};

    if (req.user.role === 'EMPLOYEE') {
      const emp = await Employee.findOne({ user: req.user._id });
      if (!emp) return res.status(404).json({ success: false, message: 'Employee record not found.' });
      query.employee = emp._id;
    } else {
      if (employee) query.employee = employee;
    }

    if (status) query.status = status;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: records,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceById = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id).populate('employee', 'firstName lastName employeeId user');
    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found.' });

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

export const createAttendance = async (req, res, next) => {
  try {
    const { employee, date, status, checkIn, checkOut, remarks } = req.body;
    if (!employee || !date) return res.status(400).json({ success: false, message: 'Employee and date are required.' });

    const workingHours = calcWorkingHours(checkIn, checkOut);
    const record = await Attendance.create({ employee, date, status, checkIn, checkOut, workingHours, remarks });
    await record.populate('employee', 'firstName lastName employeeId');
    res.status(201).json({ success: true, message: 'Attendance recorded.', data: record });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Attendance already exists for this employee on this date.' });
    next(err);
  }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });

    const { status, checkIn, checkOut, remarks } = req.body;
    if (status) record.status = status;
    if (checkIn !== undefined) record.checkIn = checkIn;
    if (checkOut !== undefined) record.checkOut = checkOut;
    if (remarks !== undefined) record.remarks = remarks;
    record.workingHours = calcWorkingHours(record.checkIn, record.checkOut);
    await record.save();
    await record.populate('employee', 'firstName lastName employeeId');
    res.json({ success: true, message: 'Attendance updated.', data: record });
  } catch (err) {
    next(err);
  }
};

export const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.json({ success: true, message: 'Attendance deleted.' });
  } catch (err) {
    next(err);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const emp = await Employee.findOne({ user: req.user._id });
    if (!emp) return res.status(404).json({ success: false, message: 'Employee record not found.' });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Always use UTC midnight so date matches frontend queries

    const existing = await Attendance.findOne({ employee: emp._id, date: today });
    if (existing) return res.status(409).json({ success: false, message: 'Already checked in today.' });

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const record = await Attendance.create({
      employee: emp._id,
      date: today,
      status: 'PRESENT',
      checkIn: timeStr,
    });
    await record.populate('employee', 'firstName lastName employeeId');
    res.status(201).json({ success: true, message: `Checked in at ${timeStr}`, data: record });
  } catch (err) {
    next(err);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const emp = await Employee.findOne({ user: req.user._id });
    if (!emp) return res.status(404).json({ success: false, message: 'Employee record not found.' });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Always use UTC midnight so date matches frontend queries

    const record = await Attendance.findOne({ employee: emp._id, date: today });
    if (!record) return res.status(400).json({ success: false, message: 'No check-in found for today.' });
    if (record.checkOut) return res.status(409).json({ success: false, message: 'Already checked out today.' });

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    record.checkOut = timeStr;
    record.workingHours = calcWorkingHours(record.checkIn, timeStr);
    await record.save();
    await record.populate('employee', 'firstName lastName employeeId');
    res.json({ success: true, message: `Checked out at ${timeStr}. Hours: ${record.workingHours.toFixed(1)}`, data: record });
  } catch (err) {
    next(err);
  }
};
