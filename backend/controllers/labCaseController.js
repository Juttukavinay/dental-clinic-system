const LabCase = require('../models/LabCase');
const Patient = require('../models/Patient');

// @desc    Log a new lab case fabrication
// @route   POST /api/labcases
// @access  Private (Admin, Dentist, Dental Assistant)
const createLabCase = async (req, res, next) => {
  const { patient, labName, workType, expectedDeliveryDate, cost, notes } = req.body;

  try {
    const patientRecord = await Patient.findById(patient);
    if (!patientRecord) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const labcase = await LabCase.create({
      patient,
      dentist: req.user.id, // logged in doctor
      labName,
      workType,
      expectedDeliveryDate,
      cost: cost || 0,
      notes,
    });

    res.status(201).json({ success: true, labcase });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all lab cases
// @route   GET /api/labcases
// @access  Private
const getLabCases = async (req, res, next) => {
  try {
    const { status, patient } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (patient) {
      query.patient = patient;
    }

    // Limit Dentist to see only their dispatches
    if (req.user.role === 'Dentist') {
      query.dentist = req.user.id;
    }

    const labcases = await LabCase.find(query)
      .populate('patient', 'name patientId contactNumber')
      .populate('dentist', 'name specialization')
      .sort({ expectedDeliveryDate: 1 });

    res.status(200).json({ success: true, count: labcases.length, labcases });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lab case status/details
// @route   PUT /api/labcases/:id
// @access  Private (Admin, Dentist, Dental Assistant)
const updateLabCase = async (req, res, next) => {
  try {
    const labcase = await LabCase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!labcase) {
      return res.status(404).json({ success: false, error: 'Lab case not found' });
    }

    res.status(200).json({ success: true, labcase });
  } catch (error) {
    next(error);
  }
};

// @desc    Get urgent pending lab case delivery alerts
// @route   GET /api/labcases/alerts
// @access  Private
const getLabCaseAlerts = async (req, res, next) => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  try {
    const query = {
      status: { $in: ['Sent', 'In-Progress'] },
      expectedDeliveryDate: { $lte: threeDaysFromNow },
    };

    if (req.user.role === 'Dentist') {
      query.dentist = req.user.id;
    }

    const alerts = await LabCase.find(query)
      .populate('patient', 'name patientId')
      .populate('dentist', 'name')
      .sort({ expectedDeliveryDate: 1 });

    res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLabCase,
  getLabCases,
  updateLabCase,
  getLabCaseAlerts,
};
