import Staff from '../models/Staff.js';
import Job from '../models/Job.js';

export const getStaffList = async (req, res) => {
  try {
    const staff = await Staff.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    console.error('Fetch staff error:', error.message);
    res.status(500).json({ message: 'Server error fetching staff members' });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, phone, role, specialization, defaultCommissionPct } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Staff name and phone are required' });
    }

    const member = await Staff.create({
      userId: req.user.id,
      name,
      phone,
      role: role || 'Karigar / Technician',
      specialization: specialization || 'General',
      defaultCommissionPct: Number(defaultCommissionPct) || 40,
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Create staff error:', error.message);
    res.status(500).json({ message: 'Server error creating staff member' });
  }
};

export const recordStaffPayout = async (req, res) => {
  try {
    const { amount } = req.body;
    const member = await Staff.findOne({ _id: req.params.id, userId: req.user.id });
    if (!member) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const pay = Number(amount) || 0;
    member.totalPayoutPaid += pay;
    member.balancePending = Math.max(0, member.totalCommissionEarned - member.totalPayoutPaid);
    await member.save();

    res.json(member);
  } catch (error) {
    console.error('Payout staff error:', error.message);
    res.status(500).json({ message: 'Server error updating staff payout' });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const member = await Staff.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!member) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ message: 'Staff member removed' });
  } catch (error) {
    console.error('Delete staff error:', error.message);
    res.status(500).json({ message: 'Server error deleting staff member' });
  }
};
