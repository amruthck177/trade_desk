import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  Users, 
  Plus, 
  Phone, 
  Wrench, 
  IndianRupee, 
  CheckCircle2, 
  Trash2, 
  Loader2,
  DollarSign,
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react';

export default function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Karigar / Technician',
    specialization: 'General AC & Electrical',
    defaultCommissionPct: 40
  });
  const [submitting, setSubmitting] = useState(false);

  // Payout Modal
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  const token = useAuthStore((state) => state.token);

  const fetchStaff = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('/api/staff', { headers });
      setStaff(res.data || []);
    } catch (err) {
      console.error('Fetch staff failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post('/api/staff', formData, { headers });
      setIsCreateOpen(false);
      setFormData({
        name: '',
        phone: '',
        role: 'Karigar / Technician',
        specialization: 'General AC & Electrical',
        defaultCommissionPct: 40
      });
      fetchStaff();
    } catch (err) {
      console.error('Create staff error:', err);
      alert('Failed to save staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayout = async (e) => {
    e.preventDefault();
    if (!payoutAmount || !selectedStaff) return;
    setPayoutLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`/api/staff/${selectedStaff._id}/payout`, { amount: payoutAmount }, { headers });
      setIsPayoutOpen(false);
      setPayoutAmount('');
      setSelectedStaff(null);
      fetchStaff();
    } catch (err) {
      console.error('Payout error:', err);
      alert('Failed to record payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Delete this staff record?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/staff/${id}`, { headers });
      fetchStaff();
    } catch (err) {
      console.error('Delete staff error:', err);
    }
  };

  const totalCommissions = staff.reduce((sum, s) => sum + (s.totalCommissionEarned || 0), 0);
  const totalPendingPayouts = staff.reduce((sum, s) => sum + (s.balancePending || 0), 0);
  const totalJobsDone = staff.reduce((sum, s) => sum + (s.totalJobsDone || 0), 0);

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-display font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Technicians & Karigar Dispatch Team</span>
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage your crew of ustaads, technicians, and helpers with labor commission tracking
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-orange-glow transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Crew Member</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-panel p-5 rounded-card flex flex-col justify-between">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Active Crew Members</span>
          <p className="text-2xl font-black font-mono text-white my-2">{staff.length} Technicians</p>
          <span className="text-[10px] text-text-secondary">{totalJobsDone} total jobs completed</span>
        </div>

        <div className="glass-panel p-5 rounded-card flex flex-col justify-between">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Commission Earned</span>
          <p className="text-2xl font-black font-mono text-emerald-400 my-2">₹{totalCommissions.toFixed(2)}</p>
          <span className="text-[10px] text-text-secondary">Labor commission pooled</span>
        </div>

        <div className="glass-panel p-5 rounded-card flex flex-col justify-between">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Pending Payouts</span>
          <p className="text-2xl font-black font-mono text-amber-400 my-2">₹{totalPendingPayouts.toFixed(2)}</p>
          <span className="text-[10px] text-text-secondary">Awaiting weekly crew settlement</span>
        </div>

      </div>

      {/* 3. Staff List Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-xs text-text-muted">Loading team members...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="p-16 text-center text-text-muted text-xs">
            No technicians or helpers added yet. Tap "Add Crew Member" above to start dispatching jobs.
          </div>
        ) : (
          <div className="divide-y divide-navy-border/60">
            {staff.map(member => (
              <div
                key={member._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-navy-surface/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-base">
                    {member.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{member.name}</h3>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-navy-surface text-cyan-400 border border-cyan-500/30">
                        {member.role}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Specialization: <b className="text-white">{member.specialization}</b> • Phone: <span className="font-mono text-white">+91 {member.phone}</span>
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Default Commission: <span className="font-bold text-emerald-400">{member.defaultCommissionPct}% of Labor</span> • Jobs Done: <span className="font-bold text-white">{member.totalJobsDone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <p className="text-xs text-text-muted">Pending Payout:</p>
                    <p className="text-sm font-black font-mono text-amber-400">₹{(member.balancePending || 0).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedStaff(member);
                        setIsPayoutOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Pay Payout
                    </button>

                    <button
                      onClick={() => handleDeleteStaff(member._id)}
                      className="p-1.5 text-text-muted hover:text-danger rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Add Crew Member Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full shadow-2xl border border-navy-border flex flex-col gap-4 text-left animate-fade-in">
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Add New Technician / Helper
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-text-muted hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateStaff} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-text-secondary block mb-1">Technician Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mukesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-navy-surface border border-navy-border rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-text-secondary block mb-1">WhatsApp Phone (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-navy-surface border border-navy-border rounded-xl px-3 py-2 text-white font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-text-secondary block mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-navy-surface border border-navy-border rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none"
                  >
                    <option value="Master / Ustaad">Master / Ustaad</option>
                    <option value="Karigar / Technician">Karigar / Technician</option>
                    <option value="Helper / Apprentice">Helper / Apprentice</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-text-secondary block mb-1">Labor Commission (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="40"
                    value={formData.defaultCommissionPct}
                    onChange={(e) => setFormData({ ...formData, defaultCommissionPct: e.target.value })}
                    className="w-full bg-navy-surface border border-navy-border rounded-xl px-3 py-2 text-white font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-text-secondary block mb-1">Specialization / Skills</label>
                <input
                  type="text"
                  placeholder="e.g. Inverter AC PCB & Gas Charging"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full bg-navy-surface border border-navy-border rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-border">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-text-secondary hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white font-bold rounded-xl shadow transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Crew Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Record Payout Modal */}
      {isPayoutOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-navy-border flex flex-col gap-4 text-left animate-fade-in">
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Record Payout to {selectedStaff.name}
              </h3>
              <button onClick={() => setIsPayoutOpen(false)} className="text-text-muted hover:text-white text-xs">✕</button>
            </div>

            <p className="text-xs text-text-secondary">
              Pending commission balance: <b className="text-amber-400 font-mono">₹{selectedStaff.balancePending.toFixed(2)}</b>
            </p>

            <form onSubmit={handleRecordPayout} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-text-secondary block mb-1">Payout Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder={selectedStaff.balancePending.toString()}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-navy-surface border border-navy-border rounded-xl px-3 py-2 text-white font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-border">
                <button
                  type="button"
                  onClick={() => setIsPayoutOpen(false)}
                  className="px-4 py-2 text-text-secondary hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition-all active:scale-95 disabled:opacity-50"
                >
                  {payoutLoading ? 'Saving...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
