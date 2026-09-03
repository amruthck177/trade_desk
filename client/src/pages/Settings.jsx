import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  User, 
  Building, 
  Bell, 
  CreditCard, 
  ShieldAlert, 
  Check, 
  UploadCloud,
  Loader2,
  Camera,
  MapPin,
  FileText
} from 'lucide-react';

export default function Settings() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  // Tabs: 'profile' | 'business' | 'notifications' | 'billing'
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');

  // Business Form States
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || '');
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || '');
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [invoicePrefix, setInvoicePrefix] = useState(user?.invoicePrefix || 'INV');
  const [defaultTerms, setDefaultTerms] = useState(user?.defaultTerms || '1. All service and repair work carries a 30-day workmanship warranty.\n2. Materials and spare parts are covered by manufacturer warranty.\n3. Please pay on or before the due date.');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(user?.logoUrl ? `http://localhost:5000/${user.logoUrl}` : null);

  // Notifications Toggles Mocks
  const [smsNotify, setSmsNotify] = useState(true);
  const [whatsAppNotify, setWhatsAppNotify] = useState(true);
  const [emailNotify, setEmailNotify] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile Settings', icon: User },
    { id: 'business', name: 'Business & Invoice PDF', icon: Building },
    { id: 'notifications', name: 'Notification Alerts', icon: Bell },
    { id: 'billing', name: 'Billing & Plans', icon: CreditCard },
  ];

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put('/api/auth/profile', {
        name,
        phone,
        password: password || undefined
      }, { headers });

      updateUser(response.data);
      setSuccessMsg('Profile updated successfully!');
      setPassword('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('businessName', businessName);
    formData.append('businessAddress', businessAddress);
    formData.append('gstNumber', gstNumber);
    formData.append('upiId', upiId);
    formData.append('invoicePrefix', invoicePrefix);
    formData.append('defaultTerms', defaultTerms);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };
      const response = await axios.put('/api/auth/profile', formData, { headers });

      updateUser(response.data);
      setSuccessMsg('Business settings updated successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update business settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-12 gap-8 text-left">
      
      {/* 1. LEFT COLUMN tabs */}
      <div className="md:col-span-4 flex flex-col gap-1.5 bg-navy-card border border-navy-border p-4 rounded-card shadow-card h-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSuccessMsg('');
                setErrorMsg('');
              }}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all text-left cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-orange-glow/10' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-navy-surface'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* 2. RIGHT COLUMN form */}
      <div className="md:col-span-8 flex flex-col gap-6">
        
        {/* Messages */}
        {successMsg && (
          <div className="bg-success/15 border border-success/20 text-success text-xs font-semibold p-4 rounded-xl flex items-center gap-2">
            ✓ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-danger/10 border border-danger/25 text-danger text-xs font-semibold p-4 rounded-xl flex items-center gap-2">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ──────────────────────────────────────────────────────── */}
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="bg-navy-card border border-navy-border p-6 sm:p-8 rounded-card shadow-card">
            <h2 className="text-base font-display font-extrabold text-text-primary mb-6 border-b border-navy-border/60 pb-3 uppercase tracking-wider">
              Profile Settings
            </h2>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Reset Password (leave empty to keep current)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 self-start mt-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Save Profile</span>
              </button>
            </form>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────── */}
        {/* BUSINESS TAB */}
        {activeTab === 'business' && (
          <div className="bg-navy-card border border-navy-border p-6 sm:p-8 rounded-card shadow-card">
            <h2 className="text-base font-display font-extrabold text-text-primary mb-6 border-b border-navy-border/60 pb-3 uppercase tracking-wider">
              Business & Invoice PDF Branding
            </h2>

            <form onSubmit={handleSaveBusiness} className="flex flex-col gap-4">
              
              {/* Logo upload layer */}
              <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-navy-border/60 pb-5">
                <div className="relative w-20 h-20 rounded-2xl bg-navy-surface border border-navy-border flex items-center justify-center text-primary text-xl font-bold flex-shrink-0 group overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    '🛠️'
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="text-center sm:text-left flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-text-primary">Business Logo Graphic</span>
                  <p className="text-[11px] text-text-secondary">Rendered in the header of all generated A4 invoice PDFs.</p>
                  
                  <label className="flex items-center gap-1.5 text-[11px] font-bold bg-navy-surface border border-navy-border hover:bg-navy-border text-text-primary py-1.5 px-3 rounded-lg cursor-pointer transition-all self-center sm:self-start">
                    <UploadCloud className="w-3.5 h-3.5 text-primary" />
                    <span>Upload Logo File</span>
                    <input type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Registered Business / Shop Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Electrical & Plumbing Services"
                  className="w-full px-3.5 py-2.5 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Shop / Office Address</label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="e.g. Shop 14, Main Market, Indiranagar, Bangalore"
                  className="w-full px-3.5 py-2.5 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">GSTIN Registration Number</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    className="w-full px-3.5 py-2.5 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Default Invoice Prefix</label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                    placeholder="INV"
                    className="w-full px-3.5 py-2.5 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">UPI Payment Address (VPA) for Scannable QR Code</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  className="w-full px-3.5 py-2.5 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary font-mono"
                />
                <span className="text-[10px] text-text-muted mt-1 block">
                  Used to generate real, dynamic scannable UPI QR codes on all PDF invoices.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Default Terms & Warranty Policy</label>
                <textarea
                  rows="3"
                  value={defaultTerms}
                  onChange={(e) => setDefaultTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 self-start mt-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Save Business Configuration</span>
              </button>
            </form>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────── */}
        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="bg-navy-card border border-navy-border p-6 sm:p-8 rounded-card shadow-card flex flex-col gap-5">
            <h2 className="text-base font-display font-extrabold text-text-primary border-b border-navy-border/60 pb-3 uppercase tracking-wider">
              Automated Notification Rules
            </h2>

            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between p-4 bg-navy-surface border border-navy-border rounded-xl cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-text-primary block">WhatsApp Instant Invoices</span>
                  <span className="text-[11px] text-text-secondary">Send automatic WhatsApp notification to client upon invoice generation.</span>
                </div>
                <input
                  type="checkbox"
                  checked={whatsAppNotify}
                  onChange={(e) => setWhatsAppNotify(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-navy-surface border border-navy-border rounded-xl cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-text-primary block">Overdue Payment Reminders</span>
                  <span className="text-[11px] text-text-secondary">Alert you on the dashboard when unpaid bills cross 3 days.</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsNotify}
                  onChange={(e) => setSmsNotify(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────── */}
        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="bg-navy-card border border-navy-border p-6 sm:p-8 rounded-card shadow-card flex flex-col gap-5">
            <h2 className="text-base font-display font-extrabold text-text-primary border-b border-navy-border/60 pb-3 uppercase tracking-wider">
              Subscription & Plan
            </h2>

            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary block">Active Plan: Pro Unlimited</span>
                <span className="text-[11px] text-text-secondary">Unlimited voice invoices, WhatsApp messaging, and GST reporting.</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-bold">ACTIVE</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
