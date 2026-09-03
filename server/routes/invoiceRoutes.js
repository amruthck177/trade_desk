import express from 'express';
import { 
  createInvoice, 
  getInvoiceById, 
  getInvoiceByJobId, 
  getPublicInvoiceByNumber,
  simulatePayment,
  downloadInvoicePDF, 
  sendWhatsApp,
  sendReminder,
  bulkRemind,
  exportGstReport
} from '../controllers/invoiceController.js';
import { protect } from '../server.js';

const router = express.Router();

// Public Customer Portal Endpoint (Unauthenticated)
router.get('/public/:invoiceNumber', getPublicInvoiceByNumber);
router.post('/simulate-payment/:id', simulatePayment);
router.get('/download/:id', downloadInvoicePDF);

// Protected Operations
router.get('/export/gst', protect, exportGstReport);
router.post('/generate/:jobId', protect, createInvoice);
router.get('/:id', protect, getInvoiceById);
router.get('/job/:jobId', protect, getInvoiceByJobId);
router.post('/send-whatsapp/:id', protect, sendWhatsApp);
router.post('/remind/:id', protect, sendReminder);
router.post('/bulk-remind', protect, bulkRemind);

export default router;
