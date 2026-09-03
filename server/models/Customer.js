import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  notes: { type: String, default: '' },
  totalSpent: { type: Number, default: 0 },
  jobsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

customerSchema.index({ userId: 1, phone: 1 }, { unique: true });

export default mongoose.model('Customer', customerSchema);
