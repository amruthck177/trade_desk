import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Wrench, 
  Users,
  Package,
  Settings as SettingsIcon, 
  LogOut, 
  Mic, 
  Plus, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Menu,
  X,
  CreditCard
} from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices & Jobs', path: '/jobs', icon: Wrench },
    { name: 'Customers CRM', path: '/customers', icon: Users },
    { name: 'Rate Cards', path: '/catalog', icon: Package },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-navy-primary text-text-primary flex font-sans">
      
      {/* 1. SIDEBAR (Desktop/Tablet) */}
      <aside 
        className={`hidden md:flex flex-col bg-navy-card border-r border-navy-border transition-all duration-300 relative z-30 ${
          sidebarExpanded ? 'w-60' : 'w-20'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="absolute -right-3 top-6 w-6 h-6 bg-primary border border-primary/20 rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer z-50"
        >
          {sidebarExpanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Brand Header */}
        <Link to="/" className="h-16 flex items-center px-5 gap-2.5 border-b border-navy-border/60">
          <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0 animate-pulse-slow">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          {sidebarExpanded && (
            <span className="font-display font-black text-base tracking-tight text-text-primary animate-fade-in">
              TradeDesk <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase ml-1">AI</span>
            </span>
          )}
        </Link>

        {/* Nav Links */}
        <nav className="flex-1 py-5 px-3 flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 py-2.5 px-3.5 rounded-xl font-medium text-xs transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-primary/15 text-primary border border-primary/30 font-bold shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-navy-surface border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-primary' : 'text-text-secondary'}`} />
                {sidebarExpanded && <span>{item.name}</span>}
                {!sidebarExpanded && (
                  <div className="absolute left-16 bg-navy-card border border-navy-border text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-3 border-t border-navy-border/60 flex flex-col gap-2">
          <div className="flex items-center gap-3 p-1.5 rounded-xl bg-navy-surface/60">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0 overflow-hidden">
              {user?.logoUrl ? (
                <img src={`http://localhost:5000/${user.logoUrl}`} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'T'
              )}
            </div>
            {sidebarExpanded && (
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-bold text-text-primary truncate">{user?.name}</p>
                <p className="text-[10px] text-text-secondary truncate">{user?.businessName || 'Technician Pro'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold text-danger/80 hover:text-danger hover:bg-danger/10 transition-all w-full text-left cursor-pointer ${
              !sidebarExpanded && 'justify-center px-0'
            }`}
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            {sidebarExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative pb-20 md:pb-0">
        {/* Top Sticky Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-navy-border sticky top-0 bg-navy-primary/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-sm text-text-secondary md:hidden flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" /> TradeDesk
            </span>
            <span className="hidden md:inline text-xs bg-navy-card border border-navy-border px-3 py-1 rounded-badge text-text-secondary font-mono">
              ⚡ {user?.businessName || 'Field Technician'} • GST Invoicing Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/jobs/new"
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-orange-glow/20 shadow-md transition-all hover:scale-102 active:scale-98"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Record Job</span>
            </Link>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* 3. BOTTOM NAV (Mobile Only < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-navy-card/95 border-t border-navy-border backdrop-blur-xl flex items-center justify-around z-40 px-2 shadow-2xl">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentPath === '/dashboard' ? 'text-primary scale-105 font-bold' : 'text-text-secondary'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[9px] mt-1">Home</span>
        </Link>

        <Link
          to="/jobs"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentPath === '/jobs' ? 'text-primary scale-105 font-bold' : 'text-text-secondary'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span className="text-[9px] mt-1">Jobs</span>
        </Link>

        {/* Mobile Central FAB */}
        <div className="flex-1 flex justify-center -translate-y-4">
          <Link
            to="/jobs/new"
            className="w-12 h-12 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-orange-glow shadow-lg border-4 border-navy-primary active:scale-95 transition-all cursor-pointer z-50"
          >
            <Mic className="w-5 h-5" />
          </Link>
        </div>

        <Link
          to="/customers"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentPath === '/customers' ? 'text-primary scale-105 font-bold' : 'text-text-secondary'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[9px] mt-1">CRM</span>
        </Link>

        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentPath === '/settings' ? 'text-primary scale-105 font-bold' : 'text-text-secondary'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span className="text-[9px] mt-1">Settings</span>
        </Link>
      </nav>

    </div>
  );
}
