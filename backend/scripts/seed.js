const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Treatment = require('../models/Treatment');
const Prescription = require('../models/Prescription');
const Invoice = require('../models/Invoice');
const Supplier = require('../models/Supplier');
const Inventory = require('../models/Inventory');
const Attendance = require('../models/Attendance');

dotenv.config();

const usersData = [
  {
    name: 'Dr. Jane Miller',
    email: 'doctor.jane@apexdental.com',
    password: 'doctor123',
    role: 'Dentist',
    contactNumber: '555-0101',
    specialization: 'Orthodontist',
    workingHours: { start: '09:00', end: '17:00' },
  },
  {
    name: 'Dr. Bob Vance',
    email: 'doctor.bob@apexdental.com',
    password: 'doctor123',
    role: 'Dentist',
    contactNumber: '555-0102',
    specialization: 'Endodontist',
    workingHours: { start: '10:00', end: '18:00' },
  },
  {
    name: 'Sarah Connor',
    email: 'admin@apexdental.com',
    password: 'admin123',
    role: 'Admin',
    contactNumber: '555-0100',
  },
  {
    name: 'Pam Beesly',
    email: 'reception@apexdental.com',
    password: 'reception123',
    role: 'Receptionist',
    contactNumber: '555-0103',
  },
  {
    name: 'Oscar Martinez',
    email: 'finance@apexdental.com',
    password: 'finance123',
    role: 'Accountant',
    contactNumber: '555-0104',
  },
  {
    name: 'Dwight Schrute',
    email: 'assistant@apexdental.com',
    password: 'assistant123',
    role: 'Dental Assistant',
    contactNumber: '555-0105',
  },
];

const patientsData = [
  {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    contactNumber: '555-0201',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'Male',
    address: '123 Elm St, Scranton, PA',
    medicalHistory: ['Hypertension'],
    dentalHistory: ['Filling on tooth 14', 'Scaling done 6 months ago'],
    allergies: ['Penicillin'],
  },
  {
    name: 'Mary Jane',
    email: 'mary.jane@yahoo.com',
    contactNumber: '555-0202',
    dateOfBirth: new Date('1985-08-22'),
    gender: 'Female',
    address: '456 Oak Ave, Scranton, PA',
    medicalHistory: [],
    dentalHistory: ['Root Canal Treatment (RCT) on tooth 19'],
    allergies: [],
  },
  {
    name: 'Peter Parker',
    email: 'peter.parker@gmail.com',
    contactNumber: '555-0203',
    dateOfBirth: new Date('2001-11-03'),
    gender: 'Male',
    address: '20 Ingram St, Forest Hills, NY',
    medicalHistory: ['Asthma'],
    dentalHistory: ['Wisdom tooth extraction done'],
    allergies: ['Latex'],
  },
  {
    name: 'Bruce Wayne',
    email: 'bruce.wayne@waynecorp.com',
    contactNumber: '555-0204',
    dateOfBirth: new Date('1978-02-19'),
    gender: 'Male',
    address: '1007 Mountain Drive, Gotham City',
    medicalHistory: ['Frequent fractures'],
    dentalHistory: ['Crown replacement on tooth 8'],
    allergies: [],
  },
];

