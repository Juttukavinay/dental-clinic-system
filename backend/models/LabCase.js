const mongoose = require('mongoose');

const LabCaseSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please associate a patient'],
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please associate a dentist'],
    },
    labName: {
      type: String,
      required: [true, 'Please provide laboratory name'],
      trim: true,
    },
    workType: {
      type: String,
      enum: ['Crown', 'Bridge', 'Aligner', 'Denture', 'Implant', 'Other'],
      required: [true, 'Please specify fabrication work type'],
    },
    status: {
      type: String,
      enum: ['Sent', 'In-Progress', 'Delivered', 'Fitted'],
      default: 'Sent',
    },
    dispatchDate: {
      type: Date,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
      required: [true, 'Please provide expected delivery date'],
    },
    cost: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LabCase', LabCaseSchema);
