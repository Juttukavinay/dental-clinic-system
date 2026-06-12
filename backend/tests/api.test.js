const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('==================================================');
  console.log('   STARTING DENTAL SYSTEM INTEGRATION TESTS       ');
  console.log('==================================================');

  let adminToken = '';
  let patientId = '';
  let dentistId = '';
  let appointmentId = '';

  try {
    // 1. Authenticate as Admin
    console.log('TEST 1: Logging in as Admin...');
    const loginRes = await request('/auth/login', 'POST', {
      email: 'admin@apexdental.com',
      password: 'admin123',
    });
    
    if (loginRes.status === 200 && loginRes.body.success) {
      adminToken = loginRes.body.token;
      console.log('✅ Admin Login Successful.');
    } else {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes.body)}`);
    }

    // 2. Fetch staff list to get Jane's dentist ID
    console.log('\nTEST 2: Fetching dentist employees...');
    const staffRes = await request('/auth/staff', 'GET', null, adminToken);
    if (staffRes.status === 200 && staffRes.body.success) {
      const dentist = staffRes.body.staff.find((s) => s.role === 'Dentist');
      dentistId = dentist._id;
      console.log(`✅ Dentist found: Dr. ${dentist.name} (${dentistId})`);
    } else {
      throw new Error(`Failed to fetch staff roster: ${JSON.stringify(staffRes.body)}`);
    }

    // 3. Register a patient
    console.log('\nTEST 3: Registering a new Patient...');
    const patientRes = await request('/patients', 'POST', {
      name: 'Clark Kent',
      email: 'clark@dailyplanet.com',
      contactNumber: '555-9999',
      dateOfBirth: '1988-06-18',
      gender: 'Male',
      address: 'Metropolis',
      allergies: ['Kryptonite'],
    }, adminToken);

    if (patientRes.status === 201 && patientRes.body.success) {
      patientId = patientRes.body.patient._id;
      console.log(`✅ Patient registered: Clark Kent (Internal ID: ${patientId})`);
    } else {
      throw new Error(`Patient registration failed: ${JSON.stringify(patientRes.body)}`);
    }

    // 4. Book an appointment
    console.log('\nTEST 4: Booking an appointment with Doctor...');
    // Book for tomorrow at 2:00 PM (14:00)
    const bookingTime = new Date();
    bookingTime.setDate(bookingTime.getDate() + 1);
    bookingTime.setHours(14, 0, 0, 0);

    const apptRes = await request('/appointments', 'POST', {
      patient: patientId,
      dentist: dentistId,
      dateTime: bookingTime.toISOString(),
      reasonForVisit: 'Cavity checkup',
    }, adminToken);

    if (apptRes.status === 201 && apptRes.body.success) {
      appointmentId = apptRes.body.appointment._id;
      console.log(`✅ Appointment scheduled: ${apptRes.body.appointment.dateTime}`);
    } else {
      throw new Error(`Appointment booking failed: ${JSON.stringify(apptRes.body)}`);
    }

    // 5. Generate billing invoice
    console.log('\nTEST 5: Generating invoice for procedures...');
    const invoiceRes = await request('/billing', 'POST', {
      patient: patientId,
      items: [
        { description: 'Dental Cavity Filling', cost: 120, gstPercent: 18 },
        { description: 'Consultation Fee', cost: 50, gstPercent: 18 },
      ],
      paidAmount: 100,
      paymentMethod: 'UPI',
    }, adminToken);

    if (invoiceRes.status === 201 && invoiceRes.body.success) {
      console.log(`✅ Invoice generated: ${invoiceRes.body.invoice.invoiceNumber}`);
      console.log(`   Total cost: $${invoiceRes.body.invoice.totalAmount} | Balance: $${invoiceRes.body.invoice.dueAmount}`);
    } else {
      throw new Error(`Invoice generation failed: ${JSON.stringify(invoiceRes.body)}`);
    }

    // 6. Fetch reports dashboard
    console.log('\nTEST 6: Querying dashboard aggregate analytics...');
    const reportRes = await request('/billing/dashboard', 'GET', null, adminToken);
    if (reportRes.status === 200 && reportRes.body.success) {
      console.log(`✅ Revenue analytics retrieved.`);
      console.log(`   Revenue ledger summary: Gross Billings: $${reportRes.body.summary.totalRevenue} | Collected: $${reportRes.body.summary.totalCollected}`);
    } else {
      throw new Error(`Dashboard report aggregation failed: ${JSON.stringify(reportRes.body)}`);
    }

    console.log('\n==================================================');
    console.log('   🎉 ALL SYSTEM API TESTS COMPLETED SUCCESSFULLY!  ');
    console.log('==================================================');
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ TEST FAILURE: ${error.message}`);
    process.exit(1);
  }
};

runTests();
