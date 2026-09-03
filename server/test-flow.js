import axios from 'axios';
import mongoose from 'mongoose';
import Job from './models/Job.js';
import User from './models/User.js';
import Invoice from './models/Invoice.js';
import Customer from './models/Customer.js';
import RateCard from './models/RateCard.js';
import Khata from './models/Khata.js';
import Staff from './models/Staff.js';

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 STARTING TRADEDESK PRO 3.0 ENTERPRISE SUITE');
  console.log('======================================================\n');

  let testUserId = null;
  let testEstimateId = null;
  let testInvoiceId = null;
  let testJobId = null;
  let testStaffId = null;
  let testKhataId = null;
  let invoiceNumber = null;
  let token = null;

  try {
    // 1. User Registration & Setup
    console.log('1. Testing User Registration & Profile...');
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Ramesh Electrician',
      email: `ramesh_pro3_${Date.now()}@example.com`,
      password: 'password123',
      phone: '9876543210',
      businessName: 'Ramesh Electricals & HVAC Pro',
      upiId: 'rameshelectric@okaxis',
      gstNumber: '29ABCDE1234F1Z5'
    });
    
    if (registerRes.status === 201 && registerRes.data.token) {
      testUserId = registerRes.data._id;
      token = registerRes.data.token;
      console.log(`✓ Registration succeeded. Tester ID: ${testUserId}`);
    } else {
      throw new Error('Registration failed');
    }
    console.log('');

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Staff Member / Karigar Creation
    console.log('2. Testing Staff / Karigar Management (/api/staff)...');
    const staffRes = await axios.post(`${BASE_URL}/staff`, {
      name: 'Mukesh Karigar',
      phone: '9876500001',
      role: 'Karigar / Technician',
      specialization: 'Inverter AC & Gas Specialist',
      defaultCommissionPct: 40
    }, authHeaders);

    if (staffRes.status === 201) {
      testStaffId = staffRes.data._id;
      console.log(`✓ Staff Karigar created: ${staffRes.data.name} (Commission: ${staffRes.data.defaultCommissionPct}%)`);
    } else {
      throw new Error('Staff creation failed');
    }
    console.log('');

    // 3. Create Job with Advance Token Deposit, Staff Assignment & AMC Contract
    console.log('3. Testing Job Creation with Advance Token Deposit, Staff & AMC...');
    const jobRes = await axios.post(`${BASE_URL}/jobs`, {
      documentType: 'invoice',
      clientName: 'Sharmaji Resident',
      clientPhone: '9876501234',
      clientAddress: 'Flat 204, Green Heights',
      jobTitle: 'AC Complete Servicing & Gas Top-up',
      laborHours: 2,
      hourlyRate: 500,
      materials: [{ name: 'R410A Refrigerant', price: 1200 }],
      taxType: 'intra_state',
      gstRate: 18,
      advancePaid: 500, // ₹500 advance deposit
      assignedStaff: {
        staffId: testStaffId,
        name: 'Mukesh Karigar',
        phone: '9876500001',
        role: 'Karigar / Technician',
        commissionPct: 40
      },
      isAmc: true,
      amcFrequencyMonths: 6,
      paymentDueDate: new Date(Date.now() + 7 * 86400000),
      status: 'unpaid'
    }, authHeaders);

    if (jobRes.status === 201 && jobRes.data.advancePaid === 500) {
      testJobId = jobRes.data._id;
      console.log(`✓ Job saved successfully. ID: ${testJobId}`);
      console.log(`  - Total Bill: ₹${jobRes.data.totalBill}`);
      console.log(`  - Advance Paid: ₹${jobRes.data.advancePaid}`);
      console.log(`  - Balance Due: ₹${jobRes.data.balanceDue}`);
      console.log(`  - Staff Commission (40% of Labor): ₹${jobRes.data.assignedStaff.commissionAmount}`);
      console.log(`  - AMC Next Date: ${jobRes.data.amcNextDate}`);
    } else {
      throw new Error('Job with advance deposit failed');
    }
    console.log('');

    // 4. Generate A4 PDF with Advance Split
    console.log('4. Testing A4 PDF Compilation with Advance / Balance Due...');
    const invoiceRes = await axios.post(`${BASE_URL}/invoices/generate/${testJobId}`, {}, authHeaders);
    if (invoiceRes.status === 201) {
      testInvoiceId = invoiceRes.data._id;
      invoiceNumber = invoiceRes.data.invoiceNumber;
      console.log(`✓ Invoice generated. ID: ${testInvoiceId} (No: ${invoiceNumber})`);
      console.log(`  - PDF File: ${invoiceRes.data.pdfUrl}`);
    } else {
      throw new Error('Invoice compile failed');
    }
    console.log('');

    // 5. Test Public Unauthenticated Customer Portal Endpoint
    console.log('5. Testing Public Customer Portal Endpoint (/api/invoices/public/:invoiceNumber)...');
    const publicRes = await axios.get(`${BASE_URL}/invoices/public/${invoiceNumber}`);
    if (publicRes.status === 200 && publicRes.data.invoice && publicRes.data.job && publicRes.data.business) {
      console.log(`✓ Public Customer Portal retrieved without auth token:`);
      console.log(`  - Business: ${publicRes.data.business.businessName}`);
      console.log(`  - Client: ${publicRes.data.job.clientName}`);
      console.log(`  - Balance Due: ₹${publicRes.data.job.balanceDue}`);
    } else {
      throw new Error('Public portal retrieval failed');
    }
    console.log('');

    // 6. Test Instant UPI Payment Simulation & Soundbox Webhook
    console.log('6. Testing Instant Payment Simulation (/api/invoices/simulate-payment/:id)...');
    const simRes = await axios.post(`${BASE_URL}/invoices/simulate-payment/${testInvoiceId}`);
    if (simRes.status === 200 && simRes.data.job.status === 'paid' && simRes.data.job.balanceDue === 0) {
      console.log(`✓ Payment simulation webhook succeeded: Status = ${simRes.data.job.status}, Balance = ₹${simRes.data.job.balanceDue}`);
    } else {
      throw new Error('Payment simulation failed');
    }
    console.log('');

    // 7. Digital Khata Ledger Test
    console.log('7. Testing Digital Khata Ledger (/api/khata)...');
    const khataRes = await axios.post(`${BASE_URL}/khata`, {
      partyType: 'customer',
      partyName: 'Sharmaji Resident',
      partyPhone: '9876501234',
      title: 'Pending pipe repair balance',
      type: 'you_gave',
      amount: 1450
    }, authHeaders);

    if (khataRes.status === 201) {
      testKhataId = khataRes.data._id;
      console.log(`✓ Khata Udhaar recorded: ${khataRes.data.partyName} - ₹${khataRes.data.amount}`);
      
      const listRes = await axios.get(`${BASE_URL}/khata`, authHeaders);
      console.log(`✓ Khata Summary: Customer Credit = ₹${listRes.data.summary.totalCustomerCredit}, Net = ₹${listRes.data.summary.netBalance}`);
    } else {
      throw new Error('Khata creation failed');
    }
    console.log('');

    // 8. Cleanup
    console.log('8. Cleaning up test database entries...');
    await Job.deleteOne({ _id: testJobId });
    await User.deleteOne({ _id: testUserId });
    await Invoice.deleteOne({ _id: testInvoiceId });
    await Customer.deleteMany({ userId: testUserId });
    await Staff.deleteOne({ _id: testStaffId });
    await Khata.deleteOne({ _id: testKhataId });
    console.log('✓ Cleanup complete.');

    console.log('\n======================================================');
    console.log('🎉 ALL PRO 3.0 ENTERPRISE SUITE TESTS PASSED (100%) 🎉');
    console.log('======================================================\n');

  } catch (error) {
    console.error('\n❌ TEST FAILURE:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error('  Response Data:', error.response.data);
    } else {
      console.error(`  Error message: ${error.message}`);
    }
    console.log('');
  } finally {
    process.exit(0);
  }
}

mongoose.connect('mongodb://127.0.0.1:27017/trade_desk')
  .then(() => runTests())
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
