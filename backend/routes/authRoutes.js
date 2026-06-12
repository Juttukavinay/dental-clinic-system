const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  getMe,
  getStaffList,
  logAttendance,
  getAttendance,
  applyLeave,
  getLeaves,
  updateLeaveStatus,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', protect, authorize('Admin'), registerUser);
router.get('/me', protect, getMe);
router.get('/staff', protect, getStaffList);

router.post('/attendance', protect, logAttendance);
router.get('/attendance', protect, getAttendance);

router.post('/leaves', protect, applyLeave);
router.get('/leaves', protect, getLeaves);
router.put('/leaves/:id', protect, authorize('Admin'), updateLeaveStatus);

module.exports = router;
