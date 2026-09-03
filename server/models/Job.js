import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const assignedStaffSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  role: { type: String, default: 'Karigar' },
  commissionPct: { type: Number, default: 0 },
  commissionAmount: { type: Number, default: 0 },
});

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentType: { type: String, enum: ['invoice', 'estimate'], default: 'invoice' },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  clientAddress: { type: String, default: '' },
  clientGstin: { type: String, default: '' },
  stateOfSupply: { type: String, default: 'Delhi' },
  jobTitle: { type: String, required: true },
  laborHours: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  materials: [materialSchema],
  taxType: { type: String, enum: ['intra_state', 'inter_state'], default: 'intra_state' },
  gstRate: { type: Number, default: 18 },
  discountType: { type: String, enum: ['none', 'percentage', 'fixed'], default: 'none' },
  discountValue: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  taxableSubtotal: { type: Number, default: 0 },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  totalBill: { type: Number, default: 0 },
  
  // Advance Token / Split Payments
  advancePaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  paymentStage: { type: String, enum: ['unpaid', 'advance_paid', 'full'], default: 'unpaid' },
  
  // Staff / Karigar Dispatch
  assignedStaff: assignedStaffSchema,

  // Annual Maintenance Contract (AMC)
  isAmc: { type: Boolean, default: false },
  amcFrequencyMonths: { type: Number, default: 6 },
  amcNextDate: { type: Date },

  status: { type: String, enum: ['draft', 'unpaid', 'paid', 'converted'], default: 'unpaid' },
  pdfTheme: { type: String, enum: ['modern', 'classic_vyapar', 'thermal'], default: 'modern' },
  customerSignature: { type: String, default: '' },
  beforePhotoUrl: { type: String, default: '' },
  afterPhotoUrl: { type: String, default: '' },
  notes: { type: String, default: '' },
  paymentDueDate: { type: Date },
  lastReminderSentAt: { type: Date },
  reminderCount: { type: Number, default: 0 },
  isConvertedFromEstimate: { type: Boolean, default: false },
  estimateId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Middleware to calculate fields before saving
jobSchema.pre('save', function (next) {
  const laborCost = (Number(this.laborHours) || 0) * (Number(this.hourlyRate) || 0);
  const materialsCost = (this.materials || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  
  this.subtotal = Math.round((laborCost + materialsCost) * 100) / 100;
  
  // Calculate discount
  let disc = 0;
  if (this.discountType === 'percentage') {
    disc = (this.subtotal * (Number(this.discountValue) || 0)) / 100;
  } else if (this.discountType === 'fixed') {
    disc = Number(this.discountValue) || 0;
  }
  this.discountAmount = Math.min(this.subtotal, Math.round(disc * 100) / 100);
  this.taxableSubtotal = Math.max(0, Math.round((this.subtotal - this.discountAmount) * 100) / 100);

  // Calculate GST based on Intra-State (CGST + SGST) vs Inter-State (IGST)
  const gstRateVal = Number(this.gstRate) || 0;
  const totalTax = Math.round((this.taxableSubtotal * (gstRateVal / 100)) * 100) / 100;
  this.gstAmount = totalTax;

  if (this.taxType === 'inter_state') {
    this.igstAmount = totalTax;
    this.cgstAmount = 0;
    this.sgstAmount = 0;
  } else {
    this.cgstAmount = Math.round((totalTax / 2) * 100) / 100;
    this.sgstAmount = Math.round((totalTax - this.cgstAmount) * 100) / 100;
    this.igstAmount = 0;
  }

  this.totalBill = Math.round((this.taxableSubtotal + this.gstAmount) * 100) / 100;
  
  // Advance & Balance Due Calculation
  const adv = Number(this.advancePaid) || 0;
  this.advancePaid = adv;
  this.balanceDue = Math.max(0, Math.round((this.totalBill - adv) * 100) / 100);

  if (this.status === 'paid' || this.balanceDue === 0) {
    this.paymentStage = 'full';
    this.balanceDue = 0;
  } else if (adv > 0) {
    this.paymentStage = 'advance_paid';
  } else {
    this.paymentStage = 'unpaid';
  }

  // Staff Commission Calculation
  if (this.assignedStaff && this.assignedStaff.commissionPct > 0) {
    this.assignedStaff.commissionAmount = Math.round((laborCost * (this.assignedStaff.commissionPct / 100)) * 100) / 100;
  }

  // Auto calculate AMC Next Date if enabled and empty
  if (this.isAmc && !this.amcNextDate) {
    const months = this.amcFrequencyMonths || 6;
    const nextD = new Date();
    nextD.setMonth(nextD.getMonth() + months);
    this.amcNextDate = nextD;
  }
  
  next();
});

export default mongoose.model('Job', jobSchema);
