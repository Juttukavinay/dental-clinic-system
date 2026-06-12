const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please associate an employee'],
    },
    date: {
      type: Date,
      required: [true, 'Please specify attendance date'],
      default: Date.now,
    },
    checkIn: {
      type: String, // HH:MM
    },
    checkOut: {
      type: String, // HH:MM
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'On-Leave'],
      default: 'Present',
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index so an employee only has one attendance record per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: false });

module.exports = mongoose.model('Attendance', AttendanceSchema);
