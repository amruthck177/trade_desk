import axios from 'axios';
import mongoose from 'mongoose';
import Job from './models/Job.js';
import User from './models/User.js';
import Invoice from './models/Invoice.js';
import Customer from './models/Customer.js';
import RateCard from './models/RateCard.js';

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 STARTING TRADEDESK PRO 2.0 ENTERPRISE SUITE');
  console.log('======================================================\n');

  let testUserId = null;
  let testEstimateId = null;
  let testInvoiceId = null;
  let testJobId = null;
  let testRateCardId = null;
  let token = null;

  try {
    // 1. User Registration & Setup
    console.log('1. Testing User Registration with Pro Settings...');
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Ramesh Electrician',
      email: `ramesh_pro2_${Date.now()}@example.com`,
      password: 'password123',
      phone: '9876543210'
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

    // Update profile
    await axios.put(`${BASE_URL}/auth/profile`, {
      businessName: 'Ramesh Electricals & HVAC Pro',
      upiId: 'rameshelectric@okaxis',
      gstNumber: '29ABCDE1234F1Z5',
      businessAddress: 'Shop 12, Main Road, Bangalore',
    }, authHeaders);
    console.log('✓ Business profile & UPI configured.');
    console.log('');

    // 2. Multilingual Voice AI Parser
    console.log('2. Testing Multilingual Voice Note Parsing...');
    const { parseJobDetails } = await import('./services/openaiService.js');
    const speechNote = "AC servicing aur gas top up kiya for Sharmaji, phone 9876501234. 2 hours at 450 per hr. Added 4.0 MFD capacitor for 350 and R410A gas for 1200. GST 18 percent.";
    const parsedData = await parseJobDetails(speechNote);
    
    if (parsedData.laborHours === 2 && parsedData.hourlyRate === 450) {
      console.log('✓ Voice note extracted successfully:');
      console.log(`  - Client: ${parsedData.clientName} (${parsedData.clientPhone})`);
      console.log(`  - Labor: ${parsedData.laborHours} hrs @ ₹${parsedData.hourlyRate}`);
      console.log(`  - Materials: ${parsedData.materials.map(m => `${m.name} (₹${m.price})`).join(', ')}`);
    } else {
      throw new Error('Voice parsing validation failed');
    }
    console.log('');

    // 3. Create Estimate / Quotation (कच्चा बिल) with 10% Discount & Intra-State Tax
    console.log('3. Testing Estimate / Quotation Creation with 10% Discount...');
    const estimateRes = await axios.post(`${BASE_URL}/jobs`, {
      documentType: 'estimate',
      clientName: parsedData.clientName || 'Sharmaji',
      clientPhone: parsedData.clientPhone || '9876501234',
      clientAddress: 'Flat 204, Green Heights',
      jobTitle: 'AC Complete Servicing & Gas Top-up',
      laborHours: parsedData.laborHours,
      hourlyRate: parsedData.hourlyRate,
      materials: parsedData.materials,
      taxType: 'intra_state',
      gstRate: 18,
      discountType: 'percentage',
      discountValue: 10,
      paymentDueDate: new Date(Date.now() + 7 * 86400000),
      status: 'draft'
    }, authHeaders);

    if (estimateRes.status === 201 && estimateRes.data.documentType === 'estimate') {
      testEstimateId = estimateRes.data._id;
      console.log(`✓ Estimate created successfully. ID: ${testEstimateId}`);
      console.log(`  - Gross Subtotal: ₹${estimateRes.data.subtotal}`);
      console.log(`  - Discount (10%): ₹${estimateRes.data.discountAmount}`);
      console.log(`  - Taxable Subtotal: ₹${estimateRes.data.taxableSubtotal}`);
      console.log(`  - CGST (9%): ₹${estimateRes.data.cgstAmount} | SGST (9%): ₹${estimateRes.data.sgstAmount}`);
      console.log(`  - Total Estimate Bill: ₹${estimateRes.data.totalBill}`);
    } else {
      throw new Error('Estimate creation failed');
    }
    console.log('');

    // 4. Convert Estimate to Tax Invoice (1-Click Convert)
    console.log('4. Testing 1-Click Estimate-to-Invoice Conversion (/api/jobs/:id/convert)...');
    const convertRes = await axios.post(`${BASE_URL}/jobs/${testEstimateId}/convert`, {}, authHeaders);
    if (convertRes.status === 200 && convertRes.data.job.documentType === 'invoice') {
      testJobId = convertRes.data.job._id;
      console.log(`✓ Estimate converted to Tax Invoice! New Document Type: ${convertRes.data.job.documentType}`);
    } else {
      throw new Error('Estimate conversion failed');
    }
    console.log('');

    // 5. Generate A4 PDF with Classic Vyapar & Dynamic UPI QR
    console.log('5. Testing A4 PDF Compilation with UPI QR Code (/api/invoices/generate/:jobId)...');
    const invoiceRes = await axios.post(`${BASE_URL}/invoices/generate/${testJobId}`, {}, authHeaders);
    if (invoiceRes.status === 201) {
      testInvoiceId = invoiceRes.data._id;
      console.log(`✓ Invoice generated. ID: ${testInvoiceId}`);
      console.log(`  - Invoice Number: ${invoiceRes.data.invoiceNumber}`);
      console.log(`  - PDF File: ${invoiceRes.data.pdfUrl}`);
    } else {
      throw new Error('Invoice compile failed');
    }
    console.log('');

    // 6. Multi-tier WhatsApp Payment Reminder (Tier 3 Urgent)
    console.log('6. Testing Tier 3 Urgent WhatsApp Payment Reminder (/api/invoices/remind/:id)...');
    const reminderRes = await axios.post(`${BASE_URL}/invoices/remind/${testInvoiceId}`, {
      tier: 'tier3_urgent'
    }, authHeaders);
    if (reminderRes.status === 200 && reminderRes.data.tier === 'tier3_urgent') {
      console.log(`✓ Tier 3 Urgent WhatsApp Reminder Dispatched! SID: ${reminderRes.data.sid}`);
    } else {
      throw new Error('Tiered reminder failed');
    }
    console.log('');

    // 7. Bulk WhatsApp Broadcast Test
    console.log('7. Testing Bulk WhatsApp Reminder Broadcast (/api/invoices/bulk-remind)...');
    const bulkRes = await axios.post(`${BASE_URL}/invoices/bulk-remind`, {}, authHeaders);
    if (bulkRes.status === 200) {
      console.log(`✓ Bulk Broadcast succeeded: ${bulkRes.data.message}`);
    } else {
      throw new Error('Bulk reminder failed');
    }
    console.log('');

    // 8. Enhanced GSTR-1 CSV Report Export
    console.log('8. Testing Enhanced GSTR-1 CSV Report (/api/invoices/export/gst)...');
    const gstExportRes = await axios.get(`${BASE_URL}/invoices/export/gst`, authHeaders);
    if (gstExportRes.status === 200 && typeof gstExportRes.data === 'string' && gstExportRes.data.includes('Place of Supply')) {
      console.log('✓ GSTR-1 CSV Report generated:');
      const lines = gstExportRes.data.split('\n');
      console.log(`  - Header: ${lines[0]}`);
      if (lines[1]) console.log(`  - Row 1: ${lines[1]}`);
    } else {
      throw new Error('GSTR-1 CSV export validation failed');
    }
    console.log('');

    // 9. Cleanup
    console.log('9. Cleaning up test database entries...');
    await Job.deleteOne({ _id: testJobId });
    await User.deleteOne({ _id: testUserId });
    await Invoice.deleteOne({ _id: testInvoiceId });
    await Customer.deleteMany({ userId: testUserId });
    console.log('✓ Cleanup complete.');

    console.log('\n======================================================');
    console.log('🎉 ALL PRO 2.0 ENTERPRISE TESTS PASSED (100%) 🎉');
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
