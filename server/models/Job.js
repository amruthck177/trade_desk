import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  jobTitle: { type: String, required: true },
  laborHours: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  materials: [materialSchema],
  gstRate: { type: Number, default: 18 }, // 0, 5, 12, 18, 28
  subtotal: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  totalBill: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'unpaid', 'paid'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
});

// Middleware to calculate fields before saving
jobSchema.pre('save', function (next) {
  const laborCost = this.laborHours * this.hourlyRate;
  const materialsCost = this.materials.reduce((sum, item) => sum + item.price, 0);
  
  this.subtotal = laborCost + materialsCost;
  this.gstAmount = Math.round((this.subtotal * (this.gstRate / 100)) * 100) / 100;
  this.totalBill = this.subtotal + this.gstAmount;
  
  next();
});

export default mongoose.model('Job', jobSchema);
