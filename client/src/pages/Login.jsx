import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { Sparkles, Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      });

      if (response.data && response.data.token) {
        login(response.data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setApiError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-primary text-text-primary flex items-center justify-center p-6 relative">
      {/* Glow blobs */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-navy-card border border-navy-border/60 p-8 rounded-card shadow-elevated relative z-10">
        
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Link to="/" className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary hover:scale-105 active:scale-95 transition-all">
            <Sparkles className="w-5.5 h-5.5 fill-current animate-pulse-slow" />
          </Link>
          <div className="text-center">
            <h2 className="text-2xl font-display font-extrabold text-text-primary">Welcome Back</h2>
            <p className="text-xs text-text-secondary mt-1">Log in to manage your jobs and send invoices</p>
          </div>
        </div>

        {apiError && (
          <div className="bg-danger/10 border border-danger/25 text-danger text-xs font-semibold p-3.5 rounded-xl mb-6 flex items-center gap-2 animate-shake">
            ⚠️ <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email field */}
          <div className="floating-label-group">
            <input
              type="email"
              id="email"
              placeholder=" "
              {...register('email', { required: 'Email address is required' })}
              className={`w-full bg-navy-elevated/40 border ${errors.email ? 'border-danger focus:border-danger' : 'border-navy-border/80 focus:border-primary'} outline-none rounded-input px-3.5 py-2.5 text-sm transition-all placeholder-shown:border-navy-border/50`}
            />
            <label htmlFor="email" className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            {errors.email && <span className="text-[10px] text-danger mt-1 font-semibold">{errors.email.message}</span>}
          </div>

          {/* Password field */}
          <div className="floating-label-group relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder=" "
              {...register('password', { required: 'Password is required' })}
              className={`w-full bg-navy-elevated/40 border ${errors.password ? 'border-danger focus:border-danger' : 'border-navy-border/80 focus:border-primary'} outline-none rounded-input pl-3.5 pr-10 py-2.5 text-sm transition-all`}
            />
            <label htmlFor="password" className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {errors.password && <span className="text-[10px] text-danger mt-1 font-semibold">{errors.password.message}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-3 rounded-button shadow-card-glow shadow-primary/10 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-text-secondary mt-8 border-t border-navy-border/40 pt-5">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-primary font-bold hover:underline">
            Register Free
          </Link>
        </div>

      </div>
    </div>
  );
}
