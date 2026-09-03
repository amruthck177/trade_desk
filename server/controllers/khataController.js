import Khata from '../models/Khata.js';

export const getKhataEntries = async (req, res) => {
  try {
    const { partyType } = req.query;
    const filter = { userId: req.user.id };
    if (partyType) filter.partyType = partyType;

    const entries = await Khata.find(filter).sort({ createdAt: -1 });

    // Aggregate summary stats
    let totalCustomerCredit = 0;
    let totalSupplierDebt = 0;

    entries.forEach(e => {
      if (e.status === 'pending') {
        if (e.partyType === 'customer' && e.type === 'you_gave') {
          totalCustomerCredit += e.amount;
        } else if (e.partyType === 'supplier' && e.type === 'you_gave') {
          totalSupplierDebt += e.amount;
        }
      }
    });

    res.json({
      entries,
      summary: {
        totalCustomerCredit,
        totalSupplierDebt,
        netBalance: totalCustomerCredit - totalSupplierDebt
      }
    });
  } catch (error) {
    console.error('Fetch Khata error:', error.message);
    res.status(500).json({ message: 'Server error fetching Khata records' });
  }
};

export const createKhataEntry = async (req, res) => {
  try {
    const { partyType, partyName, partyPhone, title, type, amount, dueDate, notes } = req.body;

    if (!partyType || !partyName || !partyPhone || !title || !amount) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const entry = await Khata.create({
      userId: req.user.id,
      partyType,
      partyName,
      partyPhone,
      title,
      type: type || 'you_gave',
      amount: Number(amount),
      balance: Number(amount),
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000),
      notes: notes || '',
      status: 'pending'
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Create Khata error:', error.message);
    res.status(500).json({ message: 'Server error creating Khata record' });
  }
};

export const settleKhataEntry = async (req, res) => {
  try {
    const entry = await Khata.findOne({ _id: req.params.id, userId: req.user.id });
    if (!entry) {
      return res.status(404).json({ message: 'Khata entry not found' });
    }

    entry.status = entry.status === 'settled' ? 'pending' : 'settled';
    entry.balance = entry.status === 'settled' ? 0 : entry.amount;
    await entry.save();

    res.json(entry);
  } catch (error) {
    console.error('Settle Khata error:', error.message);
    res.status(500).json({ message: 'Server error updating Khata record' });
  }
};

export const deleteKhataEntry = async (req, res) => {
  try {
    const entry = await Khata.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!entry) {
      return res.status(404).json({ message: 'Khata entry not found' });
    }
    res.json({ message: 'Khata entry removed' });
  } catch (error) {
    console.error('Delete Khata error:', error.message);
    res.status(500).json({ message: 'Server error deleting Khata record' });
  }
};
