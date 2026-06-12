const Treatment = require('../models/Treatment');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const { generatePrescriptionPDF } = require('../utils/pdfGenerator');

// ==========================================
// TREATMENT CONTROLLERS
// ==========================================

// @desc    Record patient diagnosis & treatment plan
// @route   POST /api/treatments
// @access  Private (Admin, Dentist)
const createTreatment = async (req, res, next) => {
  const { patient, date, diagnosis, treatmentPlan, notes, followUpDate } = req.body;

  try {
    const treatment = await Treatment.create({
      patient,
      dentist: req.user.id, // Dentist from token
      date,
      diagnosis,
      treatmentPlan,
      notes,
      followUpDate,
    });

    res.status(201).json({ success: true, treatment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get treatments list
// @route   GET /api/treatments
// @access  Private
const getTreatments = async (req, res, next) => {
  try {
    const { patient, dentist } = req.query;
    const query = {};

    if (req.user.role === 'Dentist') {
      query.dentist = req.user.id;
    } else if (dentist) {
      query.dentist = dentist;
    }

    if (patient) {
      query.patient = patient;
    }

    const treatments = await Treatment.find(query)
      .populate('patient', 'name patientId')
      .populate('dentist', 'name specialization')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: treatments.length, treatments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single treatment record
// @route   GET /api/treatments/:id
// @access  Private
const getTreatmentById = async (req, res, next) => {
  try {
    const treatment = await Treatment.findById(req.params.id)
      .populate('patient', 'name patientId')
      .populate('dentist', 'name');

    if (!treatment) {
      return res.status(404).json({ success: false, error: 'Treatment record not found' });
    }

    res.status(200).json({ success: true, treatment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update treatment procedures/status
// @route   PUT /api/treatments/:id
// @access  Private (Admin, Dentist)
const updateTreatment = async (req, res, next) => {
  try {
    const treatment = await Treatment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!treatment) {
      return res.status(404).json({ success: false, error: 'Treatment record not found' });
    }

    res.status(200).json({ success: true, treatment });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PRESCRIPTION CONTROLLERS
// ==========================================

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Admin, Dentist)
const createPrescription = async (req, res, next) => {
  const { patient, treatment, date, medicines, notes } = req.body;

  try {
    const prescription = await Prescription.create({
      patient,
      dentist: req.user.id,
      treatment,
      date,
      medicines,
      notes,
    });

    res.status(201).json({ success: true, prescription });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescriptions list
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res, next) => {
  try {
    const { patient } = req.query;
    const query = {};

    if (req.user.role === 'Dentist') {
      query.dentist = req.user.id;
    }

    if (patient) {
      query.patient = patient;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name patientId dateOfBirth gender')
      .populate('dentist', 'name specialization email')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: prescriptions.length, prescriptions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescription PDF
// @route   GET /api/prescriptions/:id/pdf
// @access  Private
const downloadPrescriptionPDF = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name patientId dateOfBirth gender')
      .populate('dentist', 'name specialization email');

    if (!prescription) {
      return res.status(404).json({ success: false, error: 'Prescription not found' });
    }

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=prescription_${prescription.patient.patientId}.pdf`
    );

    // Call PDFkit helper
    generatePrescriptionPDF(prescription, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTreatment,
  getTreatments,
  getTreatmentById,
  updateTreatment,
  createPrescription,
  getPrescriptions,
  downloadPrescriptionPDF,
};
