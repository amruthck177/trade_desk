import Job from '../models/Job.js';
import User from '../models/User.js';
import Invoice from '../models/Invoice.js';
import { generateInvoicePDF } from '../services/pdfService.js';
import { sendWhatsAppInvoice } from '../services/twilioService.js';
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
    const prefix = user.invoicePrefix || 'INV';
    const uniqueNumber = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `${prefix}-${uniqueNumber}`;

    // Compile A4 PDF
    const { filePath, publicUrl } = await generateInvoicePDF(job, user, invoiceNumber);

    // Save invoice record
    const invoice = await Invoice.create({
      userId: req.user.id,
      jobId: job._id,
      invoiceNumber,
      pdfUrl: publicUrl,
    });

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
    const businessName = user.businessName || 'TradeDesk Technician';

    // Dispatch message
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
