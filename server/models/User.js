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
  activePlan: { type: String, default: 'free' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
