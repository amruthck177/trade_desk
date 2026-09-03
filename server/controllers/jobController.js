import Job from '../models/Job.js';
import Customer from '../models/Customer.js';
import Staff from '../models/Staff.js';

/**
 * Helper to upsert customer and recalculate CRM metrics
 */
async function syncCustomerWithJob(userId, clientName, clientPhone, clientAddress, addedSpend = 0) {
  try {
    const phone = clientPhone.trim();
    let customer = await Customer.findOne({ userId, phone });
    if (!customer) {
      customer = new Customer({
        userId,
        name: clientName,
        phone,
        address: clientAddress || '',
        jobsCount: 1,
        totalSpent: addedSpend > 0 ? addedSpend : 0,
      });
    } else {
      customer.name = clientName || customer.name;
      if (clientAddress) customer.address = clientAddress;
      customer.jobsCount = (customer.jobsCount || 0) + 1;
      if (addedSpend > 0) {
        customer.totalSpent = (customer.totalSpent || 0) + addedSpend;
      }
      customer.updatedAt = Date.now();
    }
    await customer.save();
  } catch (err) {
    console.warn('Customer auto-sync note:', err.message);
  }
}

export const createJob = async (req, res) => {
  try {
    const { 
      documentType,
      clientName, 
      clientPhone, 
      clientAddress,
      clientGstin,
      stateOfSupply,
      jobTitle, 
      laborHours, 
      hourlyRate, 
      materials, 
      taxType,
      gstRate, 
      discountType,
      discountValue,
      advancePaid,
      assignedStaff,
      isAmc,
      amcFrequencyMonths,
      amcNextDate,
      status,
      pdfTheme,
      customerSignature,
      beforePhotoUrl,
      afterPhotoUrl,
      notes,
      paymentDueDate
    } = req.body;

    if (!clientName || !clientPhone || !jobTitle) {
      return res.status(400).json({ message: 'Client Name, Phone, and Job Title are required' });
    }

    const job = new Job({
      userId: req.user.id,
      documentType: documentType || 'invoice',
      clientName,
      clientPhone,
      clientAddress: clientAddress || '',
      clientGstin: clientGstin || '',
      stateOfSupply: stateOfSupply || 'Delhi',
      jobTitle,
      laborHours: laborHours !== undefined ? Number(laborHours) : 0,
      hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : 0,
      materials: Array.isArray(materials) ? materials.map(m => ({ name: m.name, price: Number(m.price) })) : [],
      taxType: taxType || 'intra_state',
      gstRate: gstRate !== undefined ? Number(gstRate) : 18,
      discountType: discountType || 'none',
      discountValue: discountValue !== undefined ? Number(discountValue) : 0,
      advancePaid: advancePaid !== undefined ? Number(advancePaid) : 0,
      assignedStaff: assignedStaff || null,
      isAmc: isAmc || false,
      amcFrequencyMonths: amcFrequencyMonths ? Number(amcFrequencyMonths) : 6,
      amcNextDate: amcNextDate || null,
      status: status || 'unpaid',
      pdfTheme: pdfTheme || 'modern',
      customerSignature: customerSignature || '',
      beforePhotoUrl: beforePhotoUrl || '',
      afterPhotoUrl: afterPhotoUrl || '',
      notes: notes || '',
      paymentDueDate: paymentDueDate || new Date(Date.now() + 7 * 86400000),
    });

    const savedJob = await job.save();

    // Auto-sync into Customer Mini-CRM
    await syncCustomerWithJob(
      req.user.id, 
      clientName, 
      clientPhone, 
      clientAddress, 
      savedJob.totalBill
    );

    // Update staff total commission if assigned
    if (assignedStaff && assignedStaff.staffId) {
      try {
        const staffMember = await Staff.findOne({ _id: assignedStaff.staffId, userId: req.user.id });
        if (staffMember) {
          staffMember.totalJobsDone += 1;
          staffMember.totalCommissionEarned += (savedJob.assignedStaff.commissionAmount || 0);
          staffMember.balancePending += (savedJob.assignedStaff.commissionAmount || 0);
          await staffMember.save();
        }
      } catch (staffErr) {
        console.warn('Staff commission sync note:', staffErr.message);
      }
    }

    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Create Job Error:', error.message);
    res.status(500).json({ message: 'Server error creating job record' });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { status, type, amc } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (type) filter.documentType = type;
    if (amc === 'true') filter.isAmc = true;

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Get Jobs Error:', error.message);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job record not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Get Job By ID Error:', error.message);
    res.status(500).json({ message: 'Server error fetching job details' });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job record not found' });
    }

    const fields = [
      'documentType', 'clientName', 'clientPhone', 'clientAddress', 'clientGstin',
      'stateOfSupply', 'jobTitle', 'laborHours', 'hourlyRate', 'materials',
      'taxType', 'gstRate', 'discountType', 'discountValue', 'advancePaid',
      'assignedStaff', 'isAmc', 'amcFrequencyMonths', 'amcNextDate',
      'status', 'pdfTheme', 'customerSignature', 'beforePhotoUrl', 'afterPhotoUrl',
      'notes', 'paymentDueDate'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    console.error('Update Job Error:', error.message);
    res.status(500).json({ message: 'Server error updating job record' });
  }
};

export const convertEstimateToInvoice = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Estimate not found or unauthorized' });
    }

    if (job.documentType !== 'estimate') {
      return res.status(400).json({ message: 'This document is already a Tax Invoice' });
    }

    job.documentType = 'invoice';
    job.isConvertedFromEstimate = true;
    job.status = 'unpaid';
    job.paymentDueDate = new Date(Date.now() + 7 * 86400000);
    
    const updatedJob = await job.save();

    res.json({
      message: 'Successfully converted Estimate to formal Tax Invoice',
      job: updatedJob
    });
  } catch (error) {
    console.error('Convert Estimate Error:', error.message);
    res.status(500).json({ message: 'Server error converting estimate' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job record not found' });
    }
    res.json({ message: 'Job record deleted successfully' });
  } catch (error) {
    console.error('Delete Job Error:', error.message);
    res.status(500).json({ message: 'Server error deleting job' });
  }
};
