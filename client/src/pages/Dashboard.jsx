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
  TrendingDown
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

        // 2. Fetch jobs
        const jobsRes = await axios.get('/api/jobs', { headers });
        setRecentJobs(jobsRes.data.slice(0, 5)); // show latest 5
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 text-left animate-pulse">
        <div className="h-10 w-48 bg-navy-card rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-navy-card rounded-card border border-navy-border/40" />
          ))}
        </div>
        <div className="h-[300px] bg-navy-card rounded-card border border-navy-border/40 w-full" />
        <div className="h-[200px] bg-navy-card rounded-card border border-navy-border/40 w-full" />
      </div>
    );
  }

  // Find max revenue for chart scaling
  const maxRevenue = Math.max(...stats.chartData.map(d => d.revenue), 1000);

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* 1. GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-text-primary">
            Good Morning, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Here's what is happening with your trades business today.
          </p>
        </div>
        <Link
          to="/jobs/new"
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-5 rounded-button shadow-orange-glow/10 hover:scale-102 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice Note</span>
        </Link>
      </div>

      {/* 2. STATS GRID CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Jobs Today */}
        <div className="bg-navy-card border border-navy-border/60 p-5 rounded-card relative overflow-hidden flex flex-col justify-between shadow-card-glow hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Jobs Today</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Wrench className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-mono font-black text-text-primary">{stats.jobsToday}</p>
            <div className="flex items-center gap-1 text-[10px] text-success font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> <span>+12% vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Month Revenue */}
        <div className="bg-navy-card border border-navy-border/60 p-5 rounded-card relative overflow-hidden flex flex-col justify-between shadow-card-glow hover:border-success/20 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Month Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
              <IndianRupee className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-mono font-black text-text-primary">₹{stats.revenueThisMonth}</p>
            <div className="flex items-center gap-1 text-[10px] text-success font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> <span>+24% vs last month</span>
            </div>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-navy-card border border-navy-border/60 p-5 rounded-card relative overflow-hidden flex flex-col justify-between shadow-card-glow hover:border-secondary/20 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Pending Bills</span>
            <div className="w-8 h-8 rounded-lg bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-mono font-black text-text-primary">{stats.pendingInvoices}</p>
            <div className="flex items-center gap-1 text-[10px] text-text-secondary font-semibold mt-1">
              <span>Awaiting payment</span>
            </div>
          </div>
        </div>

        {/* Follow-up Alerts */}
        <div className="bg-navy-card border border-navy-border/60 p-5 rounded-card relative overflow-hidden flex flex-col justify-between shadow-card-glow hover:border-danger/20 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Follow-ups Due</span>
            <div className="w-8 h-8 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center text-danger">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-mono font-black text-text-primary">{stats.followUps}</p>
            <div className="flex items-center gap-1 text-[10px] text-danger font-semibold mt-1">
              {stats.followUps > 0 ? (
                <span>⚠️ Unpaid over 3 days</span>
              ) : (
                <span>✓ All settled</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. REVENUE ANALYTICS INTERACTIVE CHART */}
      <div className="bg-navy-card border border-navy-border/60 p-6 rounded-card shadow-card-glow">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Weekly Revenue</h3>
            <p className="text-[11px] text-text-secondary mt-0.5">Calculated based on settled payments</p>
          </div>

          <div className="flex bg-navy-elevated/60 border border-navy-border/80 p-0.5 rounded-xl text-[10px] font-bold text-text-secondary">
            <span className="py-1 px-3 bg-primary text-white rounded-lg shadow-sm">Daily</span>
            <span className="py-1 px-3 hover:text-text-primary cursor-pointer">Weekly</span>
            <span className="py-1 px-3 hover:text-text-primary cursor-pointer">Monthly</span>
          </div>
        </div>

        {/* Interactive Custom SVG/HTML Chart */}
        <div className="relative h-60 flex items-end gap-3 sm:gap-6 px-4 pt-10 border-b border-navy-border/40 pb-1 w-full justify-between">
          
          {/* Tooltip Overlay */}
          {hoveredBarIndex !== null && (
            <div 
              className="absolute bg-primary border border-primary/20 text-white font-mono text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-orange-glow pointer-events-none z-30 transition-all duration-150 transform -translate-x-1/2"
              style={{
                left: `${(hoveredBarIndex / (stats.chartData.length - 1)) * 80 + 10}%`,
                top: `${160 - (stats.chartData[hoveredBarIndex].revenue / maxRevenue) * 140}px`
              }}
            >
              ₹{stats.chartData[hoveredBarIndex].revenue}
            </div>
          )}

          {stats.chartData.map((data, idx) => {
            const pct = (data.revenue / maxRevenue) * 100;
            // minimum height 5% for rendering zero revenue bars
            const heightVal = pct > 0 ? `${pct}%` : '5%';
            return (
              <div 
                key={idx}
                className="flex-1 flex flex-col items-center gap-3 group h-full justify-end cursor-pointer"
                onMouseEnter={() => setHoveredBarIndex(idx)}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                {/* SVG/HTML fill bar */}
                <div 
                  className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 relative ${
                    hoveredBarIndex === idx 
                      ? 'bg-gradient-to-t from-primary/80 to-primary shadow-orange-glow' 
                      : 'bg-navy-elevated/80 group-hover:bg-primary/50'
                  }`}
                  style={{ height: heightVal }}
                />
                
                {/* Day label */}
                <span className="text-[10px] font-semibold text-text-secondary group-hover:text-text-primary">
                  {data.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. RECENT JOBS TABLE */}
      <div className="bg-navy-card border border-navy-border/60 rounded-card shadow-card-glow overflow-hidden">
        <div className="p-5 border-b border-navy-border/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Recent Activity</h3>
          <Link to="/jobs" className="text-xs font-bold text-primary hover:underline">
            View All Jobs
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          /* Empty state */
          <div className="p-12 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-navy-elevated border border-navy-border rounded-2xl flex items-center justify-center text-text-secondary text-2xl animate-pulse">
              📋
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">No Jobs Recorded Yet</p>
              <p className="text-xs text-text-secondary mt-1">Record your first job and we'll generate an invoice automatically.</p>
            </div>
            <Link
              to="/jobs/new"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-5 rounded-button shadow-orange-glow/10 mt-2"
            >
              Record First Job
            </Link>
          </div>
        ) : (
          /* Table list */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-navy-elevated/40 border-b border-navy-border/50 text-text-secondary">
                  <th className="p-4 font-bold">Client / Job Details</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-border/40">
                {recentJobs.map((job) => {
                  const statusColor = job.status === 'paid' ? 'bg-success/15 text-success' : 'bg-danger/10 text-danger';
                  return (
                    <tr key={job._id} className="hover:bg-navy-elevated/20 transition-all">
                      <td className="p-4">
                        <p className="font-bold text-text-primary">{job.clientName}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">{job.jobTitle}</p>
                      </td>
                      <td className="p-4 text-text-secondary font-mono">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-mono font-bold text-text-primary">
                        ₹{job.totalBill}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-badge text-[10px] font-black uppercase ${statusColor}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={async () => {
                            // Find invoice linked to job
                            try {
                              const headers = { Authorization: `Bearer ${token}` };
                              const res = await axios.get(`/api/invoices/job/${job._id}`, { headers });
                              navigate(`/invoices/${res.data._id}`);
                            } catch (err) {
                              // If no invoice generated, generate it now
                              try {
                                const headers = { Authorization: `Bearer ${token}` };
                                const genRes = await axios.post(`/api/invoices/generate/${job._id}`, {}, { headers });
                                navigate(`/invoices/${genRes.data._id}`);
                              } catch (e) {
                                console.error('Failed to route to invoice:', e);
                              }
                            }
                          }}
                          className="inline-flex items-center gap-1.5 bg-navy-elevated hover:bg-navy-border text-text-primary border border-navy-border/80 text-[10px] font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
