const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyfordentalclinic123', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Your account is deactivated' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
        specialization: user.specialization,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new staff user (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res, next) => {
  const { name, email, password, role, contactNumber, specialization, workingHours } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      contactNumber,
      specialization,
      workingHours,
    });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff/employees list
// @route   GET /api/auth/staff
// @access  Private (Admin, Receptionist, Dentist)
const getStaffList = async (req, res, next) => {
  try {
    const staff = await User.find({}).sort({ role: 1, name: 1 });
    res.status(200).json({ success: true, count: staff.length, staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Log employee attendance (Check-in / Check-out)
// @route   POST /api/auth/attendance
// @access  Private
const logAttendance = async (req, res, next) => {
  const { time, type } = req.body; // type: 'checkIn' or 'checkOut'
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    let attendance = await Attendance.findOne({
      employee: req.user.id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (!attendance) {
      if (type === 'checkOut') {
        return res.status(400).json({ success: false, error: 'Must check in first before checking out' });
      }
      
      // Determine status (Late if checkIn is after working hours start)
      const user = await User.findById(req.user.id);
      const startTime = user?.workingHours?.start || '09:00';
      const isLate = time > startTime;

      attendance = await Attendance.create({
        employee: req.user.id,
        date: new Date(),
        checkIn: time,
        status: isLate ? 'Late' : 'Present',
      });
    } else {
      if (type === 'checkIn') {
        return res.status(400).json({ success: false, error: 'Already checked in today' });
      }
      attendance.checkOut = time;
      await attendance.save();
    }

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records
// @route   GET /api/auth/attendance
// @access  Private
const getAttendance = async (req, res, next) => {
  try {
    let query = {};
    // If not Admin/Receptionist, can only view self attendance
    if (req.user.role !== 'Admin' && req.user.role !== 'Receptionist') {
      query.employee = req.user.id;
    }
    
    const records = await Attendance.find(query)
      .populate('employee', 'name role email')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for leave request
// @route   POST /api/auth/leaves
// @access  Private
const applyLeave = async (req, res, next) => {
  const { startDate, endDate, reason } = req.body;

  try {
    const leave = await LeaveRequest.create({
      employee: req.user.id,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({ success: true, leave });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave requests
// @route   GET /api/auth/leaves
// @access  Private
const getLeaves = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'Admin') {
      query.employee = req.user.id;
    }

    const leaves = await LeaveRequest.find(query)
      .populate('employee', 'name role email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject Leave (Admin only)
// @route   PUT /api/auth/leaves/:id
// @access  Private/Admin
const updateLeaveStatus = async (req, res, next) => {
  const { status } = req.body; // Approved or Rejected

  try {
    let leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    leave.status = status;
    await leave.save();

    // If approved, optionally log as On-Leave in attendance for that duration
    if (status === 'Approved') {
      let current = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      while (current <= end) {
        await Attendance.findOneAndUpdate(
          { employee: leave.employee, date: new Date(current.setHours(0,0,0,0)) },
          { status: 'On-Leave' },
          { upsert: true, new: true }
        );
        current.setDate(current.getDate() + 1);
      }
    }

    res.status(200).json({ success: true, leave });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  registerUser,
  getMe,
  getStaffList,
  logAttendance,
  getAttendance,
  applyLeave,
  getLeaves,
  updateLeaveStatus,
};
