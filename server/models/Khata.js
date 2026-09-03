import mongoose from 'mongoose';

const khataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partyType: { type: String, enum: ['customer', 'supplier'], required: true }, // 'customer' (Grahak Udhaar) | 'supplier' (Dukaan Udhaar)
  partyName: { type: String, required: true },
  partyPhone: { type: String, required: true },
  title: { type: String, required: true }, // e.g. "Copper wire & pipe purchase from Sharma Electricals"
  type: { type: String, enum: ['you_gave', 'you_got'], required: true }, // 'you_gave' (money given / credit) | 'you_got' (payment received)
  amount: { type: Number, required: true },
  balance: { type: Number, default: 0 },
  dueDate: { type: Date },
  status: { type: String, enum: ['pending', 'settled'], default: 'pending' },
  billImage: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Khata', khataSchema);
