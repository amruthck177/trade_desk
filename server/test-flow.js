import axios from 'axios';
import mongoose from 'mongoose';
import Job from './models/Job.js';
import User from './models/User.js';
import Invoice from './models/Invoice.js';

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('\n=======================================');
  console.log('STARTING TRADE_DESK E2E BACKEND TESTS');
  console.log('=======================================\n');

  let testUserId = null;
  let testJobId = null;
  let testInvoiceId = null;
  let token = null;

  try {
    // 1. Testing User Registration
    console.log('1. Testing User Registration...');
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Tester Plumbing Pro',
      email: `plumber_test_${Date.now()}@example.com`,
      password: 'securepassword123',
      phone: '9988776655'
    });
    
    if (registerRes.status === 201 && registerRes.data.token) {
      testUserId = registerRes.data._id;
      token = registerRes.data.token;
      console.log(`✓ Registration succeeded. Tester ID: ${testUserId}`);
    } else {
      throw new Error('Registration did not return a token or correct status');
    }
    console.log('');

    // Setup Auth headers
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Testing User Login
    console.log('2. Testing User Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: registerRes.data.email,
      password: 'securepassword123'
    });
    if (loginRes.status === 200 && loginRes.data.token) {
      console.log('✓ Login succeeded. Token received.');
    } else {
      throw new Error('Login failed');
    }
    console.log('');

    // 3. Testing Voice parsing endpoint mockup
    console.log('3. Testing Transcript Voice Parsing (/api/voice/parse)...');
    // Since we don't have a real audio file in tests, we can trigger the logic using the services directly or simulate it.
    // For tests, let's call the parser manually or simulate a voice controller upload if needed.
    // Let's test the local regex NLP parser function. We can import it or mock the network request by directly testing the openaiService.
    const { parseJobDetails } = await import('./services/openaiService.js');
    const mockTranscript = "Fixing kitchen sink leak for Rahul, phone number is 9988776655. I spent 4 hours fixing it at 400 per hour. Used a kitchen PVC pipe connector which cost 250 and teflon tape of 50. GST rate should be 18 percent.";
    const parsedData = await parseJobDetails(mockTranscript);
    
    if (parsedData.clientName === 'Rahul' && parsedData.gstRate === 18 && parsedData.materials.length === 2) {
      console.log('✓ Parsing succeeded. Parsed outputs:');
      console.log(`  - Client: ${parsedData.clientName} (${parsedData.clientPhone})`);
      console.log(`  - Job Type: ${parsedData.jobTitle}`);
      console.log(`  - Labor: ${parsedData.laborHours} hrs @ Rs. ${parsedData.hourlyRate}`);
      console.log(`  - Materials Count: ${parsedData.materials.length}`);
      console.log(`  - GST Rate: ${parsedData.gstRate}%`);
    } else {
      throw new Error('Local NLP parser output validation failed: ' + JSON.stringify(parsedData));
    }
    console.log('');

    // 4. Testing Job Creation
    console.log('4. Testing Job Creation manually (/api/jobs)...');
    const jobRes = await axios.post(`${BASE_URL}/jobs`, {
      clientName: parsedData.clientName,
      clientPhone: parsedData.clientPhone,
      jobTitle: parsedData.jobTitle,
      laborHours: parsedData.laborHours,
      hourlyRate: parsedData.hourlyRate,
      materials: parsedData.materials,
      gstRate: parsedData.gstRate,
      status: 'unpaid'
    }, authHeaders);

    if (jobRes.status === 201) {
      testJobId = jobRes.data._id;
      console.log(`✓ Job saved successfully. ID: ${testJobId}`);
      console.log(`  - Calculated Subtotal: ₹${jobRes.data.subtotal}`);
      console.log(`  - GST Amount: ₹${jobRes.data.gstAmount}`);
      console.log(`  - Total Bill: ₹${jobRes.data.totalBill}`);
    } else {
      throw new Error('Job creation endpoint failed');
    }
    console.log('');

    // 5. Testing Invoice PDF Compile
    console.log('5. Testing Invoice compilation (/api/invoices/generate/:jobId)...');
    const invoiceRes = await axios.post(`${BASE_URL}/invoices/generate/${testJobId}`, {}, authHeaders);
    if (invoiceRes.status === 201) {
      testInvoiceId = invoiceRes.data._id;
      console.log(`✓ Invoice generated successfully. ID: ${testInvoiceId}`);
      console.log(`  - Invoice Number: ${invoiceRes.data.invoiceNumber}`);
      console.log(`  - PDF File Location: ${invoiceRes.data.pdfUrl}`);
    } else {
      throw new Error('Invoice compile failed');
    }
    console.log('');

    // 6. Testing Twilio WhatsApp dispatcher
    console.log('6. Testing Twilio WhatsApp delivery (/api/invoices/send-whatsapp/:id)...');
    const whatsappRes = await axios.post(`${BASE_URL}/invoices/send-whatsapp/${testInvoiceId}`, {}, authHeaders);
    if (whatsappRes.status === 200 && whatsappRes.data.sid) {
      console.log(`✓ WhatsApp Dispatch succeeded. Twilio Message SID: ${whatsappRes.data.sid}`);
    } else {
      throw new Error('WhatsApp delivery failed');
    }
    console.log('');

    // 7. Testing Dashboard statistics
    console.log('7. Testing Dashboard Stats updates (/api/dashboard/stats)...');
    const statsRes = await axios.get(`${BASE_URL}/dashboard/stats`, authHeaders);
    if (statsRes.status === 200) {
      console.log(`✓ Stats loaded correctly:`);
      console.log(`  - Jobs created today: ${statsRes.data.jobsToday}`);
      console.log(`  - Month revenue count: ₹${statsRes.data.revenueThisMonth}`);
      console.log(`  - Pending bills: ${statsRes.data.pendingInvoices}`);
      console.log(`  - Follow-up alerts: ${statsRes.data.followUps}`);
    } else {
      throw new Error('Dashboard stats failed');
    }
    console.log('');

    // 8. DB cleaning
    console.log('8. Cleaning database test entries...');
    await Job.deleteOne({ _id: testJobId });
    await User.deleteOne({ _id: testUserId });
    await Invoice.deleteOne({ _id: testInvoiceId });
    console.log('✓ Teardown successful. Test entries purged.');
    
    console.log('\n=======================================');
    console.log('🎉 E2E BACKEND INTEGRATION SUCCESSFUL 🎉');
    console.log('=======================================\n');

  } catch (error) {
    console.error('\n❌ E2E TEST CRITICAL FAILURE:');
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

// Make sure MongoDB is connected before running tests
mongoose.connect('mongodb://127.0.0.1:27017/trade_desk')
  .then(() => {
    runTests();
  })
  .catch(err => {
    console.error('Test script database connect failed:', err.message);
    process.exit(1);
  });
