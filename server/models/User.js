import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  businessName: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  upiId: { type: String, default: '' },
  invoicePrefix: { type: String, default: 'INV' },
  logoUrl: { type: String, default: '' },
  businessAddress: { type: String, default: '' },
  defaultTerms: { type: String, default: '1. All service and repair work carries a 30-day workmanship warranty.\n2. Materials and spare parts are covered by standard manufacturer warranty.\n3. Please pay on or before the due date.' },
  requireSignature: { type: Boolean, default: true },
  activePlan: { type: String, default: 'free' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
