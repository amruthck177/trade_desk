import RateCard from '../models/RateCard.js';

export const getRateCards = async (req, res) => {
  try {
    const items = await RateCard.find({ userId: req.user.id }).sort({ category: 1, title: 1 });
    res.json(items);
  } catch (error) {
    console.error('Get Rate Cards Error:', error.message);
    res.status(500).json({ message: 'Server failed to fetch rate cards' });
  }
};

export const createRateCard = async (req, res) => {
  try {
    const { title, category, defaultRate, unit, gstRate, description } = req.body;
    if (!title || defaultRate === undefined) {
      return res.status(400).json({ message: 'Title and Default Rate are required' });
    }

    const item = await RateCard.create({
      userId: req.user.id,
      title,
      category: category || 'service',
      defaultRate: Number(defaultRate),
      unit: unit || 'unit',
      gstRate: gstRate !== undefined ? Number(gstRate) : 18,
      description: description || '',
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Create Rate Card Error:', error.message);
    res.status(500).json({ message: 'Server failed to create catalog item' });
  }
};

export const updateRateCard = async (req, res) => {
  try {
    const item = await RateCard.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) {
      return res.status(404).json({ message: 'Catalog item not found' });
    }

    item.title = req.body.title || item.title;
    item.category = req.body.category || item.category;
    item.defaultRate = req.body.defaultRate !== undefined ? Number(req.body.defaultRate) : item.defaultRate;
    item.unit = req.body.unit || item.unit;
    item.gstRate = req.body.gstRate !== undefined ? Number(req.body.gstRate) : item.gstRate;
    item.description = req.body.description !== undefined ? req.body.description : item.description;

    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    console.error('Update Rate Card Error:', error.message);
    res.status(500).json({ message: 'Server failed to update catalog item' });
  }
};

export const deleteRateCard = async (req, res) => {
  try {
    const result = await RateCard.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Catalog item not found' });
    }
    res.json({ message: 'Catalog item deleted successfully' });
  } catch (error) {
    console.error('Delete Rate Card Error:', error.message);
    res.status(500).json({ message: 'Server failed to delete catalog item' });
  }
};
