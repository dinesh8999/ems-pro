import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Employee from '../models/Employee.js';

const isValidEmsEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');
  return parts.length === 2 && parts[0].length > 0 && parts[1] === 'ems.com';
};

// @desc    Admin signup
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username, email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    if (!isValidEmsEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Email address must end with @ems.com (e.g. user@ems.com)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existingAdmin = await Admin.findOne({ $or: [{ email: cleanEmail }, { username: cleanUsername }] });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin with this email or username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({ username: cleanUsername, email: cleanEmail, password: hashedPassword, role: 'admin' });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token,
      user: { id: admin._id, name: admin.username, email: admin.email, role: admin.role, avatar: admin.avatar || '' },
      admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role, avatar: admin.avatar || '' }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// @desc    Login (Admin or Employee)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email or username and password' });
    }

    const rawInput = email.trim();
    const cleanEmail = rawInput.toLowerCase();

    // Validate email domain if user entered an email address containing '@'
    if (rawInput.includes('@') && !isValidEmsEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Email address must end with @ems.com (e.g. user@ems.com)' });
    }

    let user;
    let userRole;

    // Check strictly based on requested portal role
    if (role === 'employee') {
      const employee = await Employee.findOne({ email: cleanEmail }).select('+password');
      if (employee && employee.isRegistered && employee.password) {
        user = employee;
        userRole = 'employee';
      }
    } else if (role === 'admin') {
      const admin = await Admin.findOne({
        $or: [
          { email: cleanEmail },
          { username: rawInput },
          { username: cleanEmail }
        ]
      }).select('+password');
      if (admin) {
        user = admin;
        userRole = 'admin';
      }
    } else {
      // Legacy fallback mapping
      const employee = await Employee.findOne({ email: cleanEmail }).select('+password');
      if (employee && employee.isRegistered && employee.password) {
        user = employee;
        userRole = 'employee';
      } else {
        const admin = await Admin.findOne({
          $or: [
            { email: cleanEmail },
            { username: rawInput },
            { username: cleanEmail }
          ]
        }).select('+password');
        if (admin) {
          user = admin;
          userRole = 'admin';
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or unregistered account' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name || user.username,
        email: user.email,
        role: userRole,
        department: user.department || null,
        position: user.position || null,
        avatar: user.avatar || ''
      },
      admin: {
        id: user._id,
        username: user.username || user.name,
        email: user.email,
        role: userRole,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// @desc    Verify token — works for both Admin and Employee
// @route   GET /api/auth/verify
// @access  Protected
export const verifyTokenController = async (req, res) => {
  try {
    const { id, role } = req.admin; // populated by verifyToken middleware

    let userData;
    if (role === 'employee') {
      const emp = await Employee.findById(id).select('-password');
      if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
      userData = { id: emp._id, name: emp.name, email: emp.email, role: 'employee', department: emp.department, position: emp.position, avatar: emp.avatar || '' };
    } else {
      const admin = await Admin.findById(id).select('-password');
      if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
      userData = { id: admin._id, name: admin.username, email: admin.email, role: 'admin', avatar: admin.avatar || '' };
    }

    res.status(200).json({ success: true, user: userData, admin: userData });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Employee registration (complete profile)
// @route   POST /api/auth/employee-register
// @access  Public
export const employeeRegister = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (!isValidEmsEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email address must end with @ems.com (e.g. user@ems.com)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'No employee found with this email. Please contact your administrator.' });
    }

    if (employee.isRegistered) {
      return res.status(400).json({ success: false, message: 'This employee account is already registered. Please login instead.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    employee.password = hashedPassword;
    employee.isRegistered = true;
    if (name) employee.name = name;
    await employee.save();

    const token = jwt.sign(
      { id: employee._id, email: employee.email, role: 'employee' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Employee registration completed successfully',
      token,
      user: { id: employee._id, name: employee.name, email: employee.email, role: 'employee', department: employee.department, position: employee.position, avatar: employee.avatar || '' },
      admin: { id: employee._id, username: employee.name, email: employee.email, role: 'employee', avatar: employee.avatar || '' }
    });
  } catch (error) {
    console.error('Employee registration error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// @desc    Update Admin Profile
// @route   PUT /api/auth/profile
// @access  Protected (Admin)
export const updateAdminProfile = async (req, res) => {
  try {
    const { id } = req.admin;
    const { name, username, avatar } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (username || name) admin.username = username || name;
    if (avatar !== undefined) admin.avatar = avatar;

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin profile updated',
      user: { id: admin._id, name: admin.username, email: admin.email, role: 'admin', avatar: admin.avatar || '' }
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update admin profile' });
  }
};

// @desc    Change Admin Password
// @route   PUT /api/auth/change-password
// @access  Protected (Admin)
export const changeAdminPassword = async (req, res) => {
  try {
    const { id } = req.admin;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const admin = await Admin.findById(id).select('+password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Protected
export const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
