const express = require('express');
const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  createInventoryItem,
  getInventory,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getInventory)
  .post(authorize('Admin', 'Dental Assistant'), createInventoryItem);

router.route('/suppliers')
  .get(getSuppliers)
  .post(authorize('Admin', 'Dental Assistant', 'Accountant'), createSupplier);

router.route('/:id')
  .put(authorize('Admin', 'Dental Assistant'), updateInventoryItem)
  .delete(authorize('Admin'), deleteInventoryItem);

module.exports = router;
