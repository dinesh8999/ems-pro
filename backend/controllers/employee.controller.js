import Employee from '../models/Employee.js';
import bcrypt from 'bcryptjs';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all employees with filters
// @route   GET /api/employees
// @access  Protected
export const getEmployees = asyncHandler(async (req, res, next) => {
  const { search, department, minSalary, maxSalary, status, sortBy = 'createdAt', order = 'desc', page, limit } = req.query;

  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (department) query.department = department;
  if (status) query.status = status;

  if (minSalary || maxSalary) {
    query.salary = {};
    if (minSalary) query.salary.$gte = Number(minSalary);
    if (maxSalary) query.salary.$lte = Number(maxSalary);
  }

  const sortOptions = {};
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  let dbQuery = Employee.find(query).sort(sortOptions);

  // Pagination if passed
  if (page && limit) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    dbQuery = dbQuery.skip(skip).limit(limitNum);
  }

  const employees = await dbQuery;

  res.status(200).json({ success: true, count: employees.length, data: employees });
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Protected
export const getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return next(new ErrorResponse('Employee not found', 404));
  }
  res.status(200).json({ success: true, data: employee });
});

// @desc    Create new employee (Admin only)
// @route   POST /api/employees
// @access  Protected (Admin)
export const createEmployee = asyncHandler(async (req, res, next) => {
  const { name, email, department, position, salary, joinDate, phone, address, status, avatar } = req.body;

  if (!name || !email || !department || !position || !salary) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  if (!email.toLowerCase().endsWith('@ems.com')) {
    return next(new ErrorResponse('Email address must end with @ems.com (e.g. user@ems.com)', 400));
  }

  const existingEmployee = await Employee.findOne({ email });
  if (existingEmployee) {
    return next(new ErrorResponse('Employee with this email already exists', 400));
  }

  const employee = await Employee.create({
    name,
    email,
    department,
    position,
    salary,
    joinDate: joinDate || Date.now(),
    phone: phone || '',
    address: address || '',
    status: status || 'active',
    avatar: avatar || ''
  });

  res.status(201).json({ success: true, message: 'Employee created successfully', data: employee });
});

// @desc    Full update employee (Admin only — any field)
// @route   PUT /api/employees/:id
// @access  Protected (Admin)
export const updateEmployee = asyncHandler(async (req, res, next) => {
  const { name, email, phone, address, department, position, salary, joinDate, status, avatar } = req.body;

  let employee = await Employee.findById(req.params.id);
  if (!employee) {
    return next(new ErrorResponse('Employee not found', 404));
  }

  if (email && !email.toLowerCase().endsWith('@ems.com')) {
    return next(new ErrorResponse('Email address must end with @ems.com (e.g. user@ems.com)', 400));
  }

  // Allow all field updates through this endpoint (admin usage)
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (department !== undefined) updateData.department = department;
  if (position !== undefined) updateData.position = position;
  if (salary !== undefined) updateData.salary = Number(salary);
  if (joinDate !== undefined) updateData.joinDate = joinDate;
  if (status !== undefined) updateData.status = status;
  if (avatar !== undefined) updateData.avatar = avatar;

  employee = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

  res.status(200).json({ success: true, message: 'Employee updated successfully', data: employee });
});

// @desc    Self-update employee profile (Employee only — limited fields)
// @route   PUT /api/employees/:id/profile
// @access  Protected (Employee - own profile)
export const updateEmployeeProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, address, avatar } = req.body;

  let employee = await Employee.findById(req.params.id);
  if (!employee) {
    return next(new ErrorResponse('Employee not found', 404));
  }

  // Only allow updating limited fields for self-update
  const updateData = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (avatar !== undefined) updateData.avatar = avatar;

  employee = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

  res.status(200).json({ success: true, message: 'Profile updated successfully', data: employee });
});

// @desc    Update employee password
// @route   PUT /api/employees/:id/password
// @access  Protected
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new password', 400));
  }

  const employee = await Employee.findById(req.params.id).select('+password');
  if (!employee) {
    return next(new ErrorResponse('Employee not found', 404));
  }

  if (!employee.password) {
    return next(new ErrorResponse('No password set for this account', 400));
  }

  const isMatch = await bcrypt.compare(currentPassword, employee.password);
  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  const salt = await bcrypt.genSalt(10);
  employee.password = await bcrypt.hash(newPassword, salt);
  await employee.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Protected (Admin)
export const deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return next(new ErrorResponse('Employee not found', 404));
  }

  await Employee.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Employee deleted successfully' });
});
