const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');

// ==========================================
// SUPPLIER CONTROLLERS
// ==========================================

// @desc    Add a supplier
// @route   POST /api/inventory/suppliers
// @access  Private (Admin, Dental Assistant, Accountant)
const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, supplier });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all suppliers
// @route   GET /api/inventory/suppliers
// @access  Private
const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, count: suppliers.length, suppliers });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// INVENTORY CONTROLLERS
// ==========================================

// @desc    Add new item to inventory
// @route   POST /api/inventory
// @access  Private (Admin, Dental Assistant)
const createInventoryItem = async (req, res, next) => {
  const { itemName, type, quantity, unit, minQuantityAlert, expiryDate, supplier, supplierContact } = req.body;

  try {
    const item = await Inventory.create({
      itemName,
      type,
      quantity,
      unit,
      minQuantityAlert,
      expiryDate,
      supplier,
      supplierContact,
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory items
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res, next) => {
  try {
    const { type, lowStock } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    const items = await Inventory.find(query)
      .populate('supplier', 'name contactPerson email contactNumber')
      .sort({ itemName: 1 });

    // Filter low stock programmatically if requested
    let result = items;
    if (lowStock === 'true') {
      result = items.filter((item) => item.quantity <= item.minQuantityAlert);
    }

    res.status(200).json({
      success: true,
      count: result.length,
      alertsCount: items.filter((item) => item.quantity <= item.minQuantityAlert).length,
      inventory: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock/details of an inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Admin, Dental Assistant)
const updateInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    res.status(200).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin only)
const deleteInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    await item.deleteOne();

    res.status(200).json({ success: true, message: 'Item removed from inventory' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  createInventoryItem,
  getInventory,
  updateInventoryItem,
  deleteInventoryItem,
};
