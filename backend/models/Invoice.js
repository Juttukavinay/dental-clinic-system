const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please associate a patient'],
    },
    treatment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Treatment',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    items: [
      {
        description: {
          type: String,
          required: [true, 'Item description is required'],
          trim: true,
        },
        cost: {
          type: Number,
          required: [true, 'Cost is required'],
          min: 0,
        },
        gstPercent: {
          type: Number,
          required: true,
          default: 18, // standard GST rate for services
          min: 0,
        },
        amount: {
          type: Number,
          required: true,
          default: 0, // calculated: cost + (cost * gstPercent / 100)
        },
      },
    ],
    totalGst: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paidAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Paid', 'Partially-Paid', 'Unpaid'],
      default: 'Unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Insurance', 'Pending'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save calculations & invoice number generation
InvoiceSchema.pre('save', async function (next) {
  // 1. Calculate amount per item, total GST, total amount, and due amount
  let calculatedGst = 0;
  let calculatedTotal = 0;

  this.items.forEach((item) => {
    const itemGst = (item.cost * item.gstPercent) / 100;
    item.amount = item.cost + itemGst;
    calculatedGst += itemGst;
    calculatedTotal += item.amount;
  });

  this.totalGst = parseFloat(calculatedGst.toFixed(2));
  this.totalAmount = parseFloat(calculatedTotal.toFixed(2));
  this.dueAmount = parseFloat((this.totalAmount - this.paidAmount).toFixed(2));

  // 2. Set invoice status based on due amount
  if (this.dueAmount <= 0) {
    this.status = 'Paid';
    this.dueAmount = 0;
  } else if (this.paidAmount > 0) {
    this.status = 'Partially-Paid';
  } else {
    this.status = 'Unpaid';
  }

  // 3. Generate invoice number e.g. INV-2026-10001
  if (this.isNew && !this.invoiceNumber) {
    try {
      const Invoice = mongoose.model('Invoice', InvoiceSchema);
      const year = new Date().getFullYear();
      const lastInvoice = await Invoice.findOne(
        { invoiceNumber: new RegExp(`^INV-${year}-`) },
        {},
        { sort: { createdAt: -1 } }
      );

      let nextNum = 10001;
      if (lastInvoice && lastInvoice.invoiceNumber) {
        const parts = lastInvoice.invoiceNumber.split('-');
        const lastNum = parseInt(parts[2]);
        if (!isNaN(lastNum)) {
          nextNum = lastNum + 1;
        }
      }
      this.invoiceNumber = `INV-${year}-${nextNum}`;
    } catch (err) {
      return next(err);
    }
  }

  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