const suppliersData = [
  {
    name: 'Dental Care Supplies Corp',
    contactPerson: 'David Wallace',
    email: 'sales@dentalcare.com',
    contactNumber: '800-555-0199',
    address: '100 Supply Road, Philadelphia, PA',
  },
  {
    name: 'MediDrug Pharmaceuticals',
    contactPerson: 'Angela Martin',
    email: 'orders@medidrug.com',
    contactNumber: '800-555-0200',
    address: '25 Pharma Lane, New York, NY',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dental_clinic_system');
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Patient.deleteMany();
    await Appointment.deleteMany();
    await Treatment.deleteMany();
    await Prescription.deleteMany();
    await Invoice.deleteMany();
    await Supplier.deleteMany();
    await Inventory.deleteMany();
    await Attendance.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Seed Staff Users (Hash passwords automatically via User Pre-Save Hook)
    const users = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      users.push(user);
    }
    console.log(`Seeded ${users.length} staff members.`);

    const dentist1 = users.find((u) => u.name === 'Dr. Jane Miller');
    const dentist2 = users.find((u) => u.name === 'Dr. Bob Vance');
    const receptionist = users.find((u) => u.role === 'Receptionist');

    // 2. Seed Patients
    const patients = [];
    for (const p of patientsData) {
      const patient = new Patient(p);
      await patient.save();
      patients.push(patient);
    }
    console.log(`Seeded ${patients.length} patients.`);

    // 3. Seed Suppliers
    const suppliers = await Supplier.create(suppliersData);
    console.log(`Seeded ${suppliers.length} suppliers.`);

    // 4. Seed Inventory Items
    const inventoryData = [
      {
        itemName: 'Amoxicillin 500mg capsules',
        type: 'Medicine',
        quantity: 120,
        unit: 'Box',
        minQuantityAlert: 20,
        expiryDate: new Date('2028-12-01'),
        supplier: suppliers[1]._id,
        supplierContact: suppliers[1].contactNumber,
      },
      {
        itemName: 'Dental Composite Filling Syringe',
        type: 'Dental Material',
        quantity: 4, // Low stock!
        unit: 'Piece',
        minQuantityAlert: 10,
        expiryDate: new Date('2027-06-15'),
        supplier: suppliers[0]._id,
        supplierContact: suppliers[0].contactNumber,
      },
      {
        itemName: 'Lidocaine 2% Anesthetic Cartridges',
        type: 'Medicine',
        quantity: 80,
        unit: 'Vial',
        minQuantityAlert: 30,
        expiryDate: new Date('2028-01-10'),
        supplier: suppliers[1]._id,
        supplierContact: suppliers[1].contactNumber,
      },
      {
        itemName: 'Orthodontic Brackets Set',
        type: 'Dental Material',
        quantity: 15,
        unit: 'Box',
        minQuantityAlert: 5,
        expiryDate: null,
        supplier: suppliers[0]._id,
        supplierContact: suppliers[0].contactNumber,
      },
    ];
    await Inventory.create(inventoryData);
    console.log('Seeded Inventory.');

    // 5. Seed Attendance Logs
    const attendanceLogs = [
      { employee: dentist1._id, date: new Date('2026-06-10'), checkIn: '08:55', checkOut: '17:05', status: 'Present' },
      { employee: dentist2._id, date: new Date('2026-06-10'), checkIn: '10:05', checkOut: '18:00', status: 'Late' },
      { employee: receptionist._id, date: new Date('2026-06-10'), checkIn: '08:50', checkOut: '17:00', status: 'Present' },
      { employee: dentist1._id, date: new Date('2026-06-11'), checkIn: '08:58', checkOut: '17:00', status: 'Present' },
      { employee: receptionist._id, date: new Date('2026-06-11'), checkIn: '08:45', checkOut: '17:05', status: 'Present' },
    ];
    await Attendance.create(attendanceLogs);
    console.log('Seeded Staff Attendance.');

    // 6. Seed Appointments
    const today = new Date();
    today.setHours(9, 30, 0, 0);
    const apptTodayJane = new Date(today); // Today at 09:30 AM
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    const apptTomBob = new Date(tomorrow); // Tomorrow at 11:00 AM

    const appointmentsData = [
      {
        patient: patients[0]._id,
        dentist: dentist1._id,
        dateTime: apptTodayJane,
        status: 'Scheduled',
        reasonForVisit: 'Orthodontic check-up & wire tighten',
        notes: 'Patient requested late morning schedule',
      },
      {
        patient: patients[1]._id,
        dentist: dentist2._id,
        dateTime: apptTomBob,
        status: 'Scheduled',
        reasonForVisit: 'RCT follow-up pain inspection',
      },
      {
        patient: patients[2]._id,
        dentist: dentist1._id,
        dateTime: new Date(new Date().setHours(14, 0, 0, 0)), // Today at 02:00 PM
        status: 'Checked-In',
        reasonForVisit: 'Deep scaling & cleaning',
      },
    ];
    const appointments = await Appointment.create(appointmentsData);
    console.log('Seeded Appointments.');

    // 7. Seed Treatments
    const treatment1 = await Treatment.create({
      patient: patients[0]._id,
      dentist: dentist1._id,
      date: new Date('2026-06-08'),
      diagnosis: 'Mild dental plaque & malocclusion of teeth',
      treatmentPlan: [
        { procedure: 'Scaling', cost: 150, status: 'Completed' },
        { procedure: 'Braces', cost: 1200, status: 'In-Progress' },
      ],
      notes: 'Initial braces fitting done. Regular adjustments scheduled.',
    });

    const treatment2 = await Treatment.create({
      patient: patients[1]._id,
      dentist: dentist2._id,
      date: new Date('2026-06-09'),
      diagnosis: 'Severe pulpitis in mandibular first molar (tooth 19)',
      treatmentPlan: [
        { procedure: 'Root Canal', cost: 450, status: 'Completed' },
        { procedure: 'Crown', cost: 300, status: 'Planned' },
      ],
      notes: 'RCT completed. Scheduled for crown fitting in two weeks.',
    });
    console.log('Seeded Treatments.');

    // 8. Seed Prescriptions
    await Prescription.create({
      patient: patients[1]._id,
      dentist: dentist2._id,
      treatment: treatment2._id,
      date: new Date('2026-06-09'),
      medicines: [
        { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Three times daily (TDS)', duration: '5 Days', instructions: 'Take after meals' },
        { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'Twice daily (BD) - if pain persists', duration: '3 Days', instructions: 'Take after meals' },
      ],
      notes: 'Apply cold compress if minor swelling occurs.',
    });
    console.log('Seeded Prescriptions.');

    // 9. Seed Invoices
    const invoice1 = new Invoice({
      patient: patients[0]._id,
      treatment: treatment1._id,
      date: new Date('2026-06-08'),
      items: [
        { description: 'Dental Scaling and polishing fee', cost: 150, gstPercent: 18 },
        { description: 'Orthodontic Brackets installation advance', cost: 1200, gstPercent: 18 },
      ],
      paidAmount: 500, // partially paid, balance due!
      paymentMethod: 'UPI',
    });
    await invoice1.save();

    const invoice2 = new Invoice({
      patient: patients[1]._id,
      treatment: treatment2._id,
      date: new Date('2026-06-09'),
      items: [
        { description: 'Root Canal Treatment (Molar) Procedure', cost: 450, gstPercent: 18 },
      ],
      paidAmount: 531, // fully paid including GST
      paymentMethod: 'Card',
    });
    await invoice2.save();
    console.log('Seeded Invoices.');

    console.log('--- DATABASE SEEDING COMPLETED SUCCESSFULY ---');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
