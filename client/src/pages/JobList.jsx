import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  Wrench, 
  Search, 
  Trash2, 
  FileText, 
  SlidersHorizontal,
  ChevronRight,
  Plus,
  Loader2,
  Calendar,
  IndianRupee,
  BellRing,
  Check,
  Download,
  Tag
} from 'lucide-react';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('all'); // 'all' | 'invoice' | 'estimate'
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'draft' | 'unpaid' | 'paid'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'price-high' | 'price-low'
  const [reminderLoadingId, setReminderLoadingId] = useState(null);
  const [reminderSentId, setReminderSentId] = useState(null);
  const [exportingGst, setExportingGst] = useState(false);

  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, [token]);

  const fetchJobs = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('/api/jobs', { headers });
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (err) {
      console.error('Failed to retrieve jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run filters whenever dependencies change
  useEffect(() => {
    let result = [...jobs];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j => 
        j.clientName.toLowerCase().includes(q) || 
        j.jobTitle.toLowerCase().includes(q) || 
        j.clientPhone.includes(q)
      );
    }

    // Document type filter
    if (docTypeFilter !== 'all') {
      result = result.filter(j => (j.documentType || 'invoice') === docTypeFilter);
    }

    // Tab status filter
    if (activeTab !== 'all') {
      result = result.filter(j => j.status === activeTab);
    }

    // Sort sorting logic
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.totalBill - a.totalBill);
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.totalBill - b.totalBill);
    }

    setFilteredJobs(result);
  }, [searchQuery, docTypeFilter, activeTab, sortBy, jobs]);

  const handleDeleteJob = async (jobId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this job record?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/jobs/${jobId}`, { headers });
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (err) {
      console.error('Delete job failed:', err);
    }
  };

  const handleRouteInvoice = async (jobId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`/api/invoices/job/${jobId}`, { headers });
      navigate(`/invoices/${res.data._id}`);
    } catch (err) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const genRes = await axios.post(`/api/invoices/generate/${jobId}`, {}, { headers });
        navigate(`/invoices/${genRes.data._id}`);
      } catch (e) {
        console.error('Route invoice failed:', e);
      }
    }
  };

  const handleSendReminder = async (jobId, phone, e) => {
    if (e) e.stopPropagation();
    setReminderLoadingId(jobId);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const invRes = await axios.get(`/api/invoices/job/${jobId}`, { headers });
      if (invRes.data && invRes.data._id) {
        await axios.post(`/api/invoices/remind/${invRes.data._id}`, { tier: 'tier1_polite' }, { headers });
        setReminderSentId(jobId);
      }
    } catch (err) {
      window.open(`https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent('Namaste, this is a friendly reminder regarding your pending invoice from TradeDesk.')}`, '_blank');
    } finally {
      setReminderLoadingId(null);
    }
  };

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
      alert('Failed to export GSTR-1');
    } finally {
      setExportingGst(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 text-left animate-pulse">
        <div className="h-10 w-48 bg-navy-card rounded" />
        <div className="h-12 bg-navy-card rounded-xl w-full" />
        <div className="h-[400px] bg-navy-card rounded-card border border-navy-border w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-text-primary">Invoices & Quotations Directory</h1>
          <p className="text-xs text-text-secondary mt-1">Manage, search, and track all your trade invoices and estimates.</p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportGst}
            disabled={exportingGst}
            className="flex items-center gap-1.5 bg-navy-card hover:bg-navy-surface border border-navy-border text-text-primary text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all disabled:opacity-50"
          >
            {exportingGst ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-primary" />}
            <span>Export GSTR-1</span>
          </button>

          <Link
            to="/jobs/new"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-orange-glow transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </Link>
        </div>
      </div>

      {/* FILTER & CONTROLS TOOLBAR */}
      <div className="bg-navy-card border border-navy-border p-4 rounded-card flex flex-col gap-3.5 shadow-card">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by client name, phone, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-surface border border-navy-border focus:border-primary outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary transition-all placeholder:text-text-muted"
            />
          </div>

          <div className="flex items-center gap-2 border border-navy-border bg-navy-surface rounded-xl px-3 py-2 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none text-text-primary font-semibold text-xs border-none cursor-pointer"
            >
              <option value="newest" className="bg-navy-card">Newest First</option>
              <option value="oldest" className="bg-navy-card">Oldest First</option>
              <option value="price-high" className="bg-navy-card">Price: High to Low</option>
              <option value="price-low" className="bg-navy-card">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Filter Pills: Doc Types & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-navy-border/60">
          
          {/* Document Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-text-muted font-semibold">Type:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'invoice', label: 'Invoices' },
              { id: 'estimate', label: 'Estimates' }
            ].map((dt) => (
              <button
                key={dt.id}
                onClick={() => setDocTypeFilter(dt.id)}
                className={`py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  docTypeFilter === dt.id 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-navy-surface text-text-secondary hover:text-text-primary border border-navy-border'
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-text-muted font-semibold">Status:</span>
            {['all', 'draft', 'unpaid', 'paid'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-navy-surface text-text-secondary hover:text-text-primary border border-navy-border'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* JOBS LIST GRID / TABLE */}
      <div className="bg-navy-card border border-navy-border rounded-card shadow-card overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-3">
            <Search className="w-10 h-10 text-text-muted opacity-30 mb-1" />
            <p className="text-sm font-bold text-text-primary">No Matching Documents Found</p>
            <p className="text-xs text-text-secondary">Try adjusting your search keywords or filter status.</p>
          </div>
        ) : (
          <div className="divide-y divide-navy-border/60">
            {filteredJobs.map((job) => {
              const isEst = job.documentType === 'estimate';
              return (
                <div
                  key={job._id}
                  onClick={() => handleRouteInvoice(job._id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-navy-surface/40 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isEst
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : job.status === 'paid' 
                          ? 'bg-success/10 text-success border border-success/30' 
                          : 'bg-danger/10 text-danger border border-danger/30'
                    }`}>
                      {isEst ? 'EST' : job.status === 'paid' ? '✓' : '!'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                          {job.jobTitle}
                        </h3>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase border ${
                          isEst ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-primary/20 text-primary border-primary/40'
                        }`}>
                          {job.documentType || 'invoice'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-secondary mt-0.5">
                        <span className="font-semibold text-text-primary">{job.clientName}</span>
                        <span>•</span>
                        <span className="font-mono">{job.clientPhone}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px] text-text-muted">
                          <Calendar className="w-3 h-3" />
                          {new Date(job.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className="text-sm font-mono font-black text-text-primary">₹{(job.totalBill || 0).toFixed(2)}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        isEst
                          ? 'bg-blue-500/20 text-blue-400'
                          : job.status === 'paid' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                      }`}>
                        {isEst ? 'Estimate' : job.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {!isEst && job.status !== 'paid' && (
                        <button
                          onClick={(e) => handleSendReminder(job._id, job.clientPhone, e)}
                          disabled={reminderLoadingId === job._id}
                          className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs transition-colors"
                          title="Send WhatsApp Payment Reminder"
                        >
                          {reminderLoadingId === job._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : reminderSentId === job._id ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <BellRing className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDeleteJob(job._id, e)}
                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                    </div>
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
