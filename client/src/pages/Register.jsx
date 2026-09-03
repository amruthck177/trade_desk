import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Check, 
  Loader2, 
  Star, 
  ShieldCheck, 
  Briefcase, 
  QrCode, 
  ArrowRight,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [passwordVal, setPasswordVal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('AC & HVAC');
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const tradeCategories = [
    { label: 'AC & HVAC', icon: '❄️' },
    { label: 'Electrician', icon: '⚡' },
    { label: 'Plumbing', icon: '🔧' },
    { label: 'Appliance Repair', icon: '🧺' },
    { label: 'Carpentry', icon: '🪚' },
    { label: 'General Contractor', icon: '🏗️' }
  ];

  const handlePasswordChange = (e) => {
    setPasswordVal(e.target.value);
  };

  const getPasswordStrength = () => {
    if (!passwordVal) return { label: 'Empty', color: 'bg-slate-700', percent: 'w-0' };
    if (passwordVal.length < 6) return { label: 'Weak (Min 6 chars)', color: 'bg-red-500', percent: 'w-1/3' };
    if (passwordVal.length < 10) return { label: 'Good', color: 'bg-amber-400', percent: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-400', percent: 'w-full' };
  };

  const strength = getPasswordStrength();

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone.trim(),
        businessName: data.businessName?.trim() || `${data.name.split(' ')[0]}'s ${selectedTrade} Services`,
        upiId: data.upiId?.trim() || '',
        gstNumber: data.gstNumber?.trim() || ''
      });

      if (response.data && response.data.token) {
        login(response.data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setApiError(err.response?.data?.message || 'Registration failed. Try a different email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white grid lg:grid-cols-12 relative overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
      
      {/* 1. LEFT SIDE: BRAND TRUST & TESTIMONIAL PANEL (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0D1326] border-r border-slate-800 p-10 flex-col justify-between relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute -top-[10%] -left-[10%] w-[350px] h-[350px] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
        
        {/* Brand logo header */}
        <Link to="/" className="flex items-center gap-2.5 group relative z-10 self-start">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-display font-black text-2xl tracking-tight text-white">TradeDesk</span>
            <span className="px-1.5 py-0.2 bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono text-[10px] font-extrabold rounded">AI</span>
          </div>
        </Link>

        {/* Value Proposition */}
        <div className="flex flex-col gap-6 relative z-10 my-auto text-left max-w-sm">
          <span className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold self-start flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Made for Indian Technicians
          </span>

          <h2 className="text-3xl font-display font-black leading-tight text-white">
            Transform Your Trade Business with Voice AI
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <b className="text-white">Record & Invoice in 30s:</b> Speak in Hindi, English, or Hinglish to generate GST-compliant A4 invoices on site.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <b className="text-white">Get Paid Faster via UPI:</b> Automatic dynamic QR codes let customers pay the exact bill in seconds with GPay / PhonePe.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <b className="text-white">1-Click WhatsApp Delivery:</b> Send PDF invoices directly to customer WhatsApp without asking for email.
              </p>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="bg-[#121B30] border border-slate-700 p-4 rounded-2xl flex flex-col gap-2 mt-2">
            <div className="flex text-amber-400 gap-1 text-xs">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
            </div>
            <p className="text-[11px] text-slate-300 italic leading-relaxed">
              "TradeDesk changed how I bill clients. After finishing a pipe repair job, I record a 15-second voice note and dispatch it to WhatsApp immediately. Zero paperwork!"
            </p>
            <p className="text-[10px] font-bold text-white font-mono">— Suresh Kumar, Plumbing Contractor, Delhi</p>
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono relative z-10 self-start">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-BIT SSL ENCRYPTION • 100% PRIVATE</span>
        </div>
      </div>

      {/* 2. RIGHT SIDE: STRUCTURED REGISTRATION FORM */}
      <div className="col-span-12 lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-10 relative overflow-y-auto max-h-screen">
        <div className="w-full max-w-lg bg-[#121B30] p-6 sm:p-8 rounded-2xl relative z-10 shadow-2xl border border-slate-700 flex flex-col gap-5 text-left">
          
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-extrabold text-white">Create Your Free Pro Account</h2>
              <Link to="/login" className="text-xs text-orange-400 font-bold hover:underline">
                Sign In ➔
              </Link>
            </div>
            <p className="text-xs text-slate-300">Setup your business profile to start issuing voice invoices</p>
          </div>

          {apiError && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
              ⚠️ <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            
            {/* 1. TRADE CATEGORY PICKER */}
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">Select Primary Trade Category</label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                {tradeCategories.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedTrade(t.label)}
                    className={`py-2 px-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-1.5 transition-all ${
                      selectedTrade === t.label
                        ? 'bg-orange-500/25 border-orange-500 text-white shadow-sm'
                        : 'bg-[#1A2642] border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. PERSONAL & BUSINESS CONTACT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-700">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">Your Full Name *</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    {...register('name', { required: 'Full name is required' })}
                    className="w-full pl-9 pr-3 py-2 bg-[#1A2642] border border-slate-600 focus:border-orange-500 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
                {errors.name && <span className="text-[10px] text-red-400 mt-0.5 font-semibold block">{errors.name.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">WhatsApp Phone (10 Digits) *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[11px] text-slate-400 font-mono border-r border-slate-700 pr-1.5 pointer-events-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    {...register('phone', { 
                      required: 'Mobile phone number is required',
                      pattern: { value: /^\d{10}$/, message: 'Must be a 10-digit number' }
                    })}
                    className="w-full pl-14 pr-3 py-2 bg-[#1A2642] border border-slate-600 focus:border-orange-500 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-slate-400 font-mono"
                  />
                </div>
                {errors.phone && <span className="text-[10px] text-red-400 mt-0.5 font-semibold block">{errors.phone.message}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-200 block mb-1">Business / Shop Name</label>
                <div className="relative flex items-center">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={`e.g. Apex ${selectedTrade} Services`}
                    {...register('businessName')}
                    className="w-full pl-9 pr-3 py-2 bg-[#1A2642] border border-slate-600 focus:border-orange-500 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 3. PAYMENT & UPI ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-700">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">UPI ID (For Dynamic QR Code)</label>
                <div className="relative flex items-center">
                  <QrCode className="w-4 h-4 text-orange-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. yourname@okaxis"
                    {...register('upiId')}
                    className="w-full pl-9 pr-3 py-2 bg-[#1A2642] border border-slate-600 focus:border-orange-500 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-slate-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  {...register('gstNumber')}
                  className="w-full px-3 py-2 bg-[#1A2642] border border-slate-600 focus:border-orange-500 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-slate-400 font-mono uppercase"
                />
              </div>
            </div>

            {/* 4. SECURITY & CREDENTIALS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-700">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">Email Address *</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    {...register('email', { required: 'Email address is required' })}
                    className="w-full pl-9 pr-3 py-2 bg-[#1A2642] border border-slate-600 focus:border-orange-500 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
                {errors.email && <span className="text-[10px] text-red-400 mt-0.5 font-semibold block">{errors.email.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">Account Password *</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 chars"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      onChange: handlePasswordChange
                    })}
                    className="w-full pl-9 pr-8 py-2 bg-[#1A2642] border border-slate-600 focus:border-orange-500 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-slate-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && <span className="text-[10px] text-red-400 mt-0.5 font-semibold block">{errors.password.message}</span>}
              </div>
            </div>

            {/* Password Strength Indicator */}
            {passwordVal && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
                  <span>Strength: <span className="font-bold text-white">{strength.label}</span></span>
                </div>
                <div className="h-1.5 w-full bg-[#1A2642] rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.color} ${strength.percent}`} />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Setting Up Your Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account & Start Invoicing</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-300 pt-3 border-t border-slate-700">
            <span>Already registered? </span>
            <Link to="/login" className="text-orange-400 font-bold hover:underline">
              Log in to your account
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
