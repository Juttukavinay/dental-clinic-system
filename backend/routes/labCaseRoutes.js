const express = require('express');
const router = express.Router();
const {
  createLabCase,
  getLabCases,
  updateLabCase,
  getLabCaseAlerts,
} = require('../controllers/labCaseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getLabCases)
  .post(authorize('Admin', 'Dentist', 'Dental Assistant'), createLabCase);

router.get('/alerts', getLabCaseAlerts);

router.route('/:id')
  .put(authorize('Admin', 'Dentist', 'Dental Assistant'), updateLabCase);

module.exports = router;
