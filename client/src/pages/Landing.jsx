import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  ArrowRight, 
  Check, 
  Star, 
  Sparkles, 
  Send, 
  LayoutDashboard, 
  Wrench, 
  FileText, 
  QrCode, 
  Download, 
  Smartphone, 
  Users, 
  Package, 
  IndianRupee, 
  ShieldCheck, 
  Clock, 
  Zap, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2,
  TrendingUp,
  Search,
  ExternalLink,
  Phone,
  Layers,
  ChevronRight,
  PenTool
} from 'lucide-react';

export default function Landing() {
  const [selectedLanguage, setSelectedLanguage] = useState('Hinglish');
  const [catalogTab, setCatalogTab] = useState('Labor');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);
  const [isDemoRecording, setIsDemoRecording] = useState(false);

  const transcripts = {
    Hindi: "एसी की सर्विस की, गैस रीफिल की, कॉपर पाइप डाला, 2 घंटे का काम किया, लेबर चार्ज 800 और गैस चार्ज 1200...",
    English: "Serviced split AC, refilled R410A gas, replaced copper pipe, 2 hours labor at 400 per hr and gas cost 1200...",
    Hinglish: "AC ki service ki, gas refill ki, copper pipe daala, 2 ghante ka kaam kiya, labor charge 800 aur gas charge 1200..."
  };

  const sampleCustomers = [
    { name: 'Rahul Verma', phone: '+91 98765-43210', invoices: 2, amount: '4,484', status: 'Paid', statusClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    { name: 'Anjali Mehta', phone: '+91 91234 56789', invoices: 1, amount: '2,360', status: 'Due', statusClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    { name: 'Green Park Society', phone: '+91 99100 80808', invoices: 5, amount: '15,600', status: 'Paid', statusClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    { name: 'Vikram Singh', phone: '+91 98123 36785', invoices: 1, amount: '1,200', status: 'Overdue', statusClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
    { name: 'Neha Gupta', phone: '+91 98712 34567', invoices: 2, amount: '3,800', status: 'Due', statusClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40' }
  ];

  const rateCardPresets = {
    Labor: [
      { name: 'AC Servicing (2 Hours)', rate: '800' },
      { name: 'AC Installation', rate: '1,500' },
      { name: 'Ceiling Fan Installation', rate: '300' },
      { name: 'Geyser Repair Service', rate: '550' }
    ],
    Materials: [
      { name: 'Gas Refill (R410A)', rate: '1,000' },
      { name: 'Copper Pipe (1/4")', rate: '1,200' },
      { name: '4.0 MFD Capacitor', rate: '280' },
      { name: 'PVC Waste Pipe 1.5"', rate: '180' }
    ],
    Packages: [
      { name: 'Complete AC Deep Service + Gas', rate: '2,200' },
      { name: 'Full Bathroom Plumbing Overhaul', rate: '3,500' },
      { name: 'Home Electrical Safety Audit', rate: '1,400' }
    ]
  };

  return (
    <div className="min-h-screen bg-navy-primary text-text-primary font-sans relative overflow-x-hidden selection:bg-primary selection:text-white pb-20">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-[35%] right-[5%] w-[600px] h-[600px] rounded-full bg-accent-cyan/8 blur-[180px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[20%] w-[550px] h-[550px] rounded-full bg-accent-purple/10 blur-[160px] pointer-events-none -z-10" />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & NAVBAR */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-navy-primary/85 backdrop-blur-2xl border-b border-navy-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          {/* Logo & Slogan Left */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-orange-600 to-amber-500 rounded-xl flex items-center justify-center text-white font-black shadow-orange-glow group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl tracking-tight text-white">TradeDesk</span>
                <span className="px-1.5 py-0.2 bg-primary/20 border border-primary/40 text-primary font-mono text-[10px] font-extrabold rounded">AI</span>
              </div>
              <span className="text-[9px] tracking-widest uppercase text-text-muted font-bold block">
                Voice • Invoices • Payments • Growth
              </span>
            </div>
          </Link>

          {/* Center Badges */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-text-secondary">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Available in India 🇮🇳
            </span>
            <span className="text-text-muted font-mono">10,000+ Invoices Generated</span>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold text-text-secondary hover:text-white px-3.5 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-bold bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white py-2.5 px-5 rounded-xl shadow-orange-glow transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. HERO SHOWCASE SECTION */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        
        {/* Top 3-Column Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT HERO CARD (Col 1-4) */}
          <div className="lg:col-span-4 glass-panel rounded-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Next-Gen Voice AI for Trades</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight tracking-tight">
                Speak. Invoice. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">
                  Get Paid.
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                All-in-one AI operating app for Indian technicians, electricians, plumbers, and HVAC contractors.
              </p>

              {/* Bullet Features */}
              <div className="space-y-2.5 pt-2">
                {[
                  { icon: '🎙️', title: 'Voice AI in Hindi, English & Hinglish' },
                  { icon: '📄', title: 'GST Invoice Generated in Seconds' },
                  { icon: '⚡', title: 'Dynamic UPI QR & Instant Payments' },
                  { icon: '💬', title: 'WhatsApp Delivery in One Click' },
                  { icon: '📊', title: '1-Click GSTR-1 Accounting Export' }
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-text-primary">
                    <span className="text-sm">{feat.icon}</span>
                    <span className="font-semibold">{feat.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Indian Culture Plaque Banner */}
            <div className="mt-8 p-3.5 neon-plaque rounded-xl flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-amber-300/80 uppercase font-mono block">Bharat Ka App</span>
                <span className="text-sm font-black text-amber-300">काम आसान, भुगतान तुरंत</span>
              </div>
              <span className="text-2xl">🇮🇳</span>
            </div>
          </div>

          {/* MIDDLE: 3-STEP VOICE TO INVOICE INTERACTIVE DEMO (Col 5-8) */}
          <div className="lg:col-span-5 glass-panel rounded-card p-6 flex flex-col justify-between relative">
            <div>
              {/* Stepper Header */}
              <div className="flex items-center justify-between border-b border-navy-border/80 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Voice to Invoice — 3 Simple Steps</span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-primary text-white">1. Speak</span>
                  <span className="text-text-muted">➔</span>
                  <span className="px-2 py-0.5 rounded bg-navy-surface text-text-muted">2. Review</span>
                  <span className="text-text-muted">➔</span>
                  <span className="px-2 py-0.5 rounded bg-navy-surface text-text-muted">3. Send</span>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-text-secondary">Language Mode:</span>
                <div className="flex gap-1.5 bg-navy-surface p-1 rounded-xl border border-navy-border">
                  {['Hindi', 'English', 'Hinglish'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        selectedLanguage === lang
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spoken Transcript Bubble */}
              <div className="bg-navy-surface/80 border border-navy-border rounded-xl p-3 text-xs text-text-secondary italic mb-4">
                "{transcripts[selectedLanguage]}"
              </div>

              {/* Glowing Mic Orb with Gradient Equalizer Waves */}
              <div className="bg-navy-card/90 border border-navy-border rounded-2xl p-4 flex items-center justify-between gap-4 mb-4">
                <button
                  onClick={() => setIsDemoRecording(!isDemoRecording)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isDemoRecording
                      ? 'bg-danger shadow-lg shadow-danger/50 animate-pulse'
                      : 'bg-primary shadow-orange-glow hover:scale-105'
                  }`}
                >
                  <Mic className="w-7 h-7 text-white" />
                </button>

                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-primary">00:28</span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> AI is listening...
                    </span>
                  </div>
                  {/* Waveform graphic */}
                  <div className="h-6 flex items-center gap-1">
                    {[...Array(18)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-full waveform-gradient"
                        style={{
                          height: `${Math.max(6, Math.sin(i * 0.8) * 22)}px`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Extracted Output Preview Card */}
              <div className="bg-navy-surface border border-navy-border/80 rounded-xl p-3.5 grid grid-cols-3 gap-2 text-left">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Customer</span>
                  <span className="text-xs font-bold text-white">Rahul Verma</span>
                  <span className="text-[10px] text-text-secondary block font-mono">98765-43210</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Bill Total</span>
                  <span className="text-xs font-bold text-success font-mono">₹2,360</span>
                  <span className="text-[10px] text-text-secondary block">Labor + Gas + GST</span>
                </div>
                <div className="text-right flex flex-col items-end justify-center">
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    98% Confidence
                  </span>
                  <span className="text-[9px] text-text-muted mt-0.5">High Accuracy</span>
                </div>
              </div>
            </div>

            <Link
              to="/jobs/new"
              className="mt-4 w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-orange-glow transition-all"
            >
              <Mic className="w-3.5 h-3.5" /> Try Live Voice Recording Now
            </Link>
          </div>

          {/* RIGHT: BEAUTIFUL GST INVOICE + SCAN & PAY (Col 9-12) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Skeuomorphic A4 Invoice Sheet Preview */}
            <div className="skeuomorphic-paper p-4 text-left relative overflow-hidden flex flex-col justify-between">
              <div className="border-b border-slate-200 pb-2 flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">SHARMA COOL SERVICES</h4>
                  <p className="text-[9px] text-slate-500">AC Repair & Maintenance • New Delhi</p>
                  <p className="text-[8px] text-slate-400 font-mono">GSTIN: 07ABCDE1234F1Z5</p>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-bold text-primary block">INVOICE</span>
                  <span className="text-[9px] font-mono font-bold text-slate-800">INV-484353</span>
                </div>
              </div>

              {/* Table Mini */}
              <div className="my-2 text-[8px] text-slate-700">
                <div className="flex justify-between font-bold border-b border-slate-100 pb-1 text-slate-900">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>1. AC Servicing (Labor)</span>
                  <span className="font-mono">₹1,600</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>2. Copper Pipe (1/4")</span>
                  <span className="font-mono">₹1,200</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>3. Gas Refill (R410A)</span>
                  <span className="font-mono">₹1,000</span>
                </div>
                <div className="border-t border-slate-200 pt-1 mt-1 flex justify-between font-bold text-slate-950 text-[9px]">
                  <span>Total Amount Due</span>
                  <span className="font-mono text-primary">₹4,484</span>
                </div>
              </div>

              {/* WhatsApp Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[8px] text-slate-400">Customer Signature Verified ✍️</span>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[8px] font-bold flex items-center gap-1">
                  <Send className="w-2 h-2" /> Sent on WhatsApp
                </span>
              </div>
            </div>

            {/* UPI Stand Card */}
            <div className="glass-panel rounded-card p-4 flex items-center justify-between gap-3 text-left">
              <div className="w-14 h-14 p-1 bg-white rounded-lg shadow flex-shrink-0 flex items-center justify-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=sharmacool@upi&am=4484.00&cu=INR"
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">Scan & Pay</span>
                <p className="text-xs font-mono font-bold text-white truncate">sharmacool@upi</p>
                <div className="flex items-center gap-2 text-[9px] text-text-muted mt-0.5">
                  <span>GPay</span> • <span>PhonePe</span> • <span>Paytm</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. WORKFLOW JOURNEY: 5 STEP PIPELINE */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="mt-8 glass-panel rounded-card p-6 text-left">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest block">Complete Workflow Journey</span>
              <h3 className="text-base font-bold text-white mt-0.5">From Voice to Payment in Under 60 Seconds</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5" /> 60s End-to-End
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { num: '1', title: 'RECORD', desc: 'Speak or voice note in any language' },
              { num: '2', title: 'AI REVIEW', desc: 'Auto-extracts client, hours, & parts' },
              { num: '3', title: 'CUSTOMIZE', desc: 'Add items from catalog & select GST' },
              { num: '4', title: 'SIGN & CONFIRM', desc: 'Customer digital signature on screen' },
              { num: '5', title: 'SEND & GET PAID', desc: 'WhatsApp invoice + Dynamic UPI QR' }
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-navy-surface/80 border border-navy-border rounded-xl p-3.5 flex flex-col justify-between hover:border-primary/50 transition-all group"
              >
                <div>
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-mono text-xs font-black flex items-center justify-center mb-2">
                    {step.num}
                  </span>
                  <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors">{step.title}</h4>
                  <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 4. CRM, DASHBOARD & RATE CARDS OVERVIEW */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* POWERFUL MINI CRM (Col 1-4) */}
          <div className="lg:col-span-4 glass-panel rounded-card p-5 text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" /> Powerful Mini CRM
                </h3>
                <Link to="/customers" className="text-[10px] text-primary hover:underline font-bold">
                  View All ➔
                </Link>
              </div>

              {/* Customer Search Demo */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  readOnly
                  value="Search customers..."
                  className="w-full pl-8 pr-3 py-1.5 bg-navy-surface border border-navy-border rounded-lg text-[11px] text-text-muted focus:outline-none"
                />
              </div>

              {/* Customer Rows */}
              <div className="space-y-2">
                {sampleCustomers.map((c, i) => (
                  <div key={i} className="bg-navy-surface/60 border border-navy-border/60 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-white text-xs leading-tight">{c.name}</h4>
                      <p className="text-[10px] text-text-muted font-mono">{c.phone} • {c.invoices} Inv</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-white">₹{c.amount}</p>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${c.statusClass}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/customers"
              className="mt-3 w-full py-2 bg-navy-surface hover:bg-navy-border border border-navy-border text-text-primary rounded-xl text-xs font-bold text-center block transition-colors"
            >
              + Add Customer
            </Link>
          </div>

          {/* DASHBOARD OVERVIEW (Col 5-8) */}
          <div className="lg:col-span-4 glass-panel rounded-card p-5 text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-primary" /> Dashboard Overview
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold">+18.6% vs last month</span>
              </div>

              {/* Top KPI Metrics */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2.5 bg-navy-surface/80 rounded-xl border border-navy-border">
                  <span className="text-[9px] text-text-muted uppercase font-bold block">Total Revenue</span>
                  <span className="text-sm font-black text-white font-mono">₹2,45,680</span>
                </div>
                <div className="p-2.5 bg-navy-surface/80 rounded-xl border border-navy-border">
                  <span className="text-[9px] text-text-muted uppercase font-bold block">Paid Invoices</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">₹1,92,430</span>
                </div>
                <div className="p-2.5 bg-navy-surface/80 rounded-xl border border-navy-border">
                  <span className="text-[9px] text-text-muted uppercase font-bold block">Unpaid Bills</span>
                  <span className="text-sm font-black text-rose-400 font-mono">₹53,250</span>
                </div>
                <div className="p-2.5 bg-navy-surface/80 rounded-xl border border-navy-border">
                  <span className="text-[9px] text-text-muted uppercase font-bold block">Invoices This Month</span>
                  <span className="text-sm font-black text-white font-mono">124</span>
                </div>
              </div>

              {/* Progress Distribution */}
              <div className="p-3 bg-navy-surface/60 rounded-xl border border-navy-border/60 space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-text-secondary">Top Services Delivered</span>
                  <span className="text-primary font-mono">78% Settle Rate</span>
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between text-text-muted">
                    <span>AC Servicing</span>
                    <span className="text-white font-mono">56 Jobs</span>
                  </div>
                  <div className="w-full bg-navy-border h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '65%' }} />
                  </div>

                  <div className="flex justify-between text-text-muted">
                    <span>Installation</span>
                    <span className="text-white font-mono">32 Jobs</span>
                  </div>
                  <div className="w-full bg-navy-border h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="mt-3 w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold text-center block shadow-md transition-colors"
            >
              Open Full Dashboard ➔
            </Link>
          </div>

          {/* RATE CARDS & GSTR-1 (Col 9-12) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Rate Cards Master */}
            <div className="glass-panel rounded-card p-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-primary" /> Rate Cards & Items
                </h3>
                <div className="flex gap-1 text-[9px]">
                  {['Labor', 'Materials'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCatalogTab(tab)}
                      className={`px-2 py-0.5 rounded font-bold ${
                        catalogTab === tab ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                {(rateCardPresets[catalogTab] || []).map((item, idx) => (
                  <div key={idx} className="bg-navy-surface/80 rounded-lg p-2 flex justify-between items-center text-xs">
                    <span className="text-text-primary text-[11px] font-medium">{item.name}</span>
                    <span className="font-mono font-bold text-primary">₹{item.rate}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GST Filing Made Easy Box */}
            <div className="glass-panel rounded-card p-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">GST Filing Made Easy</span>
                <span className="text-[9px] font-mono bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-bold">GSTR-1 Ready</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
                124 Invoices • Taxable: ₹2,30,000 • Total Tax: ₹20,700
              </p>
              <Link
                to="/dashboard"
                className="w-full py-2 bg-navy-surface hover:bg-navy-border border border-navy-border text-text-primary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3 h-3 text-primary" /> Export GSTR-1 (Excel/CSV)
              </Link>
            </div>

          </div>

        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 5. BOTTOM CULTURAL SLOGAN & TRUST BADGE */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="mt-8 p-6 neon-plaque rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl flex-shrink-0">
              🛺
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-300">"आपका काम, हमारी पहचान"</h3>
              <p className="text-xs text-amber-200/70">Empowering millions of Indian technicians with voice-first digital invoicing.</p>
            </div>
          </div>

          <Link
            to="/register"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-neon-gold transition-all active:scale-95 whitespace-nowrap"
          >
            Start Free Invoicing Now ➔
          </Link>
        </div>

      </section>

    </div>
  );
}
