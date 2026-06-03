import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, ArrowRight, Play, Check, Star, Menu, X, Sparkles, Send, LayoutDashboard, Wrench, FileText } from 'lucide-react';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'yearly'

  const toggleBilling = () => {
    setBillingPeriod(prev => prev === 'monthly' ? 'yearly' : 'monthly');
  };

  return (
    <div className="min-h-screen bg-navy-primary text-text-primary font-sans relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px] pointer-events-none -z-10 animate-float" />
      <div className="absolute top-[40%] right-[5%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[150px] pointer-events-none -z-10" />

      {/* 1. STICKY NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-navy-primary/70 backdrop-blur-xl border-b border-navy-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo Left */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8.5 h-8.5 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 active:scale-95 transition-all shadow-orange-glow/10">
              <Sparkles className="w-4.5 h-4.5 fill-current animate-pulse-slow" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight group-hover:text-primary transition-colors">
              TradeDesk
            </span>
          </Link>

          {/* Nav Links Center (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-text-primary transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
          </nav>

          {/* Right Action buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-all py-2 px-4 active:scale-95"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-bold bg-primary hover:bg-primary-hover text-white py-2.5 px-5 rounded-2xl shadow-elevated shadow-primary/10 transition-all hover:scale-105 active:scale-[0.98] cursor-pointer"
            >
              Get Started
            </Link>
          </div>

          {/* Hamburger (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-text-secondary hover:text-text-primary transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-navy-card/95 border-b border-navy-border/60 backdrop-blur-lg p-6 flex flex-col gap-5 animate-drawer-up absolute w-full left-0 top-16 shadow-elevated">
            <nav className="flex flex-col gap-4 text-sm font-medium">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-text-secondary hover:text-text-primary py-1"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-text-secondary hover:text-text-primary py-1"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-text-secondary hover:text-text-primary py-1"
              >
                Pricing
              </a>
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-navy-border/60">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-text-secondary hover:text-text-primary"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 md:py-32 grid md:grid-cols-12 gap-12 items-center">
        {/* Left Column Content */}
        <div className="md:col-span-7 flex flex-col gap-6 text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 border border-primary/20 text-primary">
              🔥 Free for First 500 Tradespeople
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-tight tracking-tight text-text-primary">
            Turn Your Voice Into A Professional{' '}
            <span className="relative inline-block text-primary">
              Invoice
              <svg className="absolute -bottom-2 left-0 w-full h-3.5 text-primary fill-none stroke-current" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 C30,9 70,1 100,5" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>{' '}
            In 30 Seconds
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
            Built specifically for electricians, plumbers, carpenters, and AC technicians. No paperwork. No laptops. Just speak and send right from your phone.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-7 rounded-button shadow-card-glow shadow-primary/25 hover:scale-105 active:scale-98 transition-all text-center cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 bg-navy-card hover:bg-navy-elevated text-text-primary border border-navy-border font-bold py-3.5 px-7 rounded-button hover:scale-102 active:scale-98 transition-all text-center"
            >
              <Play className="w-3.5 h-3.5 fill-current text-primary" />
              <span>Watch Demo</span>
            </a>
          </div>
        </div>

        {/* Right Column: 3D Phone Mockup & Stats */}
        <div className="md:col-span-5 relative flex justify-center py-8">
          {/* Phone Frame */}
          <div className="w-[280px] h-[570px] bg-navy-card rounded-[40px] p-3 border-4 border-navy-border/80 shadow-elevated relative animate-float">
            {/* Camera notch */}
            <div className="w-28 h-4 bg-navy-primary rounded-full absolute top-5 left-1/2 -translate-x-1/2 z-10" />

            {/* Inner Phone Screen Content Mockup */}
            <div className="w-full h-full bg-navy-primary rounded-[32px] overflow-hidden flex flex-col justify-between p-5 relative">
              {/* Fake Status bar */}
              <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary pt-2">
                <span>9:41</span>
                <span className="flex items-center gap-1">📶 🔋 5G</span>
              </div>

              {/* Fake Recorder UI */}
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-navy-elevated border border-navy-border px-2.5 py-1 rounded-badge">
                  Recording Note...
                </span>

                {/* Pulsing Mic Ring */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <div className="absolute inset-2 bg-primary/30 rounded-full animate-pulse" />
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-orange-glow relative z-10">
                    <Mic className="w-7 h-7" />
                  </div>
                </div>

                {/* Simulated Sound Wave indicators */}
                <div className="flex items-center gap-1 h-6">
                  {[0.5, 0.9, 0.6, 1.2, 0.4, 0.8, 0.3, 0.7].map((scale, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full animate-wave"
                      style={{
                        height: '100%',
                        animationDelay: `${i * 0.15}s`,
                        transform: `scaleY(${scale})`
                      }}
                    />
                  ))}
                </div>

                {/* Fake transcription text */}
                <div className="bg-navy-elevated/80 border border-navy-border/60 p-3 rounded-xl w-full text-left">
                  <p className="text-[10px] text-text-secondary font-mono leading-relaxed">
                    "...installed a 1.5 ton AC unit for Amrut. Spent 3 hours. Material used copper pipes for 1800..."
                  </p>
                </div>
              </div>

              {/* Step indicator footer mockup */}
              <div className="flex items-center justify-between border-t border-navy-border/40 pt-3">
                <span className="flex items-center gap-1"><Mic className="w-3.5 h-3.5 text-primary" /> Speak</span>
                <span className="text-text-secondary animate-pulse">➔</span>
                <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-secondary" /> AI Parser</span>
                <span className="text-text-secondary animate-pulse">➔</span>
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-success" /> Invoice</span>
              </div>
            </div>
          </div>

          {/* Floating Stat Cards (Desktop Only) */}
          <div className="absolute -left-10 top-12 glass-effect p-3.5 rounded-xl shadow-card-glow flex items-center gap-3 animate-float pointer-events-none z-20">
            <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success text-base">
              ₹
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-secondary uppercase">Revenue</p>
              <p className="text-xs font-mono font-bold text-text-primary">₹1,24,000</p>
            </div>
          </div>

          <div 
            className="absolute -right-6 bottom-16 glass-effect p-3.5 rounded-xl shadow-card-glow flex items-center gap-3 animate-float pointer-events-none z-20"
            style={{ animationDelay: '2s' }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-secondary uppercase">Sent</p>
              <p className="text-xs font-mono font-bold text-text-primary">47 Invoices</p>
            </div>
          </div>

          <div 
            className="absolute left-4 -bottom-4 glass-effect p-3.5 rounded-xl shadow-card-glow flex items-center gap-3 animate-float pointer-events-none z-20"
            style={{ animationDelay: '4s' }}
          >
            <div className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center text-warning text-sm">
              <Star className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-secondary uppercase">Rating</p>
              <p className="text-xs font-mono font-bold text-text-primary">4.9 Star</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF (Technicians Grid) */}
      <section className="bg-navy-card/45 border-y border-navy-border/40 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-6">
            Trusted by Field Experts Across Regions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 opacity-60">
            <div className="flex items-center justify-center font-display font-bold text-sm sm:text-base text-text-secondary">
              ⚡ INDORE ELECTRICIANS
            </div>
            <div className="flex items-center justify-center font-display font-bold text-sm sm:text-base text-text-secondary">
              🔧 CHENNAI PLUMBERS
            </div>
            <div className="flex items-center justify-center font-display font-bold text-sm sm:text-base text-text-secondary">
              ❄️ DELHI AC CLINIC
            </div>
            <div className="flex items-center justify-center font-display font-bold text-sm sm:text-base text-text-secondary">
              🪵 BANGALORE WOODWORKS
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 flex flex-col gap-16">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Features</span>
          <h2 className="text-3xl font-display font-black text-text-primary">
            Designed for the Field. Simple, Robust, Fast.
          </h2>
          <p className="text-sm text-text-secondary">
            No complex dashboards or confusing workflows. We provide exactly what you need to bill your clients instantly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-effect p-8 rounded-card hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary mb-6">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-3">Voice Note Recording</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Just record a voice message after completing a service. Speak in Hindi, Tamil, English, or mixed language notes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-effect p-8 rounded-card hover:border-secondary/40 hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 bg-secondary/15 border border-secondary/20 rounded-xl flex items-center justify-center text-secondary mb-6">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-3">AI structured extraction</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Our background parsing engine automatically matches customer details, labor, materials items, and GST ranges.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-effect p-8 rounded-card hover:border-success/40 hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 bg-success/15 border border-success/20 rounded-xl flex items-center justify-center text-success mb-6">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-3">Instant WhatsApp Dispatch</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Send the completed GST invoice PDF directly to client's phone. No email checks or manual attachment uploads required.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="bg-navy-card/35 border-y border-navy-border/40 py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-16">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Simple Steps</span>
            <h2 className="text-3xl font-display font-black text-text-primary">
              Speak to Invoice in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col gap-4 text-left relative">
              <div className="w-10 h-10 rounded-xl bg-primary text-white font-mono font-black flex items-center justify-center shadow-orange-glow text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-text-primary">Record Service Summary</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Tapping the record button logs your description. E.g. "Completed switchboard repair for Anil on 9898777766. Material was 2 switches of 120 Rs."
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-4 text-left relative">
              <div className="w-10 h-10 rounded-xl bg-secondary text-white font-mono font-black flex items-center justify-center shadow-md text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-text-primary">Review Structured Layout</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Our parser structures your transcript. Adjust materials rates, add manual rows, or switch GST toggles before locking invoice details.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-4 text-left relative">
              <div className="w-10 h-10 rounded-xl bg-success text-white font-mono font-black flex items-center justify-center shadow-md text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-text-primary">Send via WhatsApp</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                A single click compiles the PDF invoice and delivers it to the customer via Twilio API WhatsApp. Done!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 flex flex-col gap-16">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-4">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl font-display font-black text-text-primary">
            Simple, Transparent Billing Plans
          </h2>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center justify-center gap-3.5 mt-2">
            <span className={`text-sm font-semibold transition-colors ${billingPeriod === 'monthly' ? 'text-text-primary' : 'text-text-secondary'}`}>
              Monthly
            </span>
            <button
              onClick={toggleBilling}
              className="w-12 h-6.5 rounded-full bg-navy-card border border-navy-border p-1 relative flex items-center transition-all cursor-pointer"
            >
              <div className={`w-4.5 h-4.5 bg-primary rounded-full transition-transform ${billingPeriod === 'yearly' ? 'translate-x-5.5' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-semibold transition-colors ${billingPeriod === 'yearly' ? 'text-text-primary' : 'text-text-secondary'}`}>
              Yearly <span className="text-[10px] bg-success/10 text-success border border-success/20 py-0.5 px-1.5 rounded-badge ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
          {/* Free Tier */}
          <div className="glass-effect p-8 rounded-card relative flex flex-col justify-between border-navy-border/80">
            <div className="flex flex-col gap-4 text-left">
              <h3 className="text-lg font-bold text-text-primary">Basic Starter</h3>
              <p className="text-xs text-text-secondary">Great for tradespeople starting out in service.</p>
              <div className="my-2">
                <span className="text-4xl font-mono font-black text-text-primary">₹0</span>
                <span className="text-xs text-text-secondary font-semibold"> / forever</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-xs text-text-secondary border-t border-navy-border/40 pt-4 mt-2">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> 5 voice invoices per month</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Standard PDF invoice generation</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Local WhatsApp text dispatch</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="bg-navy-elevated hover:bg-navy-border text-text-primary border border-navy-border/60 font-bold py-3 px-6 rounded-button text-center transition-all mt-8"
            >
              Choose Starter
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="glass-effect p-8 rounded-card relative flex flex-col justify-between border-primary/30 shadow-orange-glow/10">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-orange-glow">
              Popular Plan
            </div>

            <div className="flex flex-col gap-4 text-left">
              <h3 className="text-lg font-bold text-text-primary">Technician Pro</h3>
              <p className="text-xs text-text-secondary">For established plumbers and electricians.</p>
              <div className="my-2">
                <span className="text-4xl font-mono font-black text-text-primary">
                  {billingPeriod === 'monthly' ? '₹799' : '₹640'}
                </span>
                <span className="text-xs text-text-secondary font-semibold"> / month</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-xs text-text-secondary border-t border-navy-border/40 pt-4 mt-2">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Unlimited voice-to-invoice notes</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Custom GSTIN & business logo support</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> UPI Payment QR generated inside PDF</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Twilio Automated WhatsApp Delivery</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Month-end revenue analytics reports</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-button text-center transition-all mt-8 shadow-orange-glow/20"
            >
              Get Started Pro
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="bg-navy-card/25 border-t border-navy-border/40 py-24">
        <div className="max-w-3xl mx-auto px-6 flex flex-col gap-12 text-left">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2 mb-4">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">FAQs</span>
            <h2 className="text-3xl font-display font-black text-text-primary">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="border-b border-navy-border/60 pb-5">
              <h4 className="font-bold text-base text-text-primary mb-2">Can I speak in Hindi or regional languages?</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Yes! Our system uses OpenAI Whisper which transcribes Hindi, Tamil, Telugu, Kannada, Spanish, and mixed vernacular code languages (Hinglish) with high accuracy.
              </p>
            </div>

            <div className="border-b border-navy-border/60 pb-5">
              <h4 className="font-bold text-base text-text-primary mb-2">How does the WhatsApp delivery work?</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Once generated, the system creates a secure link to download the invoice PDF. We use the Twilio WhatsApp API to dispatch it as a templated alert directly to the client's mobile number.
              </p>
            </div>

            <div className="pb-2">
              <h4 className="font-bold text-base text-text-primary mb-2">Is a credit card required for the free trial?</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                No, you can sign up and start recording jobs immediately. No credit card is required to register.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-navy-card border-t border-navy-border py-12 text-center text-xs text-text-secondary">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-display font-extrabold text-sm tracking-tight text-text-primary">
              TradeDesk
            </span>
          </div>

          <p className="text-text-secondary">
            © {new Date().getFullYear()} TradeDesk SaaS. Designed for modern service professionals.
          </p>
        </div>
      </footer>

    </div>
  );
}
