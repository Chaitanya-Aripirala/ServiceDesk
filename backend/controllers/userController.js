const User = require('../models/User');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all users with filters
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { role, department, isActive, search } = req.query;
    let filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ name: 1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Technicians list with current workload
// @route   GET /api/users/technicians
// @access  Private
const getTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({
      role: { $in: ['technician', 'manager', 'admin'] },
      isActive: true,
    }).select('name email role department jobTitle assignedTicketCount avatar');

    res.json({ success: true, technicians });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new user (Admin)
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, jobTitle, phone, location } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Welcome123!',
      role: role || 'employee',
      department: department || 'Engineering',
      jobTitle: jobTitle || 'Staff Member',
      phone: phone || '+1 (555) 019-2834',
      location: location || 'HQ Campus',
    });

    await logAudit({
      action: 'ADMIN_CREATED_USER',
      module: 'USERS',
      req,
      targetId: user._id,
      targetType: 'User',
      details: { name: user.name, email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        jobTitle: user.jobTitle,
        isActive: user.isActive,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details or role
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { name, role, department, jobTitle, phone, location, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (jobTitle) user.jobTitle = jobTitle;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    await logAudit({
      action: 'USER_UPDATED',
      module: 'USERS',
      req,
      targetId: user._id,
      targetType: 'User',
      details: { email: user.email, role: user.role, isActive: user.isActive },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  getTechnicians,
  createUser,
  updateUser,
};
