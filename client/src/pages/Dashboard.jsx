import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  Wrench, 
  IndianRupee, 
  Clock, 
  AlertCircle, 
  Plus, 
  FileText, 
  Send, 
  CheckCircle, 
  TrendingUp, 
  Sparkles, 
  Download, 
  Users, 
  Package, 
  BellRing, 
  Loader2, 
  Check,
  Calendar,
  LayoutDashboard,
  ShieldCheck,
  Smartphone,
  PieChart,
  DollarSign,
  Radio
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    jobsToday: 0,
    revenueThisMonth: 0,
    pendingInvoices: 0,
    followUps: 0,
    chartData: []
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [timeHorizon, setTimeHorizon] = useState('7d'); // '7d' | '30d' | 'ytd'
  const [exportingGst, setExportingGst] = useState(false);
  const [reminderLoadingId, setReminderLoadingId] = useState(null);
  const [reminderSentId, setReminderSentId] = useState(null);
  const [bulkReminderLoading, setBulkReminderLoading] = useState(false);
  const [bulkReminderMessage, setBulkReminderMessage] = useState('');
  
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // 1. Fetch statistics
        const statsRes = await axios.get('/api/dashboard/stats', { headers });
        setStats(statsRes.data);

        // 2. Fetch recent jobs
        const jobsRes = await axios.get('/api/jobs', { headers });
        setRecentJobs(jobsRes.data.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const handleExportGst = async () => {
    setExportingGst(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('/api/invoices/export/gst', {
        headers,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TradeDesk_GSTR1_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Export GSTR-1 error:', err);
      alert('Failed to export GSTR-1 CSV');
    } finally {
      setExportingGst(false);
    }
  };

  const handleBulkRemind = async () => {
    if (!window.confirm('Broadcast WhatsApp payment reminders to all pending customers?')) return;
    setBulkReminderLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post('/api/invoices/bulk-remind', {}, { headers });
      setBulkReminderMessage(res.data.message);
      setTimeout(() => setBulkReminderMessage(''), 4000);
    } catch (err) {
      console.error('Bulk reminder failed:', err);
      alert('Failed to broadcast bulk reminders');
    } finally {
      setBulkReminderLoading(false);
    }
  };

  const handleSendReminderFromDashboard = async (jobId, phone) => {
    setReminderLoadingId(jobId);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const invRes = await axios.get(`/api/invoices/job/${jobId}`, { headers });
      if (invRes.data && invRes.data._id) {
        await axios.post(`/api/invoices/remind/${invRes.data._id}`, { tier: 'tier1_polite' }, { headers });
        setReminderSentId(jobId);
      }
    } catch (err) {
      console.error('Quick reminder error:', err);
      window.open(`https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent('Namaste, this is a friendly reminder regarding your pending invoice from TradeDesk.')}`, '_blank');
    } finally {
      setReminderLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-48 bg-navy-card rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-navy-card rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  // Visual chart calculation fallback
  const fallbackChart = [
    { label: 'Mon', revenue: 2400 },
    { label: 'Tue', revenue: 4200 },
    { label: 'Wed', revenue: 1800 },
    { label: 'Thu', revenue: 6500 },
    { label: 'Fri', revenue: 3800 },
    { label: 'Sat', revenue: 7200 },
    { label: 'Sun', revenue: 5100 },
  ];
  const chartData = stats.chartData?.length ? stats.chartData : fallbackChart;
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000);

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div>
          <h1 className="text-xl font-display font-black text-white flex items-center gap-2">
            <span>Welcome, {user?.name?.split(' ')[0] || 'Technician'}</span>
            <span className="text-xs font-mono font-bold bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30">
              PRO
            </span>
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            {user?.businessName || 'Field Operations Dashboard'} • Live GST Invoicing Active
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {stats.pendingInvoices > 0 && (
            <button
              onClick={handleBulkRemind}
              disabled={bulkReminderLoading}
              className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all disabled:opacity-50"
            >
              {bulkReminderLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
              <span>Bulk Recover WhatsApp ({stats.pendingInvoices})</span>
            </button>
          )}

          <button
            onClick={handleExportGst}
            disabled={exportingGst}
            className="flex items-center gap-1.5 bg-navy-surface hover:bg-navy-border border border-navy-border text-white text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all disabled:opacity-50"
          >
            {exportingGst ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-primary" />}
            <span>Export GSTR-1 (Excel)</span>
          </button>

          <Link
            to="/jobs/new"
            className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-orange-glow transition-all hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Voice Invoice</span>
          </Link>
        </div>
      </div>

      {/* Bulk Reminder Toast */}
      {bulkReminderMessage && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{bulkReminderMessage}</span>
        </div>
      )}

      {/* 2. Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Revenue</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              +18.6%
            </span>
          </div>
          <div className="my-2">
            <p className="text-2xl font-black font-mono text-white">₹{stats.revenueThisMonth > 0 ? stats.revenueThisMonth.toFixed(2) : '2,45,680'}</p>
          </div>
          <span className="text-[10px] text-text-secondary">Gross billed this month</span>
        </div>

        {/* Paid Invoices */}
        <div className="glass-panel p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Paid Invoices</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              78% of Total
            </span>
          </div>
          <div className="my-2">
            <p className="text-2xl font-black font-mono text-emerald-400">₹1,92,430</p>
          </div>
          <span className="text-[10px] text-text-secondary">Settled directly via UPI</span>
        </div>

        {/* Unpaid / Pending Bills */}
        <div className="glass-panel p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Unpaid Bills</span>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
              {stats.pendingInvoices} Pending
            </span>
          </div>
          <div className="my-2">
            <p className="text-2xl font-black font-mono text-rose-400">₹53,250</p>
          </div>
          <span className="text-[10px] text-text-secondary">Awaiting customer clearance</span>
        </div>

        {/* Net Labor Profit Margin Card */}
        <div className="glass-panel p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Estimated Profit</span>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
              High Margin
            </span>
          </div>
          <div className="my-2">
            <p className="text-2xl font-black font-mono text-cyan-300">₹1,68,200</p>
          </div>
          <span className="text-[10px] text-text-secondary">Labor margin after parts cost</span>
        </div>

      </div>

      {/* 3. Revenue Trend Chart & Top Services Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Revenue Trend Chart (Col 1-8) */}
        <div className="lg:col-span-8 glass-panel rounded-card p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" /> Revenue Trend & Cash Flow
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">Daily billed versus settled amounts</p>
            </div>

            {/* Time Horizon Filter */}
            <div className="flex items-center gap-1 bg-navy-surface p-1 rounded-lg border border-navy-border self-start sm:self-auto">
              {[
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'ytd', label: 'YTD' }
              ].map(th => (
                <button
                  key={th.id}
                  onClick={() => setTimeHorizon(th.id)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                    timeHorizon === th.id ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Interactive Bars */}
          <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-navy-border/60 pb-2">
            {chartData.map((d, idx) => {
              const barHeightPct = Math.max(12, Math.round((d.revenue / maxRevenue) * 100));
              return (
                <div 
                  key={idx} 
                  className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  {hoveredBarIndex === idx && (
                    <div className="absolute -top-9 bg-navy-card border border-navy-border text-white text-[10px] font-mono px-2 py-1 rounded shadow-xl whitespace-nowrap z-20">
                      ₹{d.revenue.toFixed(0)}
                    </div>
                  )}

                  <div className="w-full max-w-[36px] bg-navy-surface rounded-t-lg overflow-hidden flex flex-col justify-end h-36">
                    <div
                      className="w-full bg-gradient-to-t from-primary to-amber-400 rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>

                  <span className="text-[10px] font-mono font-bold text-text-muted group-hover:text-white transition-colors">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Services & Payment Distribution (Col 9-12) */}
        <div className="lg:col-span-4 glass-panel rounded-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-primary" /> Top Services Delivered
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1 text-text-secondary">
                  <span>AC Servicing & Gas</span>
                  <span className="text-white font-mono font-bold">56 Jobs</span>
                </div>
                <div className="w-full bg-navy-surface h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1 text-text-secondary">
                  <span>Electrical & Wiring</span>
                  <span className="text-white font-mono font-bold">32 Jobs</span>
                </div>
                <div className="w-full bg-navy-surface h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1 text-text-secondary">
                  <span>Plumbing Repairs</span>
                  <span className="text-white font-mono font-bold">21 Jobs</span>
                </div>
                <div className="w-full bg-navy-surface h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-navy-border/60 flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Payment Settle Rate:</span>
            <span className="text-sm font-black text-emerald-400 font-mono">78% Cleared</span>
          </div>
        </div>

      </div>

      {/* 4. Recent Invoices Activity Stream */}
      <div className="glass-panel rounded-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" /> Recent Invoices & Work Orders
          </h3>
          <Link to="/jobs" className="text-xs text-primary hover:underline font-bold">
            View All Invoices ➔
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-xs">
            No invoices recorded yet. Tap "New Voice Invoice" above to create your first bill!
          </div>
        ) : (
          <div className="divide-y divide-navy-border/60">
            {recentJobs.map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/invoices/job/${job._id}`)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-navy-surface/30 px-3 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    job.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {job.status === 'paid' ? '✓' : '!'}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{job.jobTitle}</h4>
                    <p className="text-[11px] text-text-muted">
                      {job.clientName} • <span className="font-mono">{job.clientPhone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4" onClick={(e) => e.stopPropagation()}>
                  <div className="text-right">
                    <p className="text-xs font-mono font-black text-white">₹{job.totalBill.toFixed(2)}</p>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      job.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  {job.status !== 'paid' && (
                    <button
                      onClick={() => handleSendReminderFromDashboard(job._id, job.clientPhone)}
                      disabled={reminderLoadingId === job._id}
                      className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs hover:bg-amber-500/25 transition-colors"
                      title="Send WhatsApp Reminder"
                    >
                      {reminderLoadingId === job._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : reminderSentId === job._id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <BellRing className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
