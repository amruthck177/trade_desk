import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { Sparkles, Mail, Lock, User, Phone, Check, Loader2, Star, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [passwordVal, setPasswordVal] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handlePasswordChange = (e) => {
    setPasswordVal(e.target.value);
  };

  const getPasswordStrength = () => {
    if (!passwordVal) return { label: 'Empty', color: 'bg-navy-border', percent: 'w-0' };
    if (passwordVal.length < 6) return { label: 'Weak', color: 'bg-danger', percent: 'w-1/3' };
    if (passwordVal.length < 10) return { label: 'Medium', color: 'bg-warning', percent: 'w-2/3' };
    return { label: 'Strong', color: 'bg-success', percent: 'w-full' };
  };

  const strength = getPasswordStrength();

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      if (response.data && response.data.token) {
        login(response.data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setApiError(err.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-primary text-text-primary grid md:grid-cols-12 relative overflow-hidden">
      
      {/* 1. LEFT SIDE: BRAND TRUST GRAPHIC PANEL (Desktop Only) */}
      <div className="hidden md:flex md:col-span-5 bg-navy-card/50 border-r border-navy-border/60 p-12 flex-col justify-between relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute -top-[10%] -left-[10%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        
        {/* Brand logo header */}
        <Link to="/" className="flex items-center gap-2 group relative z-10 self-start">
          <div className="w-8.5 h-8.5 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 active:scale-95 transition-all shadow-orange-glow/10">
            <Sparkles className="w-4.5 h-4.5 fill-current animate-pulse-slow" />
          </div>
          <span className="font-display font-extrabold text-base tracking-tight text-text-primary">
            TradeDesk
          </span>
        </Link>

        {/* Brand Statement / Testimonial */}
        <div className="flex flex-col gap-8 relative z-10 my-auto text-left max-w-sm">
          <h2 className="text-3xl font-display font-black leading-tight text-text-primary">
            Built Specifically For Modern Service Professionals
          </h2>

          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Save up to 4 hours of weekly documentation work by billing clients instantly via voice notes.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Receive payments faster using integrated UPI QR payment displays automatically attached to A4 invoices.
              </p>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="bg-navy-elevated/40 border border-navy-border/50 p-5 rounded-2xl flex flex-col gap-3 mt-4">
            <div className="flex text-warning gap-0.5 text-xs">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
            </div>
            <p className="text-[11px] text-text-secondary italic leading-relaxed">
              "TradeDesk changed how I bill clients. After finishing a pipe repair job, I just record a 20-second note, review, and send it to WhatsApp. Clients are wowed by the speed!"
            </p>
            <p className="text-[10px] font-bold text-text-primary">— Suresh Kumar, Professional Plumber</p>
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="flex items-center gap-2 text-[10px] text-text-secondary font-mono relative z-10 self-start">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span>SSL SECURED ENCRYPTION</span>
        </div>
      </div>

      {/* 2. RIGHT SIDE: REGISTRATION CARD FORM (Desktop/Mobile) */}
      <div className="col-span-12 md:col-span-7 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md bg-navy-card md:bg-transparent border border-navy-border/50 md:border-transparent p-6 sm:p-8 md:p-0 rounded-card relative z-10">
          
          <div className="flex flex-col gap-2 text-left mb-8">
            <h2 className="text-2xl font-display font-extrabold text-text-primary">Create Your Free Account</h2>
            <p className="text-xs text-text-secondary">Join TradeDesk to automate invoicing and payment alerts</p>
          </div>

          {apiError && (
            <div className="bg-danger/10 border border-danger/25 text-danger text-xs font-semibold p-3.5 rounded-xl mb-6 flex items-center gap-2 animate-shake">
              ⚠️ <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4.5 text-left">
            {/* Name */}
            <div className="floating-label-group">
              <input
                type="text"
                id="name"
                placeholder=" "
                {...register('name', { required: 'Full Name is required' })}
                className={`w-full bg-navy-elevated/40 border ${errors.name ? 'border-danger focus:border-danger' : 'border-navy-border/80 focus:border-primary'} outline-none rounded-input px-3.5 py-2.5 text-sm transition-all`}
              />
              <label htmlFor="name" className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              {errors.name && <span className="text-[10px] text-danger mt-1 font-semibold">{errors.name.message}</span>}
            </div>

            {/* Email */}
            <div className="floating-label-group">
              <input
                type="email"
                id="email"
                placeholder=" "
                {...register('email', { required: 'Email address is required' })}
                className={`w-full bg-navy-elevated/40 border ${errors.email ? 'border-danger focus:border-danger' : 'border-navy-border/80 focus:border-primary'} outline-none rounded-input px-3.5 py-2.5 text-sm transition-all`}
              />
              <label htmlFor="email" className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              {errors.email && <span className="text-[10px] text-danger mt-1 font-semibold">{errors.email.message}</span>}
            </div>

            {/* Mobile Number (+91 prefix flag) */}
            <div className="floating-label-group">
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs text-text-secondary font-mono border-r border-navy-border/80 pr-2 pointer-events-none">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  placeholder=" "
                  {...register('phone', { 
                    required: 'Mobile phone number is required',
                    pattern: { value: /^\d{10}$/, message: 'Must be a 10-digit number' }
                  })}
                  className={`w-full bg-navy-elevated/40 border ${errors.phone ? 'border-danger focus:border-danger' : 'border-navy-border/80 focus:border-primary'} outline-none rounded-input pl-17 pr-3.5 py-2.5 text-sm transition-all`}
                />
                <label htmlFor="phone" className="flex items-center gap-1 !left-17">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </label>
              </div>
              {errors.phone && <span className="text-[10px] text-danger mt-1 font-semibold">{errors.phone.message}</span>}
            </div>

            {/* Password */}
            <div className="floating-label-group relative">
              <input
                type="password"
                id="password"
                placeholder=" "
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  onChange: handlePasswordChange
                })}
                className={`w-full bg-navy-elevated/40 border ${errors.password ? 'border-danger focus:border-danger' : 'border-navy-border/80 focus:border-primary'} outline-none rounded-input px-3.5 py-2.5 text-sm transition-all`}
              />
              <label htmlFor="password" className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              
              {/* Password Strength indicator */}
              {passwordVal && (
                <div className="mt-2.5 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary">
                    <span>Strength: <span className="font-bold text-text-primary">{strength.label}</span></span>
                    <span>Min 6 chars</span>
                  </div>
                  <div className="h-1 w-full bg-navy-border rounded-full overflow-hidden mt-0.5">
                    <div className={`h-full transition-all duration-300 ${strength.color} ${strength.percent}`} />
                  </div>
                </div>
              )}
              {errors.password && <span className="text-[10px] text-danger mt-1 font-semibold">{errors.password.message}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-3 rounded-button shadow-card-glow shadow-primary/10 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          {/* Bottom links */}
          <div className="text-center text-xs text-text-secondary mt-8 border-t border-navy-border/40 pt-5">
            <span>Already have an account? </span>
            <Link to="/login" className="text-primary font-bold hover:underline">
              Log In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
