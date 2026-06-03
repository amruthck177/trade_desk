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
  Camera
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
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || '');
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [invoicePrefix, setInvoicePrefix] = useState(user?.invoicePrefix || 'INV');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(user?.logoUrl ? `http://localhost:5000/${user.logoUrl}` : null);

  // Notifications Toggles Mocks
  const [smsNotify, setSmsNotify] = useState(true);
  const [whatsAppNotify, setWhatsAppNotify] = useState(true);
  const [emailNotify, setEmailNotify] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile Settings', icon: User },
    { id: 'business', name: 'Business Settings', icon: Building },
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
    formData.append('gstNumber', gstNumber);
    formData.append('upiId', upiId);
    formData.append('invoicePrefix', invoicePrefix);
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
      <div className="md:col-span-4 flex flex-col gap-1.5 bg-navy-card border border-navy-border/60 p-4 rounded-card shadow-card-glow h-fit">
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
                  ? 'bg-primary text-white shadow-orange-glow/10 scale-102' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-navy-elevated/40'
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
          <div className="bg-navy-card border border-navy-border/60 p-6 sm:p-8 rounded-card shadow-card-glow">
            <h2 className="text-base font-display font-extrabold text-text-primary mb-6 border-b border-navy-border/40 pb-3 uppercase tracking-wider">
              Profile Settings
            </h2>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <div className="floating-label-group">
                <input
                  type="text"
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=" "
                  required
                  className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-input px-3.5 py-2.5 text-sm transition-all"
                />
                <label htmlFor="profile-name">Full Name</label>
              </div>

              <div className="floating-label-group">
                <input
                  type="tel"
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder=" "
                  required
                  className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-input px-3.5 py-2.5 text-sm transition-all"
                />
                <label htmlFor="profile-phone">Mobile Phone</label>
              </div>

              <div className="floating-label-group">
                <input
                  type="password"
                  id="profile-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-input px-3.5 py-2.5 text-sm transition-all"
                />
                <label htmlFor="profile-password">Reset Password (leave empty to keep current)</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold py-3.5 px-6 rounded-button shadow-orange-glow/10 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 self-start mt-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Save Changes</span>
              </button>
            </form>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────── */}
        {/* BUSINESS TAB */}
        {activeTab === 'business' && (
          <div className="bg-navy-card border border-navy-border/60 p-6 sm:p-8 rounded-card shadow-card-glow">
            <h2 className="text-base font-display font-extrabold text-text-primary mb-6 border-b border-navy-border/40 pb-3 uppercase tracking-wider">
              Business Configuration
            </h2>

            <form onSubmit={handleSaveBusiness} className="flex flex-col gap-5">
              
              {/* Logo upload layer with preview */}
              <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-navy-border/40 pb-5">
                <div className="relative w-20 h-20 rounded-2xl bg-navy-elevated border border-navy-border/80 flex items-center justify-center text-primary text-xl font-bold flex-shrink-0 group overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    '🛠️'
                  )}
                  {/* Camera overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="text-center sm:text-left flex flex-col gap-2">
                  <span className="text-xs font-bold text-text-primary">Business Logo Graphic</span>
                  <p className="text-[10px] text-text-secondary">We'll attach this logo to the header of A4 invoice PDFs.</p>
                  
                  <label className="flex items-center gap-1.5 text-[10px] font-bold bg-navy-elevated border border-navy-border/80 hover:bg-navy-border text-text-primary py-1.5 px-3 rounded-lg cursor-pointer transition-all self-center sm:self-start">
                    <UploadCloud className="w-3.5 h-3.5 text-primary" />
                    <span>Upload Logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="floating-label-group">
                <input
                  type="text"
                  id="biz-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder=" "
                  className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-input px-3.5 py-2.5 text-sm transition-all"
                />
                <label htmlFor="biz-name">Registered Business/Shop Name</label>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="floating-label-group">
                  <input
                    type="text"
                    id="biz-gst"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder=" "
                    className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-input px-3.5 py-2.5 text-sm transition-all"
                  />
                  <label htmlFor="biz-gst">GSTIN Registration Number</label>
                </div>

                <div className="floating-label-group">
                  <input
                    type="text"
                    id="biz-prefix"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    placeholder=" "
                    className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-input px-3.5 py-2.5 text-sm transition-all"
                  />
                  <label htmlFor="biz-prefix">Default Invoice Prefix</label>
                </div>
              </div>

              <div className="floating-label-group">
                <input
                  type="text"
                  id="biz-upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder=" "
                  className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-input px-3.5 py-2.5 text-sm transition-all"
                />
                <label htmlFor="biz-upi">UPI Payment Address (VPA) for QR Code</label>
                <span className="text-[10px] text-text-secondary mt-1 block">e.g. businessname@okaxis</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold py-3.5 px-6 rounded-button shadow-orange-glow/10 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 self-start mt-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Save Configuration</span>
              </button>
            </form>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────── */}
        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="bg-navy-card border border-navy-border/60 p-6 sm:p-8 rounded-card shadow-card-glow flex flex-col gap-6">
            <h2 className="text-base font-display font-extrabold text-text-primary border-b border-navy-border/40 pb-3 uppercase tracking-wider">
              Notification Rules
            </h2>

            <div className="flex flex-col gap-5 text-sm">
              {/* WhatsApp Toggle */}
              <div className="flex items-center justify-between border-b border-navy-border/40 pb-4">
                <div>
                  <p className="font-bold text-text-primary">WhatsApp Notifications</p>
                  <p className="text-xs text-text-secondary mt-0.5">Send A4 invoice download link instantly via WhatsApp upon step completion.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsAppNotify(!whatsAppNotify)}
                  className={`w-11 h-6 rounded-full p-1 relative flex items-center transition-all cursor-pointer ${whatsAppNotify ? 'bg-primary' : 'bg-navy-elevated border border-navy-border'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${whatsAppNotify ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* SMS Toggle */}
              <div className="flex items-center justify-between border-b border-navy-border/40 pb-4">
                <div>
                  <p className="font-bold text-text-primary">SMS Reminders</p>
                  <p className="text-xs text-text-secondary mt-0.5">Deliver text-message backup notifications for bills awaiting payment.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsNotify(!smsNotify)}
                  className={`w-11 h-6 rounded-full p-1 relative flex items-center transition-all cursor-pointer ${smsNotify ? 'bg-primary' : 'bg-navy-elevated border border-navy-border'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${smsNotify ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Email Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-text-primary">Email Invoice Reports</p>
                  <p className="text-xs text-text-secondary mt-0.5">Send a copy of invoice PDF to your registered email address.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotify(!emailNotify)}
                  className={`w-11 h-6 rounded-full p-1 relative flex items-center transition-all cursor-pointer ${emailNotify ? 'bg-primary' : 'bg-navy-elevated border border-navy-border'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailNotify ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────── */}
        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="bg-navy-card border border-navy-border/60 p-6 sm:p-8 rounded-card shadow-card-glow flex flex-col gap-6">
            <h2 className="text-base font-display font-extrabold text-text-primary border-b border-navy-border/40 pb-3 uppercase tracking-wider">
              Subscription Plan Details
            </h2>

            {/* Current plan summary */}
            <div className="bg-navy-elevated/40 border border-navy-border/80 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Active Plan</span>
                <p className="text-lg font-bold text-text-primary mt-1">Technician Pro — Free Beta Trial</p>
                <p className="text-xs text-text-secondary mt-1">First 500 early access accounts get free unlimited voice note generations.</p>
              </div>
              <span className="bg-success/15 border border-success/20 text-success text-[10px] font-bold px-3 py-1 rounded-badge uppercase">
                ACTIVE
              </span>
            </div>

            {/* Billing logs mock list */}
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Payment Invoices</h3>
              <div className="border border-navy-border/80 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-navy-elevated/20 p-3 border-b border-navy-border/50 text-text-secondary font-bold">
                  <span>Reference ID</span>
                  <span>Billing Period</span>
                  <span className="text-right">Price</span>
                </div>
                <div className="p-3 text-text-secondary italic">
                  No payment invoices billed yet. You are currently on free trial.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
