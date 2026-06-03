import Job from '../models/Job.js';

export const createJob = async (req, res) => {
  try {
    const { clientName, clientPhone, jobTitle, laborHours, hourlyRate, materials, gstRate, status } = req.body;

    if (!clientName || !clientPhone || !jobTitle) {
      return res.status(400).json({ message: 'Client Name, Phone, and Job Title are required' });
    }

    const job = new Job({
      userId: req.user.id,
      clientName,
      clientPhone,
      jobTitle,
      laborHours: laborHours !== undefined ? Number(laborHours) : 0,
      hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : 0,
      materials: Array.isArray(materials) ? materials.map(m => ({ name: m.name, price: Number(m.price) })) : [],
      gstRate: gstRate !== undefined ? Number(gstRate) : 18,
      status: status || 'draft',
    });

    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Create Job Error:', error.message);
    res.status(500).json({ message: 'Server failed to save job details' });
  }
};

export const getJobs = async (req, res) => {
  try {
    // Find all jobs for this user, sorted by creation date descending
    const jobs = await Job.find({ userId: req.user.id }).sort({ createdAt: -1 });
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

    job.clientName = req.body.clientName || job.clientName;
    job.clientPhone = req.body.clientPhone || job.clientPhone;
    job.jobTitle = req.body.jobTitle || job.jobTitle;
    job.laborHours = req.body.laborHours !== undefined ? Number(req.body.laborHours) : job.laborHours;
    job.hourlyRate = req.body.hourlyRate !== undefined ? Number(req.body.hourlyRate) : job.hourlyRate;
    job.gstRate = req.body.gstRate !== undefined ? Number(req.body.gstRate) : job.gstRate;
    job.status = req.body.status || job.status;

    if (Array.isArray(req.body.materials)) {
      job.materials = req.body.materials.map(m => ({ name: m.name, price: Number(m.price) }));
    }

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    console.error('Update Job Error:', error.message);
    res.status(500).json({ message: 'Server failed to update job details' });
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
