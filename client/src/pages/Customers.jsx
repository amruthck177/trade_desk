import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  Loader2,
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Customers() {
  const token = useAuthStore((state) => state.token);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [modalFormData, setModalFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  // Detail Drawer State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerJobs, setCustomerJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const fetchCustomers = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('/api/customers', { headers });
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setModalFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c, e) => {
    if (e) e.stopPropagation();
    setEditingCustomer(c);
    setModalFormData({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address || '',
      notes: c.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!modalFormData.name || !modalFormData.phone) return;
    setSaving(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingCustomer) {
        await axios.put(`/api/customers/${editingCustomer._id}`, modalFormData, { headers });
      } else {
        await axios.post('/api/customers', modalFormData, { headers });
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this customer record?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/customers/${id}`, { headers });
      if (selectedCustomer?._id === id) setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      alert('Failed to delete customer');
    }
  };

  const handleSelectCustomer = async (c) => {
    setSelectedCustomer(c);
    setLoadingJobs(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`/api/customers/${c._id}`, { headers });
      setCustomerJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to load customer jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-text-primary flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" />
            Customer Directory & CRM
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your client contacts, repeat service history, and outstanding balances.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-orange-glow/20 shadow-md transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* 2. Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, phone, or address..."
          className="w-full pl-10 pr-4 py-2.5 bg-navy-card border border-navy-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* 3. Main Content: Grid + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Customer Cards List */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-navy-card rounded-card border border-navy-border animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-navy-card border border-navy-border rounded-card p-10 text-center flex flex-col items-center">
              <Users className="w-12 h-12 text-text-muted mb-3 opacity-40" />
              <h3 className="text-base font-bold text-text-primary">No customers found</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm">
                Customers are automatically added when you create a job, or you can manually add them.
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c._id}
                onClick={() => handleSelectCustomer(c)}
                className={`bg-navy-card border rounded-card p-4.5 flex items-center justify-between gap-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg ${
                  selectedCustomer?._id === c._id ? 'border-primary bg-navy-card/90 shadow-md' : 'border-navy-border'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-base flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-text-primary truncate">{c.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-primary" />
                        {c.phone}
                      </span>
                      {c.address && (
                        <span className="flex items-center gap-1 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 text-text-muted" />
                          {c.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-text-muted">{c.jobsCount || 0} jobs</p>
                    <p className="text-sm font-bold text-success font-mono flex items-center justify-end">
                      <IndianRupee className="w-3 h-3" />
                      {(c.totalSpent || 0).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/91${c.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-success/10 hover:bg-success/20 text-success border border-success/30 transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>

                  <button
                    onClick={(e) => handleOpenEditModal(c, e)}
                    className="p-2 rounded-lg bg-navy-surface hover:bg-navy-border text-text-secondary hover:text-text-primary transition-colors"
                    title="Edit Customer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer Detail Drawer */}
        <div className="bg-navy-card border border-navy-border rounded-card p-5 lg:sticky lg:top-20">
          {selectedCustomer ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-text-primary">{selectedCustomer.name}</h2>
                  <p className="text-xs text-text-secondary font-mono mt-0.5">+91 {selectedCustomer.phone}</p>
                </div>
                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer._id)}
                  className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                  title="Delete Customer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {selectedCustomer.address && (
                <div className="p-3 bg-navy-surface rounded-xl border border-navy-border/60 text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-primary" /> Service Address
                  </span>
                  {selectedCustomer.address}
                </div>
              )}

              {selectedCustomer.notes && (
                <div className="p-3 bg-navy-surface rounded-xl border border-navy-border/60 text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary block mb-1">Customer Notes</span>
                  {selectedCustomer.notes}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-navy-surface rounded-xl border border-navy-border/60">
                  <span className="text-[11px] text-text-muted block">Total Invoices</span>
                  <span className="text-base font-bold text-text-primary font-mono">{selectedCustomer.jobsCount || 0}</span>
                </div>
                <div className="p-3 bg-navy-surface rounded-xl border border-navy-border/60">
                  <span className="text-[11px] text-text-muted block">Lifetime Value</span>
                  <span className="text-base font-bold text-success font-mono flex items-center">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="border-t border-navy-border/80 pt-3">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-primary" /> Job History
                </h4>

                {loadingJobs ? (
                  <div className="py-4 text-center text-xs text-text-muted">Loading history...</div>
                ) : customerJobs.length === 0 ? (
                  <p className="text-xs text-text-muted py-2">No jobs recorded for this customer yet.</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {customerJobs.map(job => (
                      <Link
                        key={job._id}
                        to={`/jobs`}
                        className="p-2.5 rounded-lg bg-navy-surface hover:bg-navy-border border border-navy-border/50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary truncate">{job.jobTitle}</p>
                          <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            {new Date(job.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-mono font-bold text-text-primary">₹{job.totalBill}</p>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            job.status === 'paid' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to={`/jobs/new?clientName=${encodeURIComponent(selectedCustomer.name)}&clientPhone=${encodeURIComponent(selectedCustomer.phone)}`}
                className="mt-2 w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Create New Invoice for {selectedCustomer.name.split(' ')[0]}
              </Link>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Select a customer from the list to view their service history and metrics.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-primary/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-card border border-navy-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-primary p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-text-primary mb-1">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Enter customer details for invoice auto-fills and WhatsApp delivery.
            </p>

            <form onSubmit={handleSaveCustomer} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={modalFormData.name}
                  onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Phone Number (10 digits) *</label>
                <input
                  type="tel"
                  required
                  value={modalFormData.phone}
                  onChange={(e) => setModalFormData({ ...modalFormData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={modalFormData.email}
                  onChange={(e) => setModalFormData({ ...modalFormData, email: e.target.value })}
                  placeholder="e.g. client@example.com"
                  className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Service Address / Location</label>
                <input
                  type="text"
                  value={modalFormData.address}
                  onChange={(e) => setModalFormData({ ...modalFormData, address: e.target.value })}
                  placeholder="e.g. Flat 402, Green Valley Apts, Bangalore"
                  className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Notes / Preferences</label>
                <textarea
                  rows="2"
                  value={modalFormData.notes}
                  onChange={(e) => setModalFormData({ ...modalFormData, notes: e.target.value })}
                  placeholder="e.g. Prefers afternoon service visits"
                  className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-navy-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
