import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Sparkles, 
  QrCode, 
  BellRing, 
  ExternalLink, 
  Smartphone, 
  PenTool, 
  Calendar, 
  MapPin, 
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  AlertTriangle,
  Volume2,
  Printer,
  Copy
} from 'lucide-react';
import { playSoundboxChime } from '../components/SoundboxAudio';
import ThermalReceipt from '../components/ThermalReceipt';

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
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);
  const [selectedReminderTier, setSelectedReminderTier] = useState('tier1_polite');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showThermalModal, setShowThermalModal] = useState(false);
  const [converting, setConverting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

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
      
      setStatusVal(nextStatus);
      setJob(prev => ({ ...prev, status: nextStatus, balanceDue: nextStatus === 'paid' ? 0 : (prev.totalBill - prev.advancePaid) }));
      
      if (nextStatus === 'paid') {
        playSoundboxChime(job.balanceDue > 0 ? job.balanceDue : job.totalBill);
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleSimulatePaymentWebhook = async () => {
    setSimulatingPayment(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`/api/invoices/simulate-payment/${invoice._id}`, {}, { headers });
      setStatusVal('paid');
      setJob(res.data.job);
      playSoundboxChime(res.data.job.totalBill);
    } catch (err) {
      console.error('Simulate payment failed:', err);
    } finally {
      setSimulatingPayment(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!window.confirm('Convert this Estimate / Quotation into an official Tax Invoice?')) return;
    setConverting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`/api/jobs/${job._id}/convert`, {}, { headers });
      const genRes = await axios.post(`/api/invoices/generate/${job._id}`, {}, { headers });
      setJob(res.data.job);
      setInvoice(genRes.data);
      setStatusVal('unpaid');
      alert('Successfully converted Estimate to Tax Invoice!');
    } catch (err) {
      console.error('Conversion failed:', err);
      alert('Failed to convert estimate');
    } finally {
      setConverting(false);
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
      const portalUrl = `${window.location.origin}/pay/${invoice.invoiceNumber}`;
      window.open(`https://wa.me/91${job.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Namaste ${job.clientName}, your invoice ${invoice.invoiceNumber} for ₹${job.totalBill.toFixed(2)} is ready: ${portalUrl}`)}`, '_blank');
    } finally {
      setWhatsAppSending(false);
    }
  };

  const handleSendReminder = async () => {
    setReminderSending(true);
    setReminderSuccess(false);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`/api/invoices/remind/${invoice._id}`, { tier: selectedReminderTier }, { headers });
      setReminderSuccess(true);
      setTimeout(() => setShowReminderModal(false), 1200);
    } catch (err) {
      console.error('WhatsApp reminder dispatch failed:', err);
      const portalUrl = `${window.location.origin}/pay/${invoice.invoiceNumber}`;
      window.open(`https://wa.me/91${job?.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Namaste ${job.clientName}, pending invoice reminder for ₹${job.balanceDue || job.totalBill}: ${portalUrl}`)}`, '_blank');
    } finally {
      setReminderSending(false);
    }
  };

  const handleCopyCustomerPortalLink = () => {
    const portalUrl = `${window.location.origin}/pay/${invoice.invoiceNumber}`;
    navigator.clipboard.writeText(portalUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleDownloadPDF = () => {
    window.open(`/api/invoices/download/${invoice._id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-text-muted">Loading Invoice & Payment Details...</p>
      </div>
    );
  }

  const isEstimate = job?.documentType === 'estimate';
  const laborCost = (Number(job?.laborHours) || 0) * (Number(job?.hourlyRate) || 0);
  const upiId = user?.upiId || 'sharmacool@upi';
  const businessTitle = user?.businessName || user?.name || 'TradeDesk Services';
  const payableAmount = job?.balanceDue > 0 ? job.balanceDue : (job?.totalBill || 0);
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessTitle)}&am=${payableAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`${isEstimate ? 'Estimate' : 'Invoice'} ${invoice?.invoiceNumber || ''}`)}`;
  const upiQrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`;

  return (
    <div className="max-w-6xl mx-auto text-left flex flex-col gap-6">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/jobs')}
            className="p-2 rounded-xl bg-navy-surface hover:bg-navy-border border border-navy-border text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-display font-black text-white flex items-center gap-2">
              <span>{invoice?.invoiceNumber}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                isEstimate
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : statusVal === 'paid' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}>
                {isEstimate ? 'ESTIMATE' : statusVal}
              </span>
            </h1>
            <p className="text-[11px] text-text-secondary">
              Client: <span className="font-semibold text-white">{job?.clientName}</span> • Phone: <span className="font-mono text-white">{job?.clientPhone}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Public Customer Portal Link */}
          <button
            onClick={handleCopyCustomerPortalLink}
            className="px-3 py-2 bg-navy-surface hover:bg-navy-border border border-navy-border text-xs font-bold text-white rounded-xl flex items-center gap-1.5 transition-all"
            title="Copy Public Link with Before/After Slider & Warranty"
          >
            {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{linkCopied ? 'Portal Link Copied!' : 'Customer Portal Link'}</span>
          </button>

          {/* Soundbox Voice Trigger */}
          <button
            onClick={() => playSoundboxChime(job.totalBill)}
            className="px-3 py-2 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Play Audio Soundbox Speech Chime"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Soundbox</span>
          </button>

          {/* 58mm Thermal Print Trigger */}
          <button
            onClick={() => setShowThermalModal(true)}
            className="px-3 py-2 bg-navy-surface hover:bg-navy-border border border-navy-border text-xs font-bold text-white rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Thermal Slip</span>
          </button>

          {isEstimate ? (
            <button
              onClick={handleConvertToInvoice}
              disabled={converting}
              className="px-4 py-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              {converting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Convert to Tax Invoice</span>
            </button>
          ) : (
            <button
              onClick={handleStatusToggle}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                statusVal === 'paid'
                  ? 'bg-navy-surface border border-navy-border text-text-secondary hover:text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              {statusVal === 'paid' ? 'Mark as Unpaid' : '✓ Mark as Paid'}
            </button>
          )}

          {!isEstimate && statusVal !== 'paid' && (
            <button
              onClick={() => setShowReminderModal(true)}
              className="px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Send Reminder</span>
            </button>
          )}

          <button
            onClick={handleWhatsAppSend}
            disabled={whatsAppSending}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            {whatsAppSending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : whatsAppSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{whatsAppSuccess ? 'Sent on WhatsApp' : 'Send WhatsApp'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-3 py-2 bg-navy-surface hover:bg-navy-border border border-navy-border text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* 2. Main Dual View: A4 Invoice (Left) + Scan & Pay Stand (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Live A4 Skeuomorphic Document Sheet (Col 1-8) */}
        <div className="lg:col-span-8 bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-200 relative overflow-hidden font-sans">
          
          {/* Watermark */}
          {statusVal === 'paid' ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-25 border-4 border-emerald-500 text-emerald-600 font-display font-black text-4xl sm:text-6xl uppercase tracking-widest px-8 py-3 rounded-2xl opacity-25 pointer-events-none select-none">
              PAID IN FULL
            </div>
          ) : isEstimate ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-25 border-4 border-blue-500 text-blue-600 font-display font-black text-4xl sm:text-5xl uppercase tracking-widest px-8 py-3 rounded-2xl opacity-15 pointer-events-none select-none">
              ESTIMATE ONLY
            </div>
          ) : null}

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <h2 className="text-xl font-black text-slate-950 tracking-tight">
                  {user?.businessName || 'SHARMA COOL SERVICES'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">Field Service Provider • Contractor</p>
              {user?.phone && <p className="text-xs text-slate-600 mt-0.5 font-mono">+91 {user.phone}</p>}
              {user?.gstNumber && <p className="text-xs text-slate-600 font-mono">GSTIN: {user.gstNumber}</p>}
              {user?.businessAddress && <p className="text-xs text-slate-500 max-w-xs">{user.businessAddress}</p>}
            </div>

            <div className="text-left sm:text-right">
              <span className={`text-xs font-bold uppercase tracking-wider block ${isEstimate ? 'text-blue-600' : 'text-primary'}`}>
                {isEstimate ? 'Estimate / Quotation' : 'Tax Invoice'}
              </span>
              <h3 className="text-lg font-bold font-mono text-slate-900 mt-0.5">{invoice?.invoiceNumber}</h3>
              <div className="text-xs text-slate-500 mt-1.5 space-y-0.5">
                <p>Date: <span className="font-semibold text-slate-700">{new Date(job?.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                {job?.paymentDueDate && (
                  <p>{isEstimate ? 'Valid Until' : 'Due Date'}: <span className="font-semibold text-slate-700">{new Date(job.paymentDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                )}
                <p>Supply State: <span className="font-semibold text-slate-700">{job?.stateOfSupply || 'Delhi'} ({job?.taxType === 'inter_state' ? 'Inter-State' : 'Intra-State'})</span></p>
              </div>
            </div>
          </div>

          {/* Bill-To & Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block mb-0.5">Billed To</span>
              <p className="text-sm font-bold text-slate-900">{job?.clientName}</p>
              <p className="text-slate-600 font-mono mt-0.5">+91 {job?.clientPhone}</p>
              {job?.clientAddress && <p className="text-slate-500 mt-0.5">{job.clientAddress}</p>}
              {job?.clientGstin && <p className="text-slate-600 font-mono mt-0.5">GSTIN: {job.clientGstin}</p>}
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block mb-0.5">Scope of Work</span>
              <p className="text-sm font-bold text-slate-900">{job?.jobTitle}</p>
              {job?.assignedStaff?.name && (
                <p className="text-[11px] text-cyan-700 font-semibold mt-0.5">
                  👷 Assigned: {job.assignedStaff.name} ({job.assignedStaff.role})
                </p>
              )}
              {job?.isAmc && (
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  🔁 Recurring AMC: Every {job.amcFrequencyMonths || 6} Months
                </p>
              )}
              {job?.notes && <p className="text-slate-500 mt-0.5 italic">"{job.notes}"</p>}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-4 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Qty / Hrs</th>
                  <th className="py-2 text-center">Rate (₹)</th>
                  <th className="py-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {job?.laborHours > 0 && (
                  <tr>
                    <td className="py-2.5 font-medium text-slate-800">
                      1. Labor / Technician Service Charges
                    </td>
                    <td className="py-2.5 text-center text-slate-600">{job.laborHours} hrs</td>
                    <td className="py-2.5 text-center text-slate-600 font-mono">₹{job.hourlyRate.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900 font-mono">₹{laborCost.toFixed(2)}</td>
                  </tr>
                )}

                {(job?.materials || []).map((mat, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-medium text-slate-800">{i + 2}. {mat.name}</td>
                    <td className="py-2.5 text-center text-slate-600">1</td>
                    <td className="py-2.5 text-center text-slate-600 font-mono">₹{mat.price.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900 font-mono">₹{mat.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals, Discounts & Advance Token Calculation */}
          <div className="flex justify-end pt-3 border-t border-slate-200">
            <div className="w-full max-w-xs space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sub Total:</span>
                <span className="font-mono font-medium text-slate-900">₹{(job?.subtotal || 0).toFixed(2)}</span>
              </div>
              
              {job?.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span className="font-mono">- ₹{job.discountAmount.toFixed(2)}</span>
                </div>
              )}

              {job?.taxType === 'inter_state' ? (
                <div className="flex justify-between text-slate-600">
                  <span>IGST ({job?.gstRate}%):</span>
                  <span className="font-mono font-medium text-slate-900">₹{(job?.igstAmount || job?.gstAmount || 0).toFixed(2)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST ({(job?.gstRate / 2).toFixed(1)}%):</span>
                    <span className="font-mono font-medium text-slate-900">₹{(job?.cgstAmount || (job?.gstAmount / 2) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST ({(job?.gstRate / 2).toFixed(1)}%):</span>
                    <span className="font-mono font-medium text-slate-900">₹{(job?.sgstAmount || (job?.gstAmount / 2) || 0).toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-sm font-bold text-slate-950 border-t-2 border-slate-900 pt-2">
                <span>{isEstimate ? 'Total Estimated:' : 'Total Amount:'}</span>
                <span className="font-mono text-base text-primary">₹{(job?.totalBill || 0).toFixed(2)}</span>
              </div>

              {job?.advancePaid > 0 && (
                <>
                  <div className="flex justify-between text-emerald-600 font-semibold pt-1">
                    <span>Advance Token Paid:</span>
                    <span className="font-mono">- ₹{job.advancePaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-rose-600 border-t border-slate-200 pt-1">
                    <span>Balance Due:</span>
                    <span className="font-mono text-base">₹{(job?.balanceDue || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Before & After Proof Photo Gallery */}
          {(job?.beforePhotoUrl || job?.afterPhotoUrl) && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Job Proof Photos</span>
              <div className="grid grid-cols-2 gap-3">
                {job.beforePhotoUrl && (
                  <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
                    <img src={job.beforePhotoUrl} alt="Before" className="h-20 w-full object-cover rounded-lg" />
                    <span className="text-[9px] font-bold text-slate-500 mt-1 block">Before Repair</span>
                  </div>
                )}
                {job.afterPhotoUrl && (
                  <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
                    <img src={job.afterPhotoUrl} alt="After" className="h-20 w-full object-cover rounded-lg" />
                    <span className="text-[9px] font-bold text-emerald-600 mt-1 block">Finished Work</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Signature & Seal */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-3 text-xs">
            <div className="text-slate-500 text-[10px]">
              <p className="font-bold text-slate-700 mb-0.5">Terms & Warranty:</p>
              <p>• 30-day workmanship warranty.</p>
              <p>• Warranty on parts as per manufacturer.</p>
            </div>
            
            <div className="text-right flex flex-col items-end">
              {job?.customerSignature ? (
                <div className="border border-slate-200 rounded-lg p-1.5 bg-slate-50">
                  <img src={job.customerSignature} alt="Signature" className="h-10 w-32 object-contain" />
                  <span className="text-[8px] font-mono text-slate-400 block mt-0.5">Customer Signature Verified</span>
                </div>
              ) : (
                <div className="text-right">
                  <p className="font-display font-bold text-slate-800 italic text-sm">Thank You!</p>
                  <span className="text-[9px] text-slate-400">TradeDesk Verified Document</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT: Standalone "SCAN & PAY" Phone Stand Card (Col 9-12) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          <div className="glass-panel rounded-2xl p-6 text-center flex flex-col items-center gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between w-full border-b border-navy-border/80 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-primary" /> SCAN & PAY
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Instant UPI
              </span>
            </div>

            {/* High Resolution Dynamic QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 w-44 h-44 flex items-center justify-center">
              <img
                src={upiQrImgUrl}
                alt="Dynamic UPI QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-text-muted uppercase font-mono block">Payee UPI VPA</span>
              <p className="text-xs font-mono font-bold text-white">{upiId}</p>
              <p className="text-xs font-bold text-primary font-mono mt-1">Amount: ₹{payableAmount.toFixed(2)}</p>
            </div>

            {/* UPI App Icons Badge */}
            <div className="flex items-center justify-center gap-3 text-xs font-semibold text-text-secondary bg-navy-surface/80 px-4 py-2 rounded-xl border border-navy-border w-full">
              <span>Google Pay</span> • <span>PhonePe</span> • <span>Paytm</span>
            </div>

            {/* Mobile 1-Click Intent Pay Button */}
            <a
              href={upiDeepLink}
              className="w-full py-3 bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-orange-glow transition-all active:scale-95"
            >
              <Smartphone className="w-4 h-4" /> Open in UPI App
            </a>

            {/* Simulate Instant Payment Webhook */}
            {statusVal !== 'paid' && (
              <button
                onClick={handleSimulatePaymentWebhook}
                disabled={simulatingPayment}
                className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                {simulatingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>⚡ Simulate UPI Scan & Pay</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure • Instant • Trusted</span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Multi-tier WhatsApp Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-card max-w-md w-full text-left shadow-2xl border border-navy-border flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-400" /> Send WhatsApp Payment Reminder
              </h3>
              <button onClick={() => setShowReminderModal(false)} className="text-text-muted hover:text-white text-xs">✕</button>
            </div>

            <p className="text-xs text-text-secondary">
              Select reminder urgency level for <b>{job?.clientName}</b> (+91 {job?.clientPhone}):
            </p>

            <div className="space-y-2">
              {[
                { id: 'tier1_polite', label: '1. Polite Friendly Notice', desc: 'Namaste, gentle request regarding outstanding invoice.' },
                { id: 'tier2_due', label: '2. Payment Due Today Alert', desc: 'Alert notifying that invoice payment is due today.' },
                { id: 'tier3_urgent', label: '3. Urgent Overdue Notice', desc: 'Critical alert for bills overdue > 7 days with direct UPI link.' }
              ].map(t => (
                <label
                  key={t.id}
                  onClick={() => setSelectedReminderTier(t.id)}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    selectedReminderTier === t.id
                      ? 'bg-primary/15 border-primary text-white shadow-sm'
                      : 'bg-navy-surface border-navy-border text-text-secondary hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="tier"
                    checked={selectedReminderTier === t.id}
                    onChange={() => setSelectedReminderTier(t.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold block text-white">{t.label}</span>
                    <span className="text-[11px] text-text-muted">{t.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-navy-border">
              <button
                type="button"
                onClick={() => setShowReminderModal(false)}
                className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendReminder}
                disabled={reminderSending}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black rounded-xl shadow transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {reminderSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : reminderSuccess ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>{reminderSuccess ? 'Dispatched!' : 'Send Reminder'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Thermal Slip Modal */}
      {showThermalModal && (
        <ThermalReceipt
          job={job}
          user={user}
          invoice={invoice}
          onClose={() => setShowThermalModal(false)}
        />
      )}

    </div>
  );
}
