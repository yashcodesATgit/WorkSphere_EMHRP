import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import User from '../models/User.js';

/**
 * POST /api/employees/:id/account
 * Admin/HR only — create a login account for an existing employee.
 */
export const createEmployeeAccount = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    if (employee.user) {
      return res.status(409).json({ success: false, message: 'This employee already has a login account.' });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if a User with this email already exists
    const existing = await User.findOne({ email: employee.email });
    if (existing) {
      // Re-link if the user exists but wasn't linked
      employee.user = existing._id;
      await employee.save();
      return res.json({ success: true, message: 'Existing account re-linked to this employee.', email: employee.email });
    }

    const user = await User.create({
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      password,
      role: 'EMPLOYEE',
    });

    employee.user = user._id;
    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Login account created successfully.',
      email: employee.email,
    });
  } catch (err) {
    next(err);
  }
};


export const getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, department, status, sort = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { employeeId: regex },
      ];
    }

    if (department) query.department = department;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('department', 'name')
      .sort(sortObj)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      employees,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('department', 'name isActive');
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    // EMPLOYEE role can only view their own record
    if (req.user.role === 'EMPLOYEE') {
      if (!employee.user || employee.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    res.json({ success: true, employee });
  } catch (err) {
    next(err);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, gender, address, department, designation, joiningDate, employmentStatus, salary } = req.body;

    if (!firstName || !lastName || !email || !department || !designation || !joiningDate) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, department, designation, and joining date are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: 'Invalid email format.' });

    const existingEmail = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(409).json({ success: false, message: 'An employee with this email already exists.' });

    const dept = await Department.findById(department);
    if (!dept) return res.status(400).json({ success: false, message: 'Invalid department.' });

    const employee = await Employee.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone, dateOfBirth, gender, address,
      department,
      designation: designation.trim(),
      joiningDate,
      employmentStatus,
      salary: salary ? Number(salary) : 0,
    });

    await employee.populate('department', 'name');
    res.status(201).json({ success: true, message: 'Employee created.', employee });
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    const { firstName, lastName, email, phone, dateOfBirth, gender, address, department, designation, joiningDate, employmentStatus, salary } = req.body;

    if (email && email.toLowerCase() !== employee.email) {
      const existing = await Employee.findOne({ email: email.toLowerCase(), _id: { $ne: employee._id } });
      if (existing) return res.status(409).json({ success: false, message: 'Email already in use.' });
      employee.email = email.toLowerCase().trim();
    }

    if (department) {
      const dept = await Department.findById(department);
      if (!dept) return res.status(400).json({ success: false, message: 'Invalid department.' });
      employee.department = department;
    }

    if (firstName) employee.firstName = firstName.trim();
    if (lastName) employee.lastName = lastName.trim();
    if (phone !== undefined) employee.phone = phone;
    if (dateOfBirth) employee.dateOfBirth = dateOfBirth;
    if (gender !== undefined) employee.gender = gender;
    if (address !== undefined) employee.address = address;
    if (designation) employee.designation = designation.trim();
    if (joiningDate) employee.joiningDate = joiningDate;
    if (employmentStatus) employee.employmentStatus = employmentStatus;
    if (salary !== undefined) employee.salary = Number(salary);

    await employee.save();
    await employee.populate('department', 'name');
    res.json({ success: true, message: 'Employee updated.', employee });
  } catch (err) {
    next(err);
  }
};

export const updateEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });
    employee.isActive = !employee.isActive;
    await employee.save();
    res.json({ success: true, message: `Employee ${employee.isActive ? 'activated' : 'deactivated'}.`, employee });
  } catch (err) {
    next(err);
  }
};
