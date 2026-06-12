const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a patient name'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Please add a contact number'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please add a date of birth'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Please specify gender'],
    },
    address: {
      type: String,
      trim: true,
    },
    medicalHistory: {
      type: [String],
      default: [], // e.g. ["Diabetes", "Hypertension"]
    },
    dentalHistory: {
      type: [String],
      default: [], // e.g. ["Previous RCT", "Orthodontic braces"]
    },
    allergies: {
      type: [String],
      default: [], // e.g. ["Penicillin", "Latex"]
    },
    xrays: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
        title: { type: String, default: 'X-Ray' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reports: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
        title: { type: String, default: 'Lab Report' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate Patient ID (P-10001, etc.)
PatientSchema.pre('save', async function (next) {
  if (this.isNew && !this.patientId) {
    try {
      const Patient = mongoose.model('Patient', PatientSchema);
      const lastPatient = await Patient.findOne({}, {}, { sort: { createdAt: -1 } });
      let nextId = 10001;
      if (lastPatient && lastPatient.patientId) {
        const lastNum = parseInt(lastPatient.patientId.replace('P-', ''));
        if (!isNaN(lastNum)) {
          nextId = lastNum + 1;
        }
      }
      this.patientId = `P-${nextId}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Patient', PatientSchema);
