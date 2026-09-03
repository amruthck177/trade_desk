import React from 'react';
import { Printer, X } from 'lucide-react';

export default function ThermalReceipt({ job, user, invoice, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  const laborCost = (Number(job?.laborHours) || 0) * (Number(job?.hourlyRate) || 0);
  const upiId = user?.upiId || 'sharmacool@upi';
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(user?.businessName || user?.name || 'TradeDesk')}&am=${(job?.balanceDue > 0 ? job.balanceDue : job?.totalBill || 0).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice?.invoiceNumber || ''}`)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiDeepLink)}`;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black p-6 rounded-2xl max-w-xs w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        
        {/* Actions Bar (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 print:hidden">
          <span className="text-xs font-bold text-gray-700">58mm Thermal Print Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-gray-800"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-black text-xs font-bold">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Slip Content (58mm ESC/POS Monochromatic Format) */}
        <div className="text-center font-mono text-[11px] leading-tight flex flex-col gap-2">
          
          {/* Header */}
          <div className="border-b border-dashed border-black pb-2">
            <h2 className="text-sm font-black uppercase tracking-tight">{user?.businessName || 'TRADEDESK SERVICES'}</h2>
            <p className="text-[10px] mt-0.5">Ph: +91 {user?.phone || '9876543210'}</p>
            {user?.gstNumber && <p className="text-[9px]">GSTIN: {user.gstNumber}</p>}
            <p className="text-[9px] mt-1">================================</p>
            <p className="font-bold">{job?.documentType === 'estimate' ? 'ESTIMATE / QUOTE' : 'TAX INVOICE'}</p>
            <p>No: {invoice?.invoiceNumber || 'INV-0000'}</p>
            <p>Date: {new Date(job?.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
          </div>

          {/* Client Info */}
          <div className="text-left border-b border-dashed border-black pb-1.5 text-[10px]">
            <p><b>Client:</b> {job?.clientName}</p>
            <p><b>Phone:</b> +91 {job?.clientPhone}</p>
            <p><b>Work:</b> {job?.jobTitle}</p>
          </div>

          {/* Items Table */}
          <div className="text-left border-b border-dashed border-black pb-2">
            <div className="flex justify-between font-bold text-[10px] border-b border-black pb-1">
              <span>Item</span>
              <span>Amt(Rs)</span>
            </div>
            {job?.laborHours > 0 && (
              <div className="flex justify-between mt-1">
                <span>Labor ({job.laborHours}h)</span>
                <span>{laborCost.toFixed(2)}</span>
              </div>
            )}
            {(job?.materials || []).map((m, i) => (
              <div key={i} className="flex justify-between mt-0.5">
                <span className="truncate max-w-[120px]">{m.name}</span>
                <span>{m.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals & Advance Split */}
          <div className="text-right space-y-0.5 border-b border-dashed border-black pb-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {(job?.subtotal || 0).toFixed(2)}</span>
            </div>
            {job?.discountAmount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>- Rs. {job.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST ({job?.gstRate}%):</span>
              <span>Rs. {(job?.gstAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-black border-t border-black pt-1">
              <span>TOTAL:</span>
              <span>Rs. {(job?.totalBill || 0).toFixed(2)}</span>
            </div>
            {job?.advancePaid > 0 && (
              <>
                <div className="flex justify-between text-[10px]">
                  <span>Adv Paid:</span>
                  <span>- Rs. {job.advancePaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-black">
                  <span>BAL DUE:</span>
                  <span>Rs. {(job?.balanceDue || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Scannable UPI QR for Thermal */}
          <div className="flex flex-col items-center gap-1 py-1">
            <img src={qrUrl} alt="UPI QR" className="w-24 h-24" />
            <p className="text-[9px] font-bold">SCAN WITH ANY UPI APP</p>
            <p className="text-[8px]">UPI: {upiId}</p>
          </div>

          <div className="border-t border-dashed border-black pt-1 text-[9px]">
            <p>30-Day Workmanship Warranty</p>
            <p className="font-bold mt-1">THANK YOU! VISIT AGAIN</p>
          </div>

        </div>

      </div>
    </div>
  );
}
