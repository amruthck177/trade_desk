import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  pdfUrl: { type: String, required: true },
  status: { type: String, default: 'sent' }, // 'sent' | 'failed'
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Invoice', invoiceSchema);
