import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Smartphone, 
  Star, 
  QrCode, 
  FileText, 
  Calendar, 
  Phone, 
  Sparkles, 
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function CustomerPortal() {
  const { invoiceNumber } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100 for before/after comparison

  useEffect(() => {
    const fetchPublicInvoice = async () => {
      try {
        const res = await axios.get(`/api/invoices/public/${invoiceNumber}`);
        setData(res.data);
      } catch (err) {
        console.error('Fetch public invoice failed:', err);
        setError('Invoice or Quotation not found. Please verify the link.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicInvoice();
  }, [invoiceNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-mono">Loading Verified Invoice & Payment Portal...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Document Unavailable</h2>
        <p className="text-xs text-slate-400 max-w-sm">{error || 'Could not load document.'}</p>
      </div>
    );
  }

  const { invoice, job, business } = data;
  const isEstimate = job.documentType === 'estimate';
  const isPaid = job.status === 'paid';
  const payableAmount = job.balanceDue > 0 ? job.balanceDue : (isPaid ? 0 : job.totalBill);
  const upiId = business?.upiId || 'sharmacool@upi';
  const businessTitle = business?.businessName || business?.name || 'TradeDesk Services';
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessTitle)}&am=${payableAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}`;
  const upiQrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiDeepLink)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Container */}
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* Header Branding */}
        <div className="bg-[#121B30] border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <h1 className="text-lg font-black text-white">{businessTitle}</h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">Verified Field Service Provider</p>
            {business?.phone && <p className="text-xs text-slate-300 font-mono mt-0.5">📞 +91 {business.phone}</p>}
          </div>

          <div className="text-left sm:text-right">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border inline-block ${
              isPaid
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : isEstimate
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
            }`}>
              {isPaid ? 'PAID IN FULL ✓' : isEstimate ? 'ESTIMATE / QUOTATION' : 'PAYMENT DUE'}
            </span>
            <p className="text-xs font-mono font-bold text-white mt-1.5">{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* 1. Verified Digital 30-Day Warranty Certificate Card */}
        <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 p-5 rounded-2xl shadow-lg flex items-center justify-between text-left gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">30-Day Workmanship Warranty Active</h3>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded">VERIFIED</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                All labor & parts provided by <b>{businessTitle}</b> are covered under service warranty.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Interactive Before & After Photo Comparison Slider */}
        {(job.beforePhotoUrl || job.afterPhotoUrl) && (
          <div className="bg-[#121B30] border border-slate-800 p-5 rounded-2xl shadow-xl text-left flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Work Proof: Before & After Slider
              </span>
              <span className="text-[10px] text-slate-400">Slide to compare</span>
            </div>

            {/* Slider Container */}
            <div className="relative h-56 sm:h-72 w-full rounded-xl overflow-hidden select-none border border-slate-700">
              {/* After Photo (Background) */}
              <img
                src={job.afterPhotoUrl || job.beforePhotoUrl}
                alt="After Repair"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 bg-black/75 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400">
                After Work ✓
              </span>

              {/* Before Photo (Foreground Clipped) */}
              {job.beforePhotoUrl && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={job.beforePhotoUrl}
                    alt="Before Repair"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <span className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] font-bold text-rose-400">
                    Before Repair
                  </span>
                </div>
              )}

              {/* Slider Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white shadow-lg text-[10px] font-bold">
                  ↔
                </div>
              </div>

              {/* Invisible Range Input for touch / drag */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            </div>
          </div>
        )}

        {/* 3. Itemized Bill Summary & Split Advance Breakdown */}
        <div className="bg-[#121B30] border border-slate-800 p-6 rounded-2xl shadow-xl text-left flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Work Order</span>
              <h3 className="text-sm font-bold text-white">{job.jobTitle}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Customer</span>
              <p className="text-xs font-bold text-white">{job.clientName}</p>
            </div>
          </div>

          {/* Line Items List */}
          <div className="space-y-2 text-xs divide-y divide-slate-800/60">
            {job.laborHours > 0 && (
              <div className="pt-2 flex justify-between text-slate-300">
                <span>Labor / Technician Service ({job.laborHours} hrs)</span>
                <span className="font-mono font-bold text-white">₹{(job.laborHours * job.hourlyRate).toFixed(2)}</span>
              </div>
            )}
            {(job.materials || []).map((m, i) => (
              <div key={i} className="pt-2 flex justify-between text-slate-300">
                <span>{m.name}</span>
                <span className="font-mono font-bold text-white">₹{m.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals & Advance Calculation */}
          <div className="border-t border-slate-700 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Gross Subtotal:</span>
              <span className="font-mono text-slate-200">₹{(job.subtotal || 0).toFixed(2)}</span>
            </div>

            {job.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Discount Applied:</span>
                <span className="font-mono">- ₹{job.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>GST ({job.gstRate}%):</span>
              <span className="font-mono text-slate-200">₹{(job.gstAmount || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-2">
              <span>Total Bill:</span>
              <span className="font-mono text-base text-orange-400">₹{(job.totalBill || 0).toFixed(2)}</span>
            </div>

            {job.advancePaid > 0 && (
              <>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Advance Token Paid:</span>
                  <span className="font-mono">- ₹{job.advancePaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-rose-400 border-t border-slate-800 pt-1.5">
                  <span>Balance Payable:</span>
                  <span className="font-mono text-base">₹{job.balanceDue.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4. Dynamic Instant UPI Payment Box (If not paid) */}
        {!isPaid && payableAmount > 0 && (
          <div className="bg-[#121B30] border border-orange-500/40 p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-orange-400" /> Instant UPI Payment
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                0% Extra Surcharge
              </span>
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-2xl border border-slate-300 w-48 h-48 flex items-center justify-center">
              <img src={upiQrImgUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Payable Amount</span>
              <p className="text-2xl font-black font-mono text-orange-400">₹{payableAmount.toFixed(2)}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">Payee UPI: {upiId}</p>
            </div>

            {/* Mobile UPI App Intent Button */}
            <a
              href={upiDeepLink}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Smartphone className="w-4 h-4" /> Open in Google Pay / PhonePe / Paytm
            </a>
          </div>
        )}

        {/* 5. Google 5-Star Review Button */}
        <div className="bg-[#121B30] border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div>
            <div className="flex items-center gap-1 text-amber-400 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <h4 className="text-xs font-bold text-white">Satisfied with the service?</h4>
            <p className="text-[11px] text-slate-400">Support our local business with a 5-star Google review!</p>
          </div>

          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(businessTitle + ' reviews')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition-all active:scale-95 flex-shrink-0"
          >
            <Star className="w-3.5 h-3.5 fill-current" /> Leave 5-Star Review ➔
          </a>
        </div>

        {/* 6. Download Official PDF */}
        <div className="flex justify-center">
          <a
            href={`/api/invoices/download/${invoice._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4 text-orange-400" /> Download Official Tax Invoice PDF
          </a>
        </div>

      </div>

    </div>
  );
}
