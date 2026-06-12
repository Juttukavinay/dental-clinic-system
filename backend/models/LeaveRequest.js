const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please associate an employee'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please specify start date of leave'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please specify end date of leave'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for leave'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
