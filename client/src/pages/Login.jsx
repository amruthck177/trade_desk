import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', {
        email: data.email.trim(),
        password: data.password,
      });

      if (response.data && response.data.token) {
        login(response.data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setApiError(err.response?.data?.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Login
  const handleQuickDemoLogin = async () => {
    setApiError('');
    setDemoLoading(true);
    try {
      const demoEmail = 'pro_demo@tradedesk.in';
      const demoPass = 'demo123456';
      
      try {
        const loginRes = await axios.post('/api/auth/login', {
          email: demoEmail,
          password: demoPass,
        });
        login(loginRes.data);
        navigate('/dashboard');
      } catch (loginErr) {
        const regRes = await axios.post('/api/auth/register', {
          name: 'Ramesh Electrician',
          email: demoEmail,
          password: demoPass,
          phone: '9876543210',
          businessName: 'Ramesh Electrical & AC Services',
          upiId: 'ramesh@okhdfcbank',
          gstNumber: '29ABCDE1234F1Z5'
        });
        login(regRes.data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setApiError('Could not start instant demo. Please register a free account.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-primary selection:text-white">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-orange-500/10 blur-[140px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[160px] pointer-events-none -z-10" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#121B30] p-6 sm:p-8 rounded-2xl relative z-10 shadow-2xl border border-slate-700 flex flex-col gap-6">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link to="/" className="flex items-center gap-2 group mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-display font-black text-2xl tracking-tight text-white">TradeDesk</span>
              <span className="px-1.5 py-0.2 bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono text-[10px] font-extrabold rounded">AI</span>
            </div>
          </Link>
          <h2 className="text-xl font-display font-extrabold text-white">Technician Portal Login</h2>
          <p className="text-xs text-slate-300">Sign in to manage voice invoices, payments, and clients</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#1A2642] p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            className="flex-1 py-2 text-xs font-bold rounded-lg bg-orange-500 text-white shadow-sm transition-all"
          >
            Sign In
          </button>
          <Link
            to="/register"
            className="flex-1 py-2 text-xs font-bold rounded-lg text-slate-300 hover:text-white text-center transition-all"
          >
            Create Account
          </Link>
        </div>

        {apiError && (
          <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold p-3 rounded-xl flex items-center gap-2 text-left">
            ⚠️ <span>{apiError}</span>
          </div>
        )}

        {/* Structured Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-left">
          
          {/* Email field */}
          <div>
            <label className="text-xs font-bold text-slate-200 block mb-1">Registered Email Address *</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                {...register('email', { required: 'Email is required' })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#1A2642] border border-slate-600 focus:border-orange-500 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
            {errors.email && <span className="text-[10px] text-red-400 mt-1 font-semibold block">{errors.email.message}</span>}
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-200">Password *</label>
              <span className="text-[10px] text-orange-400 cursor-pointer hover:underline font-semibold">Forgot password?</span>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-10 pr-10 py-2.5 bg-[#1A2642] border border-slate-600 focus:border-orange-500 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-slate-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-[10px] text-red-400 mt-1 font-semibold block">{errors.password.message}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing into Workspace...</span>
              </>
            ) : (
              <>
                <span>Sign In to TradeDesk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-0.5">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Or Fast Test</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* 1-Click Instant Demo Login */}
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={demoLoading}
          className="w-full py-2.5 bg-[#1A2642] hover:bg-slate-700 border border-slate-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-orange-400" />}
          <span>⚡ Launch Instant Demo Account</span>
        </button>

        {/* Footer & Security Trust Seal */}
        <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encrypted
          </span>
          <span className="font-semibold text-slate-300">Made for Bharat 🇮🇳</span>
        </div>

      </div>

    </div>
  );
}
