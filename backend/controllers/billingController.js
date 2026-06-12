const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

// @desc    Generate a new patient invoice
// @route   POST /api/billing
// @access  Private (Admin, Accountant, Receptionist)
const createInvoice = async (req, res, next) => {
  const { patient, treatment, items, paidAmount, paymentMethod } = req.body;

  try {
    // Verify patient exists
    const patientRecord = await Patient.findById(patient);
    if (!patientRecord) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const invoice = await Invoice.create({
      patient,
      treatment,
      items,
      paidAmount: paidAmount || 0,
      paymentMethod: paymentMethod || 'Pending',
    });

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoices list
// @route   GET /api/billing
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    const { status, patient } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (patient) {
      query.patient = patient;
    }

    const invoices = await Invoice.find(query)
      .populate('patient', 'name patientId contactNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice
// @route   GET /api/billing/:id
// @access  Private
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'name patientId contactNumber address')
      .populate('treatment', 'diagnosis date');

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    res.status(200).json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay or update due invoice balance
// @route   PUT /api/billing/:id/pay
// @access  Private (Admin, Accountant, Receptionist)
const payInvoice = async (req, res, next) => {
  const { amountPaid, paymentMethod } = req.body;

  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    invoice.paidAmount += Number(amountPaid);
    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    await invoice.save(); // Saves and triggers pre-save due calculations hook

    res.status(200).json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Download billing invoice PDF
// @route   GET /api/billing/:id/pdf
// @access  Private
const downloadInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'name patientId contactNumber address')
      .populate('treatment', 'diagnosis date');

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`
    );

    generateInvoicePDF(invoice, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard financial summaries
// @route   GET /api/billing/dashboard
// @access  Private (Admin, Accountant)
const getBillingDashboard = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({});
    
    let totalRevenue = 0;
    let totalCollected = 0;
    let totalPending = 0;
    
    invoices.forEach((inv) => {
      totalRevenue += inv.totalAmount;
      totalCollected += inv.paidAmount;
      totalPending += inv.dueAmount;
    });

    // Payment distribution
    const paymentsGrouped = await Invoice.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$paidAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCollected: parseFloat(totalCollected.toFixed(2)),
        totalPending: parseFloat(totalPending.toFixed(2)),
        invoiceCount: invoices.length,
      },
      paymentDistribution: paymentsGrouped,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  payInvoice,
  downloadInvoicePDF,
  getBillingDashboard,
};
