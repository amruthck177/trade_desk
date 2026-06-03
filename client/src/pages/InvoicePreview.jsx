import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  ArrowLeft, 
  FileText, 
  Send, 
  Download, 
  Check, 
  Loader2, 
  Share2, 
  IndianRupee,
  Lock,
  Sparkles
} from 'lucide-react';

export default function InvoicePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [invoice, setInvoice] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Local actions state
  const [statusVal, setStatusVal] = useState('unpaid');
  const [whatsAppSending, setWhatsAppSending] = useState(false);
  const [whatsAppSuccess, setWhatsAppSuccess] = useState(false);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // 1. Fetch invoice Details
        const invRes = await axios.get(`/api/invoices/${id}`, { headers });
        setInvoice(invRes.data);
        
        // 2. Fetch Job Details
        const jobRes = await axios.get(`/api/jobs/${invRes.data.jobId}`, { headers });
        setJob(jobRes.data);
        setStatusVal(jobRes.data.status);
      } catch (err) {
        console.error('Failed to load invoice/job data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id, token]);

  const handleStatusToggle = async () => {
    const nextStatus = statusVal === 'paid' ? 'unpaid' : 'paid';
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`/api/jobs/${job._id}`, { status: nextStatus }, { headers });
      
      // Update local state
      setStatusVal(nextStatus);
      setJob(prev => ({ ...prev, status: nextStatus }));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleWhatsAppSend = async () => {
    setWhatsAppSending(true);
    setWhatsAppSuccess(false);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`/api/invoices/send-whatsapp/${invoice._id}`, {}, { headers });
      setWhatsAppSuccess(true);
    } catch (err) {
      console.error('WhatsApp dispatch failed:', err);
    } finally {
      setWhatsAppSending(false);
    }
  };

  const handleDownloadPDF = () => {
    // Open in a new tab for native PDF downloading/rendering
    window.open(`/api/invoices/download/${invoice._id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 text-left animate-pulse">
        <div className="h-6 w-32 bg-navy-card rounded" />
        <div className="h-[500px] bg-navy-card rounded-card border border-navy-border/40 w-full" />
      </div>
    );
  }

  const laborCost = job ? job.laborHours * job.hourlyRate : 0;
  const materialsCost = job ? job.materials.reduce((sum, m) => sum + m.price, 0) : 0;

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-border/40 pb-5">
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs Directory</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Status badge toggler */}
          <button
            onClick={handleStatusToggle}
            className={`text-xs font-bold font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              statusVal === 'paid' 
                ? 'bg-success/15 border-success/30 text-success' 
                : 'bg-danger/10 border-danger/25 text-danger'
            }`}
          >
            Mark {statusVal === 'paid' ? 'Unpaid' : 'Paid'}
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 bg-navy-card hover:bg-navy-elevated text-text-primary border border-navy-border/80 text-xs font-bold py-1.5 px-3.5 rounded-xl cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>

          {/* Send WhatsApp */}
          <button
            onClick={handleWhatsAppSend}
            disabled={whatsAppSending}
            className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all cursor-pointer ${
              whatsAppSuccess 
                ? 'bg-success/20 text-success border border-success/20' 
                : 'bg-primary hover:bg-primary-hover text-white shadow-orange-glow/10'
            }`}
          >
            {whatsAppSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : whatsAppSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{whatsAppSuccess ? 'Sent' : 'WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* INVOICE CARD DOCUMENT (White-paper style) */}
      <div className="bg-white text-navy-card rounded-card p-6 sm:p-10 shadow-card-glow max-w-2xl mx-auto w-full relative overflow-hidden min-h-[700px] border border-navy-border/20">
        
        {/* Paid Watermark */}
        {statusVal === 'paid' && (
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.1] rotate-[-30deg]">
            <span className="text-6xl sm:text-8xl font-display font-black text-success border-8 border-success px-6 py-2 rounded-2xl tracking-widest">
              PAID
            </span>
          </div>
        )}

        {/* 1. Logo / Brand Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy-primary flex items-center justify-center text-primary text-base">
              {user?.logoUrl ? (
                <img src={`http://localhost:5000/${user.logoUrl}`} alt="Logo" className="w-full h-full object-cover rounded-lg" />
              ) : (
                '🛠️'
              )}
            </div>
            <span className="font-display font-extrabold text-lg text-navy-primary">
              {user?.businessName || 'TradeDesk'}
            </span>
          </div>

          <div className="text-left sm:text-right font-mono text-[10px] text-gray-500 flex flex-col gap-0.5">
            <p className="font-bold text-navy-card">VENDOR SUMMARY</p>
            <p>Name: {user?.name}</p>
            {user?.phone && <p>Phone: +91 {user.phone}</p>}
            {user?.gstNumber && <p>GSTIN: {user.gstNumber}</p>}
          </div>
        </div>

        <div className="h-px bg-gray-200 my-6" />

        {/* 2. Meta summary details */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-xs">
          <div className="text-left">
            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[9px] mb-1">INVOICE SPECIFICS</h3>
            <p className="text-base font-mono font-bold text-navy-primary">{invoice?.invoiceNumber}</p>
            <p className="text-gray-500 mt-1">Date: {job && new Date(job.createdAt).toLocaleDateString()}</p>
            
            {/* Small status tag */}
            <span className={`inline-block px-2.5 py-0.5 rounded-badge text-[9px] font-black uppercase mt-2.5 ${
              statusVal === 'paid' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/25'
            }`}>
              {statusVal}
            </span>
          </div>

          <div className="text-left sm:text-right">
            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[9px] mb-1">BILL CLIENT</h3>
            <p className="font-bold text-navy-primary">{job?.clientName}</p>
            <p className="text-gray-500 mt-0.5">Phone: +91 {job?.clientPhone}</p>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-6" />

        {/* 3. Job Description */}
        <div className="text-xs text-left mb-6">
          <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px] block mb-1">Service Performed</span>
          <p className="font-semibold text-navy-primary text-sm">{job?.jobTitle}</p>
        </div>

        {/* 4. Table details */}
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 text-xs">
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 p-3 font-bold text-gray-600">
            <span className="col-span-6">Description</span>
            <span className="col-span-2 text-right">Rate</span>
            <span className="col-span-2 text-right">Qty/Hrs</span>
            <span className="col-span-2 text-right">Total</span>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Labor charges */}
            {job && job.laborHours > 0 && (
              <div className="grid grid-cols-12 p-3 text-gray-700">
                <span className="col-span-6 text-left font-semibold">Labor / Technical Service Charges</span>
                <span className="col-span-2 text-right font-mono">₹{job.hourlyRate.toFixed(2)}</span>
                <span className="col-span-2 text-right font-mono">{job.laborHours} hrs</span>
                <span className="col-span-2 text-right font-mono font-bold">₹{laborCost.toFixed(2)}</span>
              </div>
            )}

            {/* Materials charges */}
            {job && job.materials.map((mat, idx) => (
              <div key={idx} className="grid grid-cols-12 p-3 text-gray-700">
                <span className="col-span-6 text-left">{mat.name}</span>
                <span className="col-span-2 text-right font-mono">₹{mat.price.toFixed(2)}</span>
                <span className="col-span-2 text-right font-mono">1</span>
                <span className="col-span-2 text-right font-mono font-bold">₹{mat.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Totals calculations */}
        <div className="flex justify-end mb-8 text-xs">
          <div className="w-56 flex flex-col gap-2.5">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span className="font-mono">₹{job?.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>GST ({job?.gstRate}%):</span>
              <span className="font-mono">₹{job?.gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-navy-card font-bold border-t border-gray-200 pt-2.5 text-sm bg-orange-50/50 p-2.5 rounded-lg">
              <span>Total Bill:</span>
              <span className="font-mono text-primary">₹{job?.totalBill.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 6. Payment UPI Section */}
        <div className="border-t border-gray-200 pt-6 text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-xs">
            <h4 className="font-bold text-navy-primary uppercase tracking-wider text-[9px] mb-1">PAYMENT UPI ID</h4>
            {user?.upiId ? (
              <>
                <p className="font-mono font-bold text-primary">{user.upiId}</p>
                <p className="text-[10px] text-gray-400 mt-1">Scan UPI QR to pay directly to vendor wallet.</p>
              </>
            ) : (
              <p className="text-gray-400 italic">No UPI address configured. Pay vendor directly.</p>
            )}
          </div>

          {/* Simple UPI QR code mockup */}
          {user?.upiId && (
            <div className="w-16 h-16 border-2 border-navy-card rounded p-1 flex items-center justify-center relative">
              <div className="w-full h-full bg-navy-card rounded flex flex-wrap gap-0.5 p-0.5 justify-center content-center select-none pointer-events-none opacity-90">
                <div className="w-4 h-4 bg-white" />
                <div className="w-4 h-4 bg-white" />
                <div className="w-4 h-4 bg-white" />
                <div className="w-3.5 h-3.5 bg-white" />
                <div className="w-3.5 h-3.5 bg-white" />
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
