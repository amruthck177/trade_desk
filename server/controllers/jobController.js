import Job from '../models/Job.js';
import Customer from '../models/Customer.js';

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
      status: status || (documentType === 'estimate' ? 'draft' : 'unpaid'),
      pdfTheme: pdfTheme || 'modern',
      customerSignature: customerSignature || '',
      beforePhotoUrl: beforePhotoUrl || '',
      afterPhotoUrl: afterPhotoUrl || '',
      notes: notes || '',
      paymentDueDate: paymentDueDate ? new Date(paymentDueDate) : undefined,
    });

    const savedJob = await job.save();

    // Auto-sync customer directory
    const addedSpend = savedJob.status === 'paid' ? savedJob.totalBill : 0;
    await syncCustomerWithJob(req.user.id, clientName, clientPhone, clientAddress, addedSpend);

    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Create Job Error:', error.message);
    res.status(500).json({ message: 'Server failed to save job details' });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { documentType } = req.query;
    const filter = { userId: req.user.id };
    if (documentType) {
      filter.documentType = documentType;
    }
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Get Jobs Error:', error.message);
    res.status(500).json({ message: 'Server failed to retrieve jobs list' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }
    res.json(job);
  } catch (error) {
    console.error('Get Job Detail Error:', error.message);
    res.status(500).json({ message: 'Server failed to fetch job details' });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    const prevStatus = job.status;

    if (req.body.documentType) job.documentType = req.body.documentType;
    job.clientName = req.body.clientName || job.clientName;
    job.clientPhone = req.body.clientPhone || job.clientPhone;
    job.clientAddress = req.body.clientAddress !== undefined ? req.body.clientAddress : job.clientAddress;
    job.clientGstin = req.body.clientGstin !== undefined ? req.body.clientGstin : job.clientGstin;
    job.stateOfSupply = req.body.stateOfSupply || job.stateOfSupply;
    job.jobTitle = req.body.jobTitle || job.jobTitle;
    job.laborHours = req.body.laborHours !== undefined ? Number(req.body.laborHours) : job.laborHours;
    job.hourlyRate = req.body.hourlyRate !== undefined ? Number(req.body.hourlyRate) : job.hourlyRate;
    job.taxType = req.body.taxType || job.taxType;
    job.gstRate = req.body.gstRate !== undefined ? Number(req.body.gstRate) : job.gstRate;
    job.discountType = req.body.discountType || job.discountType;
    job.discountValue = req.body.discountValue !== undefined ? Number(req.body.discountValue) : job.discountValue;
    job.status = req.body.status || job.status;
    job.pdfTheme = req.body.pdfTheme || job.pdfTheme;
    job.notes = req.body.notes !== undefined ? req.body.notes : job.notes;
    
    if (req.body.customerSignature) job.customerSignature = req.body.customerSignature;
    if (req.body.beforePhotoUrl) job.beforePhotoUrl = req.body.beforePhotoUrl;
    if (req.body.afterPhotoUrl) job.afterPhotoUrl = req.body.afterPhotoUrl;
    if (req.body.paymentDueDate) job.paymentDueDate = new Date(req.body.paymentDueDate);

    if (Array.isArray(req.body.materials)) {
      job.materials = req.body.materials.map(m => ({ name: m.name, price: Number(m.price) }));
    }

    const updatedJob = await job.save();

    // If transitioned to 'paid', update customer total spend
    if (prevStatus !== 'paid' && updatedJob.status === 'paid') {
      try {
        const customer = await Customer.findOne({ userId: req.user.id, phone: updatedJob.clientPhone.trim() });
        if (customer) {
          customer.totalSpent = (customer.totalSpent || 0) + updatedJob.totalBill;
          await customer.save();
        }
      } catch (cErr) {
        console.warn('Customer spend sync warning:', cErr.message);
      }
    }

    res.json(updatedJob);
  } catch (error) {
    console.error('Update Job Error:', error.message);
    res.status(500).json({ message: 'Server failed to update job details' });
  }
};

/**
 * Convert Estimate / Quotation into a finalized Tax Invoice
 */
export const convertEstimateToInvoice = async (req, res) => {
  try {
    const estimate = await Job.findOne({ _id: req.params.id, userId: req.user.id });
    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found or unauthorized' });
    }

    estimate.documentType = 'invoice';
    estimate.status = 'unpaid';
    estimate.isConvertedFromEstimate = true;
    estimate.estimateId = estimate._id.toString();

    const savedInvoice = await estimate.save();
    res.json({
      message: 'Estimate successfully converted to Tax Invoice',
      job: savedInvoice
    });
  } catch (error) {
    console.error('Convert Estimate Error:', error.message);
    res.status(500).json({ message: 'Server failed to convert estimate' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const result = await Job.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete Job Error:', error.message);
    res.status(500).json({ message: 'Server failed to delete job' });
  }
};
