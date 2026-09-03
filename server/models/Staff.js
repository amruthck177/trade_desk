import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['Master / Ustaad', 'Karigar / Technician', 'Helper / Apprentice'], default: 'Karigar / Technician' },
  specialization: { type: String, default: 'General' }, // e.g. "AC Inverter Specialist", "Wiring Master"
  defaultCommissionPct: { type: Number, default: 40 }, // % of labor fee
  totalJobsDone: { type: Number, default: 0 },
  totalCommissionEarned: { type: Number, default: 0 },
  totalPayoutPaid: { type: Number, default: 0 },
  balancePending: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Staff', staffSchema);
