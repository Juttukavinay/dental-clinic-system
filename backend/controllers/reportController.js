const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const Treatment = require('../models/Treatment');
const Attendance = require('../models/Attendance');

// @desc    Get aggregated financial reports
// @route   GET /api/reports/revenue
// @access  Private (Admin, Accountant)
const getRevenueReport = async (req, res, next) => {
  try {
    const monthlyRevenue = await Invoice.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          revenue: { $sum: '$totalAmount' },
          collected: { $sum: '$paidAmount' },
          outstanding: { $sum: '$dueAmount' },
          invoicesCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const paymentMethods = await Invoice.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          amount: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    res.status(200).json({ success: true, monthlyRevenue, paymentMethods });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated patient demographic reports
// @route   GET /api/reports/patients
// @access  Private (Admin, Receptionist)
const getPatientReport = async (req, res, next) => {
  try {
    const demographics = await Patient.aggregate([
      {
        $facet: {
          genderDistribution: [
            { $group: { _id: '$gender', count: { $sum: 1 } } },
          ],
          ageBuckets: [
            {
              $project: {
                age: {
                  $floor: {
                    $divide: [
                      { $subtract: [new Date(), '$dateOfBirth'] },
                      365.25 * 24 * 60 * 60 * 1000,
                    ],
                  },
                },
              },
            },
            {
              $bucket: {
                groupBy: '$age',
                boundaries: [0, 13, 20, 35, 55, 100],
                default: 'Seniors',
                output: { count: { $sum: 1 } },
              },
            },
          ],
          registrationsByMonth: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    res.status(200).json({ success: true, demographics: demographics[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated clinical treatment reports
// @route   GET /api/reports/treatments
// @access  Private (Admin, Dentist)
const getTreatmentReport = async (req, res, next) => {
  try {
    const procedureStats = await Treatment.aggregate([
      { $unwind: '$treatmentPlan' },
      {
        $group: {
          _id: '$treatmentPlan.procedure',
          count: { $sum: 1 },
          revenue: { $sum: '$treatmentPlan.cost' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({ success: true, procedureStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated staff performance & attendance reports
// @route   GET /api/reports/staff
// @access  Private (Admin only)
const getStaffReport = async (req, res, next) => {
  try {
    const attendanceSummary = await Attendance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const activeStaff = await Attendance.aggregate([
      {
        $group: {
          _id: '$employee',
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
          lateCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] },
          },
          leaveCount: {
            $sum: { $cond: [{ $eq: ['$status', 'On-Leave'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users', // links with Mongoose collection 'users'
          localField: '_id',
          foreignField: '_id',
          as: 'staffDetails',
        },
      },
      { $unwind: '$staffDetails' },
      {
        $project: {
          'staffDetails.name': 1,
          'staffDetails.role': 1,
          presentCount: 1,
          lateCount: 1,
          leaveCount: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, attendanceSummary, activeStaff });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRevenueReport,
  getPatientReport,
  getTreatmentReport,
  getStaffReport,
};
