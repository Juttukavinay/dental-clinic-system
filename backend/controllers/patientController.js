const Patient = require('../models/Patient');
const { uploadFile } = require('../middleware/uploadMiddleware');

// @desc    Get all patients (with search, filter, pagination)
// @route   GET /api/patients
// @access  Private (Admin, Dentist, Receptionist, Dental Assistant)
const getPatients = async (req, res, next) => {
  try {
    const { search, gender, page = 1, limit = 10 } = req.query;
    const query = {};

    // Fuzzy search on name, patientId, or contactNumber
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (gender) {
      query.gender = gender;
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: patients.length,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
      patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    res.status(200).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new patient
// @route   POST /api/patients
// @access  Private (Admin, Receptionist)
const createPatient = async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    res.status(200).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    await patient.deleteOne();

    res.status(200).json({ success: true, message: 'Patient record removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload patient file (X-Ray / Lab Report)
// @route   POST /api/patients/:id/upload
// @access  Private (Admin, Dentist, Receptionist, Dental Assistant)
const uploadPatientFile = async (req, res, next) => {
  const { type, title } = req.body; // type: 'xray' or 'report'

  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    // Call Cloudinary/Local upload utility
    const result = await uploadFile(req.file);

    const fileData = {
      url: result.url,
      public_id: result.public_id,
      title: title || (type === 'xray' ? 'X-Ray Scan' : 'Clinical Report'),
    };

    if (type === 'xray') {
      patient.xrays.push(fileData);
    } else {
      patient.reports.push(fileData);
    }

    await patient.save();

    res.status(200).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  uploadPatientFile,
};
