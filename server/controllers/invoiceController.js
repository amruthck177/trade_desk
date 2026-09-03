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
    console.error('Get Invoice By Job Error:', error.message);
    res.status(500).json({ message: 'Server failed to fetch invoice' });
  }
};

export const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice record not found' });
    }

    const filePath = path.join('./', invoice.pdfUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Invoice PDF file not found on disk' });
    }

    res.contentType('application/pdf');
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Download Invoice Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving PDF file' });
  }
};

export const sendInvoiceWhatsApp = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found or unauthorized' });
    }

    const job = await Job.findById(invoice.jobId);
    const user = await User.findById(req.user.id);

    const invoiceUrl = `http://localhost:${process.env.PORT || 5000}${invoice.pdfUrl}`;
    const businessName = user.businessName || user.name || 'TradeDesk Technician';

    const sid = await sendWhatsAppInvoice(
      job.clientPhone,
      invoice.invoiceNumber,
      invoiceUrl,
      job.clientName,
      businessName
    );

    invoice.status = 'sent';
    await invoice.save();

    res.json({ message: 'WhatsApp notification sent successfully', sid });
  } catch (error) {
    console.error('WhatsApp Sender Error:', error.message);
    res.status(500).json({ message: 'Server failed to send WhatsApp notification' });
  }
};

export const sendPaymentReminder = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found or unauthorized' });
    }

    const job = await Job.findById(invoice.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Associated job not found' });
    }

    const tier = req.body.tier || 'tier1_polite';
    const user = await User.findById(req.user.id);
    const invoiceUrl = `http://localhost:${process.env.PORT || 5000}${invoice.pdfUrl}`;
    const businessName = user.businessName || user.name || 'TradeDesk Technician';

    const sid = await sendWhatsAppReminder(
      job.clientPhone,
      invoice.invoiceNumber,
      job.totalBill,
      invoiceUrl,
      job.clientName,
      businessName,
      tier
    );

    job.lastReminderSentAt = new Date();
    job.reminderCount = (job.reminderCount || 0) + 1;
    await job.save();

    res.json({ message: 'Payment reminder dispatched', sid, tier });
  } catch (error) {
    console.error('Payment Reminder Error:', error.message);
    res.status(500).json({ message: 'Server failed to send payment reminder' });
  }
};

/**
 * Bulk reminder dispatcher for all overdue invoices
 */
export const bulkSendReminders = async (req, res) => {
  try {
    const unpaidJobs = await Job.find({ 
      userId: req.user.id, 
      status: 'unpaid',
      documentType: 'invoice'
    });

    const user = await User.findById(req.user.id);
    const businessName = user.businessName || user.name || 'TradeDesk Technician';
    let sentCount = 0;

    for (const job of unpaidJobs) {
      const invoice = await Invoice.findOne({ jobId: job._id });
      if (invoice) {
        const invoiceUrl = `http://localhost:${process.env.PORT || 5000}${invoice.pdfUrl}`;
        await sendWhatsAppReminder(
          job.clientPhone,
          invoice.invoiceNumber,
          job.totalBill,
          invoiceUrl,
          job.clientName,
          businessName,
          'tier2_due'
        );
        job.lastReminderSentAt = new Date();
        job.reminderCount = (job.reminderCount || 0) + 1;
        await job.save();
        sentCount++;
      }
    }

    res.json({ message: `Successfully broadcasted ${sentCount} WhatsApp payment reminders`, sentCount });
  } catch (error) {
    console.error('Bulk Reminder Error:', error.message);
    res.status(500).json({ message: 'Failed to broadcast bulk reminders' });
  }
};

/**
 * Generates and downloads GSTR-1 compliant CSV report
 */
export const exportGstReport = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id, documentType: 'invoice' }).sort({ createdAt: -1 });
    const invoices = await Invoice.find({ userId: req.user.id });
    const invoiceMap = new Map(invoices.map(inv => [inv.jobId.toString(), inv.invoiceNumber]));

    const headers = [
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
      'Payment Status',
      'Due Date'
    ];

    const rows = jobs.map(j => {
      const invNum = invoiceMap.get(j._id.toString()) || `DRAFT-${j._id.toString().slice(-6)}`;
      const isB2B = Boolean(j.clientGstin && j.clientGstin.trim().length >= 15);
      const supplyType = isB2B ? 'B2B' : 'B2C (Retail)';
      const cgst = (j.cgstAmount || (j.taxType === 'intra_state' ? j.gstAmount / 2 : 0)).toFixed(2);
      const sgst = (j.sgstAmount || (j.taxType === 'intra_state' ? j.gstAmount / 2 : 0)).toFixed(2);
      const igst = (j.igstAmount || (j.taxType === 'inter_state' ? j.gstAmount : 0)).toFixed(2);
      const invDate = new Date(j.createdAt).toISOString().split('T')[0];
      const dueDate = j.paymentDueDate ? new Date(j.paymentDueDate).toISOString().split('T')[0] : '';
      const grossSub = (j.subtotal || 0).toFixed(2);
      const discAmt = (j.discountAmount || 0).toFixed(2);
      const taxSub = (j.taxableSubtotal || j.subtotal || 0).toFixed(2);

      return [
        `"${invNum}"`,
        `"${invDate}"`,
        `"${(j.clientName || '').replace(/"/g, '""')}"`,
        `"${j.clientPhone || ''}"`,
        `"${j.clientGstin || ''}"`,
        `"${j.stateOfSupply || 'Delhi'}"`,
        `"${supplyType}"`,
        `"${(j.jobTitle || '').replace(/"/g, '""')}"`,
        grossSub,
        discAmt,
        taxSub,
        `${j.gstRate}%`,
        cgst,
        sgst,
        igst,
        (j.totalBill || 0).toFixed(2),
        `"${j.status}"`,
        `"${dueDate}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="TradeDesk_GSTR1_Export_${new Date().toISOString().split('T')[0]}.csv"`);
    res.status(200).send(csvContent);

  } catch (error) {
    console.error('GST Report Export Error:', error.message);
    res.status(500).json({ message: 'Failed to generate GSTR-1 export' });
  }
};
