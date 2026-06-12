const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
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
    dateTime: {
      type: Date,
      required: [true, 'Please provide appointment date and time'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Checked-In', 'Checked-Out', 'Rescheduled', 'Cancelled'],
      default: 'Scheduled',
    },
    reasonForVisit: {
      type: String,
      required: [true, 'Please add a reason for the visit'],
      trim: true,
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

module.exports = mongoose.model('Appointment', AppointmentSchema);
