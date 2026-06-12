const express = require('express');
const router = express.Router();
const {
  createTreatment,
  getTreatments,
  getTreatmentById,
  updateTreatment,
} = require('../controllers/treatmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTreatments)
  .post(authorize('Admin', 'Dentist'), createTreatment);

router.route('/:id')
  .get(getTreatmentById)
  .put(authorize('Admin', 'Dentist'), updateTreatment);

module.exports = router;
