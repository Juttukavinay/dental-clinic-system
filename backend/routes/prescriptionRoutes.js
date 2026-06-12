const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  downloadPrescriptionPDF,
} = require('../controllers/treatmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getPrescriptions)
  .post(authorize('Admin', 'Dentist'), createPrescription);

router.get('/:id/pdf', downloadPrescriptionPDF);

module.exports = router;
