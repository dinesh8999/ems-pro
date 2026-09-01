import Department from '../models/Department.js';
import Employee from '../models/Employee.js';
import ActivityLog from '../models/ActivityLog.js';

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('head', 'name email position')
      .sort({ name: 1 });

    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name email position salary');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Get employees in this department
    const employees = await Employee.find({ department: department.name })
      .select('name email position salary');

    res.json({ success: true, data: { ...department._doc, employees } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create department
export const createDepartment = async (req, res) => {
  try {
    const { name, description, head, budget, location } = req.body;

    // Check if department already exists
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department already exists' });
    }

    const department = await Department.create({
      name,
      description,
      head,
      budget,
      location
    });

    // Update employee count
    const count = await Employee.countDocuments({ department: name });
    department.employeeCount = count;
    await department.save();

    // Log activity
    await ActivityLog.create({
      action: 'Created department',
      entityType: 'Department',
      entityId: department._id,
      details: `Department: ${name}`
    });

    res.status(201).json({ success: true, message: 'Department created', data: department });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('head', 'name email');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Update employee count
    const count = await Employee.countDocuments({ department: department.name });
    department.employeeCount = count;
    await department.save();

    res.json({ success: true, message: 'Department updated', data: department });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check if department has employees
    const employeeCount = await Employee.countDocuments({ department: department.name });
    if (employeeCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete department with ${employeeCount} employees. Reassign them first.` 
      });
    }

    await department.deleteOne();

    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get department statistics
export const getDepartmentStats = async (req, res) => {
  try {
    const stats = await Department.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: 'name',
          foreignField: 'department',
          as: 'employees'
        }
      },
      {
        $project: {
          name: 1,
          budget: 1,
          employeeCount: { $size: '$employees' },
          totalSalary: { $sum: '$employees.salary' },
          avgSalary: { $avg: '$employees.salary' }
        }
      },
      { $sort: { employeeCount: -1 } }
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
