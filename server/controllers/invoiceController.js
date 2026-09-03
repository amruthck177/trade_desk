import Job from '../models/Job.js';
import User from '../models/User.js';
import Invoice from '../models/Invoice.js';
import { generateInvoicePDF } from '../services/pdfService.js';
import { sendWhatsAppInvoice, sendWhatsAppReminder } from '../services/twilioService.js';
import path from 'path';
import fs from 'fs';

export const createInvoice = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, userId: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique invoice number
    const prefix = job.documentType === 'estimate' ? 'EST' : (user.invoicePrefix || 'INV');
    const uniqueNumber = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `${prefix}-${uniqueNumber}`;

    // Compile A4 PDF
    const { filePath, publicUrl } = await generateInvoicePDF(job, user, invoiceNumber);

    // Save or update invoice record
    let invoice = await Invoice.findOne({ jobId: job._id });
    if (!invoice) {
      invoice = await Invoice.create({
        userId: req.user.id,
        jobId: job._id,
        invoiceNumber,
        pdfUrl: publicUrl,
      });
    } else {
      invoice.pdfUrl = publicUrl;
      invoice.invoiceNumber = invoiceNumber;
      await invoice.save();
    }

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Invoice Generation Error:', error.message);
    res.status(500).json({ message: 'Server failed to generate invoice PDF' });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found or unauthorized' });
    }
    res.json(invoice);
  } catch (error) {
    console.error('Get Invoice Detail Error:', error.message);
    res.status(500).json({ message: 'Server failed to fetch invoice details' });
  }
};

export const getInvoiceByJobId = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ jobId: req.params.jobId, userId: req.user.id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found for this job' });
    }
    res.json(invoice);
  } catch (error) {
    console.error('Get Job Invoice Error:', error.message);
    res.status(500).json({ message: 'Server failed to fetch invoice for this job' });
  }
};

// PUBLIC UNPROTECTED ENDPOINT FOR CUSTOMER PORTAL
export const getPublicInvoiceByNumber = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    let invoice = await Invoice.findOne({ invoiceNumber });
    if (!invoice && invoiceNumber.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findById(invoiceNumber);
    }

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice / Quotation not found' });
    }

    const job = await Job.findById(invoice.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job order not found' });
    }

    const user = await User.findById(job.userId).select('name businessName phone upiId businessAddress');

    res.json({
      invoice,
      job,
      business: user
    });
  } catch (error) {
    console.error('Get Public Invoice Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving invoice details' });
  }
};

// SIMULATE INSTANT UPI PAYMENT WEBHOOK
export const simulatePayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const job = await Job.findById(invoice.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Associated job not found' });
    }

    job.status = 'paid';
    job.balanceDue = 0;
    job.paymentStage = 'full';
    await job.save();

    res.json({
      message: 'Payment verified and settled successfully',
      invoice,
      job
    });
  } catch (error) {
    console.error('Simulate payment error:', error.message);
    res.status(500).json({ message: 'Server error processing payment simulation' });
  }
};

export const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice record not found' });
    }

    const filePath = path.join(process.cwd(), invoice.pdfUrl);
    if (fs.existsSync(filePath)) {
      res.download(filePath, `Invoice_${invoice.invoiceNumber}.pdf`);
    } else {
      res.status(404).json({ message: 'Compiled PDF file not found on disk' });
    }
  } catch (error) {
    console.error('Download PDF Error:', error.message);
    res.status(500).json({ message: 'Server failed to process download request' });
  }
};

export const sendWhatsApp = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const job = await Job.findById(invoice.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Associated job details not found' });
    }

    const user = await User.findById(job.userId);

    const result = await sendWhatsAppInvoice(job, user, invoice);
    res.json({
      message: 'WhatsApp invoice dispatch complete',
      sid: result.sid,
      fallbackUsed: result.fallback || false,
    });
  } catch (error) {
    console.error('WhatsApp Dispatch Error:', error.message);
    res.status(500).json({ message: 'Server failed to dispatch WhatsApp message' });
  }
};

