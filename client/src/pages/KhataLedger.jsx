import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  BookOpen, 
  Plus, 
  Search, 
  IndianRupee, 
  Send, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Loader2,
  Users,
  Store,
  Calendar,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export default function KhataLedger() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ totalCustomerCredit: 0, totalSupplierDebt: 0, netBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'customer' | 'supplier' | 'pending' | 'settled'
  
  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    partyType: 'customer',
    partyName: '',
    partyPhone: '',
    title: '',
    type: 'you_gave',
    amount: '',
    dueDate: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const token = useAuthStore((state) => state.token);

  const fetchKhata = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('/api/khata', { headers });
      setEntries(res.data.entries || []);
      setSummary(res.data.summary || { totalCustomerCredit: 0, totalSupplierDebt: 0, netBalance: 0 });
    } catch (err) {
      console.error('Fetch Khata failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhata();
  }, [token]);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!formData.partyName || !formData.partyPhone || !formData.title || !formData.amount) {
      alert('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post('/api/khata', formData, { headers });
      setIsModalOpen(false);
      setFormData({
        partyType: 'customer',
        partyName: '',
        partyPhone: '',
        title: '',
        type: 'you_gave',
        amount: '',
        dueDate: '',
        notes: ''
      });
      fetchKhata();
    } catch (err) {
      console.error('Create Khata entry error:', err);
      alert('Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSettle = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`/api/khata/${id}/settle`, {}, { headers });
      fetchKhata();
    } catch (err) {
      console.error('Settle error:', err);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Delete this ledger transaction?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/khata/${id}`, { headers });
      fetchKhata();
    } catch (err) {
      console.error('Delete entry error:', err);
    }
  };

  const handleSendWhatsAppReminder = (entry) => {
    const text = `Namaste ${entry.partyName}, friendly reminder regarding outstanding balance of ₹${entry.amount} for "${entry.title}". Please settle at your earliest. Thank you!`;
    window.open(`https://wa.me/91${entry.partyPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filter entries
  const filteredEntries = entries.filter(e => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = e.partyName.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.partyPhone.includes(q);
    if (!matchesSearch) return false;

    if (activeTab === 'customer') return e.partyType === 'customer';
    if (activeTab === 'supplier') return e.partyType === 'supplier';
    if (activeTab === 'pending') return e.status === 'pending';
    if (activeTab === 'settled') return e.status === 'settled';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-display font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Digital Khata & Supplier Ledger (उधार / बहीखाता)</span>
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Track customer credit balances and hardware distributor payables with 1-click WhatsApp collection
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-orange-glow transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Udhaar Entry</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Customer Credit (Receivable) */}
        <div className="glass-panel p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-rose-400" /> Customer Credit (ग्राहक उधार)
            </span>
            <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
              Receivable
            </span>
          </div>
          <div className="my-2">
            <p className="text-2xl font-black font-mono text-rose-400">₹{summary.totalCustomerCredit.toFixed(2)}</p>
          </div>
          <span className="text-[10px] text-text-secondary">Money owed to you by clients</span>
        </div>

        {/* Supplier Debt (Payable) */}
        <div className="glass-panel p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-amber-400" /> Supplier Debt (दुकान उधार)
            </span>
            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              Payable
            </span>
          </div>
          <div className="my-2">
            <p className="text-2xl font-black font-mono text-amber-400">₹{summary.totalSupplierDebt.toFixed(2)}</p>
          </div>
          <span className="text-[10px] text-text-secondary">Owed to local hardware/electrical stores</span>
        </div>

        {/* Net Cash Position */}
        <div className="glass-panel p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Net Position</span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Net Balance
            </span>
          </div>
          <div className="my-2">
            <p className="text-2xl font-black font-mono text-emerald-400">₹{summary.netBalance.toFixed(2)}</p>
          </div>
          <span className="text-[10px] text-text-secondary">Receivables minus Payables</span>
        </div>

      </div>

      {/* 3. Search & Tabs Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 relative flex items-center max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search party name, phone, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-surface border border-navy-border focus:border-primary rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none transition-all placeholder:text-text-muted"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Entries' },
            { id: 'customer', label: 'Customers (ग्राहक)' },
            { id: 'supplier', label: 'Suppliers (दुकानदार)' },
            { id: 'pending', label: 'Pending Only' },
            { id: 'settled', label: 'Settled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-navy-surface border border-navy-border text-text-muted hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Ledger Table List */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-xs text-text-muted">Loading Khata entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-16 text-center text-text-muted text-xs">
            No ledger entries found. Tap "Add Udhaar Entry" above to record customer or supplier balances.
          </div>
        ) : (
          <div className="divide-y divide-navy-border/60">
            {filteredEntries.map(entry => {
              const isCustomer = entry.partyType === 'customer';
              const isSettled = entry.status === 'settled';

              return (
                <div
                  key={entry._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-navy-surface/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      isSettled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isCustomer
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isSettled ? '✓' : isCustomer ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{entry.partyName}</h3>
                        <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase border ${
                          isCustomer ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}>
                          {isCustomer ? 'Customer Credit' : 'Supplier Debt'}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {entry.title} • <span className="font-mono text-white">+91 {entry.partyPhone}</span>
                      </p>
                      {entry.dueDate && (
                        <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due: {new Date(entry.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3.5">
                    <div className="text-right">
                      <p className={`text-sm font-mono font-black ${
                        isSettled ? 'text-text-muted line-through' : isCustomer ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        ₹{entry.amount.toFixed(2)}
                      </p>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        isSettled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {entry.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCustomer && !isSettled && (
                        <button
                          onClick={() => handleSendWhatsAppReminder(entry)}
                          className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors text-xs font-bold flex items-center gap-1"
                          title="Send WhatsApp Payment Collection Link"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleSettle(entry._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSettled
                            ? 'bg-navy-surface border border-navy-border text-text-muted hover:text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        {isSettled ? 'Mark Pending' : '✓ Settle'}
                      </button>

                      <button
                        onClick={() => handleDeleteEntry(entry._id)}
                        className="p-1.5 text-text-muted hover:text-danger rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Create Khata Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full shadow-2xl border border-navy-border flex flex-col gap-4 text-left animate-fade-in">
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Add New Udhaar Record
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateEntry} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-text-secondary block mb-1">Party Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, partyType: 'customer', type: 'you_gave' })}
                    className={`py-2 rounded-xl font-bold border ${
                      formData.partyType === 'customer'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-navy-surface border-navy-border text-text-muted hover:text-white'
                    }`}
                  >
                    Customer Credit (ग्राहक)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, partyType: 'supplier', type: 'you_gave' })}
                    className={`py-2 rounded-xl font-bold border ${
                      formData.partyType === 'supplier'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-navy-surface border-navy-border text-text-muted hover:text-white'
                    }`}
                  >
                    Supplier Debt (दुकानदार)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-text-secondary block mb-1">Party Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Hardware or Mr. Verma"
                  value={formData.partyName}
                  onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                  className="w-full bg-navy-surface border border-navy-border rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-text-secondary block mb-1">WhatsApp Phone (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formData.partyPhone}
                  onChange={(e) => setFormData({ ...formData, partyPhone: e.target.value })}
                  className="w-full bg-navy-surface border border-navy-border rounded-xl px-3 py-2 text-white font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-text-secondary block mb-1">Description / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2.5mm copper wire reel & conduit purchase"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-navy-surface border border-navy-border rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-text-secondary block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-navy-surface border border-navy-border rounded-xl px-3 py-2 text-white font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-text-secondary block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-navy-surface border border-navy-border rounded-xl px-3 py-2 text-white font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-text-secondary hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white font-bold rounded-xl shadow transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Udhaar Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
