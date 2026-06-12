const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  uploadPatientFile,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getPatients)
  .post(protect, authorize('Admin', 'Receptionist'), createPatient);

router.route('/:id')
  .get(protect, getPatientById)
  .put(protect, updatePatient)
  .delete(protect, authorize('Admin'), deletePatient);

router.post('/:id/upload', protect, upload.single('file'), uploadPatientFile);

module.exports = router;