export const sendReminder = async (req, res) => {
  try {
    const { tier } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const job = await Job.findById(invoice.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Associated job details not found' });
    }

    const user = await User.findById(job.userId);

    const result = await sendWhatsAppReminder(job, user, invoice, tier || 'tier1_polite');
    
    job.lastReminderSentAt = new Date();
    job.reminderCount = (job.reminderCount || 0) + 1;
    await job.save();

    res.json({
      message: 'WhatsApp reminder dispatch complete',
      sid: result.sid,
      tier: tier || 'tier1_polite',
      reminderCount: job.reminderCount,
      lastReminderSentAt: job.lastReminderSentAt,
      fallbackUsed: result.fallback || false,
    });
  } catch (error) {
    console.error('WhatsApp Reminder Error:', error.message);
    res.status(500).json({ message: 'Server failed to send WhatsApp payment reminder' });
  }
};

export const bulkRemind = async (req, res) => {
  try {
    const unpaidJobs = await Job.find({
      userId: req.user.id,
      status: 'unpaid',
      documentType: 'invoice'
    });

    if (unpaidJobs.length === 0) {
      return res.json({ message: 'No unpaid invoices found requiring reminder.' });
    }

    const user = await User.findById(req.user.id);
    let sentCount = 0;

    for (const job of unpaidJobs) {
      let invoice = await Invoice.findOne({ jobId: job._id });
      if (invoice) {
        await sendWhatsAppReminder(job, user, invoice, 'tier2_due');
        job.lastReminderSentAt = new Date();
        job.reminderCount = (job.reminderCount || 0) + 1;
        await job.save();
        sentCount++;
      }
    }

    res.json({
      message: `Successfully broadcasted ${sentCount} WhatsApp payment reminders`,
      count: sentCount
    });
  } catch (error) {
    console.error('Bulk Reminder Error:', error.message);
    res.status(500).json({ message: 'Server failed to process bulk reminders' });
  }
};

export const exportGstReport = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const csvHeaders = [
      'Invoice Number',
      'Invoice Date',
      'Customer Name',
      'Customer Phone',
      'Customer GSTIN',
      'Place of Supply',
      'Supply Type (B2B/B2C)',
      'Job Title',
      'Gross Subtotal (INR)',
      'Discount (INR)',
      'Taxable Subtotal (INR)',
      'GST Rate (%)',
      'CGST (INR)',
      'SGST (INR)',
      'IGST (INR)',
      'Total Bill (INR)',
      'Advance Paid (INR)',
      'Balance Due (INR)',
      'Payment Status',
      'Due Date'
    ];

    const csvRows = [];

    for (const job of jobs) {
      const invoice = await Invoice.findOne({ jobId: job._id });
      const invoiceNo = invoice ? invoice.invoiceNumber : (job.documentType === 'estimate' ? `EST-${job._id.toString().slice(-6)}` : `INV-${job._id.toString().slice(-6)}`);
      const invoiceDate = new Date(job.createdAt).toISOString().split('T')[0];
      const dueDate = job.paymentDueDate ? new Date(job.paymentDueDate).toISOString().split('T')[0] : '';
      const supplyType = job.clientGstin ? 'B2B (Registered)' : 'B2C (Retail)';

      csvRows.push([
        `"${invoiceNo}"`,
        `"${invoiceDate}"`,
        `"${job.clientName || ''}"`,
        `"${job.clientPhone || ''}"`,
        `"${job.clientGstin || ''}"`,
        `"${job.stateOfSupply || 'Delhi'}"`,
        `"${supplyType}"`,
        `"${(job.jobTitle || '').replace(/"/g, '""')}"`,
        (job.subtotal || 0).toFixed(2),
        (job.discountAmount || 0).toFixed(2),
        (job.taxableSubtotal || job.subtotal || 0).toFixed(2),
        `${job.gstRate || 0}%`,
        (job.cgstAmount || 0).toFixed(2),
        (job.sgstAmount || 0).toFixed(2),
        (job.igstAmount || 0).toFixed(2),
        (job.totalBill || 0).toFixed(2),
        (job.advancePaid || 0).toFixed(2),
        (job.balanceDue || 0).toFixed(2),
        `"${job.status}"`,
        `"${dueDate}"`
      ].join(','));
    }

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=TradeDesk_GSTR1_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('GST Export Error:', error.message);
    res.status(500).json({ message: 'Server failed to export GST report' });
  }
};
