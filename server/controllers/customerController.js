import Customer from '../models/Customer.js';
import Job from '../models/Job.js';

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error('Get Customers Error:', error.message);
    res.status(500).json({ message: 'Server failed to fetch customers' });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    // Fetch customer's jobs
    const jobs = await Job.find({ userId: req.user.id, clientPhone: customer.phone }).sort({ createdAt: -1 });
    res.json({ customer, jobs });
  } catch (error) {
    console.error('Get Customer Detail Error:', error.message);
    res.status(500).json({ message: 'Server failed to fetch customer details' });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and Phone number are required' });
    }

    const existing = await Customer.findOne({ userId: req.user.id, phone: phone.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Customer with this phone number already exists' });
    }

    const customer = await Customer.create({
      userId: req.user.id,
      name,
      phone: phone.trim(),
      email: email || '',
      address: address || '',
      notes: notes || '',
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create Customer Error:', error.message);
    res.status(500).json({ message: 'Server failed to create customer' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.name = req.body.name || customer.name;
    customer.phone = req.body.phone ? req.body.phone.trim() : customer.phone;
    customer.email = req.body.email !== undefined ? req.body.email : customer.email;
    customer.address = req.body.address !== undefined ? req.body.address : customer.address;
    customer.notes = req.body.notes !== undefined ? req.body.notes : customer.notes;
    customer.updatedAt = Date.now();

    const saved = await customer.save();
    res.json(saved);
  } catch (error) {
    console.error('Update Customer Error:', error.message);
    res.status(500).json({ message: 'Server failed to update customer' });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const result = await Customer.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete Customer Error:', error.message);
    res.status(500).json({ message: 'Server failed to delete customer' });
  }
};
