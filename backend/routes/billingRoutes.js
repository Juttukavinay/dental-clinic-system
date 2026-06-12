const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  payInvoice,
  downloadInvoicePDF,
  getBillingDashboard,
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(authorize('Admin', 'Accountant', 'Receptionist'), createInvoice)
  .get(getInvoices);

router.get('/dashboard', authorize('Admin', 'Accountant'), getBillingDashboard);
router.get('/:id/pdf', downloadInvoicePDF);

router.route('/:id')
  .get(getInvoiceById);

router.put('/:id/pay', authorize('Admin', 'Accountant', 'Receptionist'), payInvoice);

module.exports = router;
