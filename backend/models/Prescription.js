const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema(
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
    treatment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Treatment',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    medicines: [
      {
        name: {
          type: String,
          required: [true, 'Medicine name is required'],
          trim: true,
        },
        dosage: {
          type: String,
          required: [true, 'Dosage is required (e.g., 500mg, 1 tablet)'],
          trim: true,
        },
        frequency: {
          type: String,
          required: [true, 'Frequency is required (e.g., Once daily, Twice daily, TDS)'],
          trim: true,
        },
        duration: {
          type: String,
          required: [true, 'Duration is required (e.g., 5 days, 1 week)'],
          trim: true,
        },
        instructions: {
          type: String,
          trim: true,
          default: 'Take after meals',
        },
      },
    ],
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

module.exports = mongoose.model('Prescription', PrescriptionSchema);
