const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  rescheduleAppointment,
  updateAppointmentStatus,
  getAppointmentStats,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(bookAppointment)
  .get(getAppointments);

router.get('/stats', getAppointmentStats);
router.put('/:id/reschedule', rescheduleAppointment);
router.put('/:id/status', updateAppointmentStatus);

module.exports = router;
