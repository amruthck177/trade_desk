import express from 'express';
import { 
  createInvoice, 
  getInvoiceById, 
  getInvoiceByJobId, 
  downloadInvoicePDF, 
  sendInvoiceWhatsApp,
  sendPaymentReminder,
  bulkSendReminders,
  exportGstReport
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/export/gst', protect, exportGstReport);
router.post('/generate/:jobId', protect, createInvoice);
router.get('/:id', protect, getInvoiceById);
router.get('/job/:jobId', protect, getInvoiceByJobId);
router.get('/download/:id', downloadInvoicePDF);
router.post('/send-whatsapp/:id', protect, sendInvoiceWhatsApp);
router.post('/remind/:id', protect, sendPaymentReminder);
router.post('/bulk-remind', protect, bulkSendReminders);

export default router;
