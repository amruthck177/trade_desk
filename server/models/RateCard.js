import mongoose from 'mongoose';

const rateCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['labor', 'material', 'service'], default: 'service' },
  defaultRate: { type: Number, required: true },
  unit: { type: String, default: 'unit' }, // 'hour', 'piece', 'meter', 'visit', 'service'
  gstRate: { type: Number, default: 18 },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('RateCard', rateCardSchema);
