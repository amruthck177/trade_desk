import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  Calendar, 
  Search, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck,
  RefreshCw,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AmcTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('all'); // 'all' | 'due_soon' | 'completed'

  const token = useAuthStore((state) => state.token);

  const fetchAmcJobs = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('/api/jobs?amc=true', { headers });
      setJobs(res.data || []);
    } catch (err) {
      console.error('Fetch AMC failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmcJobs();
  }, [token]);

  const handleSendAmcReminder = (job) => {
    const nextDateStr = new Date(job.amcNextDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const text = `Namaste ${job.clientName}, your periodic maintenance service for "${job.jobTitle}" is scheduled for ${nextDateStr}. Please reply to confirm your preferred time slot for technician visit. - TradeDesk Services`;
    window.open(`https://wa.me/91${job.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const now = new Date();

  const filteredJobs = jobs.filter(j => {
    const q = searchQuery.toLowerCase();
    const matches = j.clientName.toLowerCase().includes(q) || j.jobTitle.toLowerCase().includes(q) || j.clientPhone.includes(q);
    if (!matches) return false;

    if (tab === 'due_soon') {
      if (!j.amcNextDate) return false;
      const diffDays = Math.ceil((new Date(j.amcNextDate) - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-display font-black text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            <span>Annual Maintenance Contracts (AMC Tracker)</span>
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage recurring 3-month & 6-month maintenance contracts and automated service renewals
          </p>
        </div>

        <Link
          to="/jobs/new"
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-orange-glow transition-all active:scale-95 self-start sm:self-auto"
        >
          <span>+ New AMC Job</span>
        </Link>
      </div>

      {/* 2. Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 relative flex items-center max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search AMC client, phone, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-surface border border-navy-border focus:border-primary rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none transition-all placeholder:text-text-muted"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All Active AMCs' },
            { id: 'due_soon', label: 'Due Within 30 Days' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                tab === t.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-navy-surface border border-navy-border text-text-muted hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. AMC List Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-xs text-text-muted">Loading AMC contracts...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-16 text-center text-text-muted text-xs">
            No active AMC recurring contracts found. Enable "Recurring AMC Contract" when creating an invoice.
          </div>
        ) : (
          <div className="divide-y divide-navy-border/60">
            {filteredJobs.map(job => {
              const nextDate = job.amcNextDate ? new Date(job.amcNextDate) : null;
              const diffDays = nextDate ? Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24)) : 0;
              const isDueSoon = diffDays <= 30 && diffDays >= 0;
              const isOverdue = diffDays < 0;

              return (
                <div
                  key={job._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-navy-surface/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold ${
                      isOverdue
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : isDueSoon
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      <Calendar className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{job.clientName}</h3>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-primary/15 text-primary border border-primary/30 font-mono">
                          Every {job.amcFrequencyMonths || 6} Months
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {job.jobTitle} • <span className="font-mono text-white">+91 {job.clientPhone}</span>
                      </p>
                      {nextDate && (
                        <p className={`text-[10px] font-bold mt-0.5 flex items-center gap-1 ${
                          isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          <Clock className="w-3 h-3" />
                          Next Service Due: {nextDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ({diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days overdue`})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Contract Value:</p>
                      <p className="text-sm font-black font-mono text-white">₹{job.totalBill.toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => handleSendAmcReminder(job)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send AMC WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
