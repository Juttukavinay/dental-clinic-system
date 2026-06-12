const express = require('express');
const router = express.Router();
const {
  getRevenueReport,
  getPatientReport,
  getTreatmentReport,
  getStaffReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/revenue', authorize('Admin', 'Accountant'), getRevenueReport);
router.get('/patients', authorize('Admin', 'Receptionist'), getPatientReport);
router.get('/treatments', authorize('Admin', 'Dentist'), getTreatmentReport);
router.get('/staff', authorize('Admin'), getStaffReport);

module.exports = router;
