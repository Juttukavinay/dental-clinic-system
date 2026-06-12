const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Patient = require('../models/Patient');

// Helper: Check if a time is within dentist working hours
const isWithinWorkingHours = (dateTime, workingHours) => {
  const timeStr = new Date(dateTime).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC' // Standardizing time comparison
  });
  
  // Try extracting hours/minutes from localized string
  const dateObj = new Date(dateTime);
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const checkTime = `${hours}:${minutes}`;

  const start = workingHours?.start || '09:00';
  const end = workingHours?.end || '17:00';
  
  return checkTime >= start && checkTime <= end;
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Admin, Receptionist)
const bookAppointment = async (req, res, next) => {
  const { patient, dentist, dateTime, reasonForVisit, notes } = req.body;

  try {
    // 1. Verify dentist exists and is a Dentist role
    const dentistUser = await User.findById(dentist);
    if (!dentistUser || dentistUser.role !== 'Dentist') {
      return res.status(400).json({ success: false, error: 'Invalid dentist associated' });
    }

    // 2. Verify Patient exists
    const patientRecord = await Patient.findById(patient);
    if (!patientRecord) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // 3. Verify Dentist working hours
    if (!isWithinWorkingHours(dateTime, dentistUser.workingHours)) {
      return res.status(400).json({
        success: false,
        error: `Selected time is outside the doctor's working hours (${dentistUser.workingHours.start} - ${dentistUser.workingHours.end})`,
      });
    }

    // 4. Overlap check (Assuming each appointment slot is 30 minutes)
    const apptTime = new Date(dateTime);
    const startRange = new Date(apptTime.getTime() - 29 * 60 * 1000);
    const endRange = new Date(apptTime.getTime() + 29 * 60 * 1000);

    const overlapping = await Appointment.findOne({
      dentist,
      status: { $ne: 'Cancelled' },
      dateTime: { $gte: startRange, $lte: endRange },
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        error: 'Dentist already has an appointment booked within this time slot (30-min window overlap)',
      });
    }

    const appointment = await Appointment.create({
      patient,
      dentist,
      dateTime,
      reasonForVisit,
      notes,
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments list
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const { dentist, patient, startDate, endDate, status } = req.query;
    const query = {};

    // Filter by role limitations
    if (req.user.role === 'Dentist') {
      query.dentist = req.user.id;
    } else if (dentist) {
      query.dentist = dentist;
    }

    if (patient) {
      query.patient = patient;
    }

    if (status) {
      query.status = status;
    }

    // Filter by Date Range
    if (startDate || endDate) {
      query.dateTime = {};
      if (startDate) {
        query.dateTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.dateTime.$lte = new Date(endDate);
      }
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name patientId contactNumber')
      .populate('dentist', 'name specialization')
      .sort({ dateTime: 1 });

    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule an appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private (Admin, Receptionist)
const rescheduleAppointment = async (req, res, next) => {
  const { dateTime } = req.body;

  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Verify dentist working hours
    const dentistUser = await User.findById(appointment.dentist);
    if (!isWithinWorkingHours(dateTime, dentistUser.workingHours)) {
      return res.status(400).json({
        success: false,
        error: `Selected time is outside doctor working hours (${dentistUser.workingHours.start} - ${dentistUser.workingHours.end})`,
      });
    }

    // Overlap check
    const apptTime = new Date(dateTime);
    const startRange = new Date(apptTime.getTime() - 29 * 60 * 1000);
    const endRange = new Date(apptTime.getTime() + 29 * 60 * 1000);

    const overlapping = await Appointment.findOne({
      _id: { $ne: req.params.id },
      dentist: appointment.dentist,
      status: { $ne: 'Cancelled' },
      dateTime: { $gte: startRange, $lte: endRange },
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        error: 'Dentist already has another appointment booked in this slot',
      });
    }

    appointment.dateTime = dateTime;
    appointment.status = 'Rescheduled';
    await appointment.save();

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Check-In / Check-Out / Cancel)
// @route   PUT /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res, next) => {
  const { status } = req.body; // 'Checked-In', 'Checked-Out', 'Cancelled'

  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get metrics for reception & dentist dashboards
// @route   GET /api/appointments/stats
// @access  Private
const getAppointmentStats = async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  try {
    const todayQuery = {
      dateTime: { $gte: today, $lt: tomorrow },
    };

    if (req.user.role === 'Dentist') {
      todayQuery.dentist = req.user.id;
    }

    const todayAppointments = await Appointment.find(todayQuery)
      .populate('patient', 'name patientId')
      .populate('dentist', 'name')
      .sort({ dateTime: 1 });

    const stats = {
      todayCount: todayAppointments.length,
      scheduled: todayAppointments.filter((a) => a.status === 'Scheduled' || a.status === 'Rescheduled').length,
      checkedIn: todayAppointments.filter((a) => a.status === 'Checked-In').length,
      checkedOut: todayAppointments.filter((a) => a.status === 'Checked-Out').length,
      cancelled: todayAppointments.filter((a) => a.status === 'Cancelled').length,
      list: todayAppointments,
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  rescheduleAppointment,
  updateAppointmentStatus,
  getAppointmentStats,
};
