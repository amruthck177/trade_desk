import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Calendar
} from 'lucide-react';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'draft' | 'unpaid' | 'paid'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'price-high' | 'price-low'

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
  }, [searchQuery, activeTab, sortBy, jobs]);

  // Swipe / Delete handler
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job record?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/jobs/${jobId}`, { headers });
      // Purge local list
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
      // If invoice doesn't exist, create it
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const genRes = await axios.post(`/api/invoices/generate/${jobId}`, {}, { headers });
        navigate(`/invoices/${genRes.data._id}`);
      } catch (e) {
        console.error('Route invoice failed:', e);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 text-left animate-pulse">
        <div className="h-10 w-48 bg-navy-card rounded" />
        <div className="h-12 bg-navy-card rounded-xl w-full" />
        <div className="h-[400px] bg-navy-card rounded-card border border-navy-border/40 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-text-primary">Jobs Directory</h1>
          <p className="text-xs text-text-secondary mt-1">Manage and track your customer billings and status.</p>
        </div>
        <Link
          to="/jobs/new"
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-5 rounded-button shadow-orange-glow/10 hover:scale-102 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Job Record</span>
        </Link>
      </div>

      {/* FILTER & CONTROLS TOOLBAR */}
      <div className="bg-navy-card border border-navy-border/60 p-4.5 rounded-card flex flex-col gap-4 shadow-card-glow">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          {/* Search bar */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-text-secondary absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by client name, job title, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary transition-all placeholder:text-text-secondary/50"
            />
          </div>

          {/* Sort selection dropdown */}
          <div className="flex items-center gap-2 border border-navy-border/85 bg-navy-elevated/20 rounded-xl px-3 py-2 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-text-secondary" />
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

        {/* Filter Pills Toggles */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'draft', 'unpaid', 'paid'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 px-3.5 rounded-badge text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-primary text-white scale-102' 
                  : 'bg-navy-elevated/40 text-text-secondary hover:text-text-primary border border-navy-border/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* JOBS LIST GRID / TABLE */}
      <div className="bg-navy-card border border-navy-border/60 rounded-card shadow-card-glow overflow-hidden">
        {filteredJobs.length === 0 ? (
          /* Empty State graphic */
          <div className="p-16 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-navy-elevated border border-navy-border rounded-2xl flex items-center justify-center text-text-secondary text-2xl animate-pulse">
              🔍
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">No Matching Jobs Found</p>
              <p className="text-xs text-text-secondary mt-1">Try resetting your search query or status filter pills.</p>
            </div>
          </div>
        ) : (
          /* List content rendering */
          <div className="divide-y divide-navy-border/40">
            {filteredJobs.map((job) => {
              const statusColor = job.status === 'paid' ? 'bg-success/15 text-success' : 'bg-danger/10 text-danger';
              return (
                <div 
                  key={job._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-navy-elevated/10 transition-all text-left"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-navy-elevated border border-navy-border/80 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                      <Wrench className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{job.clientName}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{job.jobTitle}</p>
                      <div className="flex items-center gap-3.5 mt-2 text-[10px] text-text-secondary font-mono">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{job.laborHours} hrs labor</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 pl-12 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-mono font-black text-text-primary">₹{job.totalBill}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-badge text-[9px] font-black uppercase mt-1 ${statusColor}`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* View Invoice */}
                      <button
                        onClick={() => handleRouteInvoice(job._id)}
                        className="p-2 bg-navy-elevated hover:bg-navy-border text-primary rounded-xl border border-navy-border/80 transition-all cursor-pointer"
                        title="View Invoice"
                      >
                        <FileText className="w-4.5 h-4.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl border border-danger/15 transition-all cursor-pointer"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
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
