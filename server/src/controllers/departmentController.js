import Department from '../models/Department.js';
import Employee from '../models/Employee.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    // Add employee count to each department
    const withCounts = await Promise.all(
      departments.map(async (dept) => {
        const count = await Employee.countDocuments({ department: dept._id, isActive: true });
        return { ...dept.toObject(), employeeCount: count };
      })
    );

    res.json({ success: true, departments: withCounts });
  } catch (err) {
    next(err);
  }
};

export const getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found.' });
    res.json({ success: true, department });
  } catch (err) {
    next(err);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Department name is required.' });

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ success: false, message: 'A department with this name already exists.' });

    const department = await Department.create({ name: name.trim(), description: description?.trim() || '' });
    res.status(201).json({ success: true, message: 'Department created.', department });
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found.' });

    if (name && name.trim() !== department.name) {
      const existing = await Department.findOne({ name: name.trim(), _id: { $ne: department._id } });
      if (existing) return res.status(409).json({ success: false, message: 'A department with this name already exists.' });
      department.name = name.trim();
    }
    if (description !== undefined) department.description = description.trim();

    await department.save();
    res.json({ success: true, message: 'Department updated.', department });
  } catch (err) {
    next(err);
  }
};

export const updateDepartmentStatus = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found.' });
    department.isActive = !department.isActive;
    await department.save();
    res.json({ success: true, message: `Department ${department.isActive ? 'activated' : 'deactivated'}.`, department });
  } catch (err) {
    next(err);
  }
};
