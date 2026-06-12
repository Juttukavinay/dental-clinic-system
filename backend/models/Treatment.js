const mongoose = require('mongoose');

const TreatmentSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      default: Date.now,
    },
    diagnosis: {
      type: String,
      required: [true, 'Please add a diagnosis description'],
      trim: true,
    },
    treatmentPlan: [
      {
        procedure: {
          type: String,
          enum: [
            'Root Canal',
            'Filling',
            'Scaling',
            'Crown',
            'Implant',
            'Extraction',
            'Braces',
            'Other',
          ],
          required: [true, 'Please select a procedure'],
        },
        cost: {
          type: Number,
          required: [true, 'Please enter procedure cost'],
          min: 0,
        },
        status: {
          type: String,
          enum: ['Planned', 'In-Progress', 'Completed'],
          default: 'Planned',
        },
      },
    ],
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    followUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Treatment', TreatmentSchema);
