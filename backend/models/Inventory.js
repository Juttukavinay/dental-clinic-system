const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Please add an item name'],
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['Medicine', 'Dental Material'],
      required: [true, 'Please specify inventory type'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please enter quantity'],
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Please specify the unit (e.g. Box, Piece, Vial, Tablet)'],
      trim: true,
    },
    minQuantityAlert: {
      type: Number,
      required: [true, 'Please enter minimum quantity threshold for stock alert'],
      min: 0,
      default: 5,
    },
    expiryDate: {
      type: Date,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    supplierContact: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inventory', InventorySchema);
