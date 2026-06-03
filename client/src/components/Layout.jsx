import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Wrench, 
  Settings as SettingsIcon, 
  LogOut, 
  Mic, 
  Plus, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Menu,
  X
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
    { name: 'Jobs', path: '/jobs', icon: Wrench },
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
        className={`hidden md:flex flex-col bg-navy-card border-r border-navy-border/60 transition-all duration-300 relative z-30 ${
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
        <div className="h-16 flex items-center px-6 gap-2 border-b border-navy-border/40">
          <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0 animate-pulse-slow">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          {sidebarExpanded && (
            <span className="font-display font-extrabold text-base tracking-tight text-text-primary animate-fade-in">
              TradeDesk
            </span>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/10' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-navy-elevated/40 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-primary' : 'text-text-secondary'}`} />
                {sidebarExpanded && <span>{item.name}</span>}
                {!sidebarExpanded && (
                  <div className="absolute left-16 bg-navy-elevated border border-navy-border text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-elevated z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-navy-border/40 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-elevated border border-navy-border/60 flex items-center justify-center text-primary font-bold flex-shrink-0">
              {user?.logoUrl ? (
                <img src={`http://localhost:5000/${user.logoUrl}`} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'T'
              )}
            </div>
            {sidebarExpanded && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-text-primary truncate">{user?.name}</p>
                <p className="text-[10px] text-text-secondary truncate">{user?.businessName || 'Plumbing Pro'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 py-2 px-4 rounded-xl text-xs font-semibold text-danger/80 hover:text-danger hover:bg-danger/5 transition-all w-full text-left cursor-pointer ${
              !sidebarExpanded && 'justify-center px-0'
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative pb-20 md:pb-0">
        {/* Top Sticky Header (Desktop and Mobile) */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-navy-border/50 sticky top-0 bg-navy-primary/75 backdrop-blur-xl z-20">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-sm text-text-secondary md:hidden flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" /> TradeDesk
            </span>
            <span className="hidden md:inline text-xs bg-navy-elevated border border-navy-border/80 px-3 py-1 rounded-badge text-text-secondary font-mono">
              Workspace // {user?.businessName || 'General Repair'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/jobs/new"
              className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 px-4 rounded-button shadow-card-glow shadow-primary/10 transition-all hover:scale-102 active:scale-98"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Record Job</span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-navy-elevated border border-navy-border/80 flex items-center justify-center text-text-secondary relative cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-primary absolute top-0.5 right-0.5 animate-pulse" />
              🔔
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* 3. BOTTOM NAV (Mobile Only < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-navy-card/90 border-t border-navy-border/50 backdrop-blur-lg flex items-center justify-around z-40 px-2 shadow-elevated">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentPath === '/dashboard' ? 'text-primary scale-105' : 'text-text-secondary'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
        </Link>

        <Link
          to="/jobs"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentPath === '/jobs' ? 'text-primary scale-105' : 'text-text-secondary'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Jobs</span>
        </Link>

        {/* Mobile Central FAB */}
        <div className="flex-1 flex justify-center -translate-y-4">
          <button
            onClick={() => setFabMenuOpen(!fabMenuOpen)}
            className="w-13 h-13 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-orange-glow border-4 border-navy-primary active:scale-95 hover:scale-105 transition-all cursor-pointer z-50"
          >
            {fabMenuOpen ? <X className="w-6 h-6 transition-transform rotate-90" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>

        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            currentPath === '/settings' ? 'text-primary scale-105' : 'text-text-secondary'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 py-1 text-danger/80 hover:text-danger active:scale-95 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Logout</span>
        </button>
      </nav>

      {/* 4. MOBILE ACTION FAB OVERLAY MENU */}
      {fabMenuOpen && (
        <>
          {/* Overlay Backdrop */}
          <div 
            onClick={() => setFabMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-navy-primary/70 backdrop-blur-sm z-40 transition-opacity"
          />
          {/* Draw Menu drawer */}
          <div className="md:hidden fixed bottom-20 left-4 right-4 bg-navy-elevated border border-navy-border/80 p-5 rounded-modal z-50 flex flex-col gap-3 shadow-elevated animate-drawer-up">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Quick Action</h3>
            <button
              onClick={() => {
                setFabMenuOpen(false);
                navigate('/jobs/new?type=voice');
              }}
              className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl text-left transition-all active:scale-98"
            >
              <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                <Mic className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Record Voice Note</p>
                <p className="text-[11px] text-text-secondary">Speech-to-Invoice in 30 seconds</p>
              </div>
            </button>
            <button
              onClick={() => {
                setFabMenuOpen(false);
                navigate('/jobs/new?type=manual');
              }}
              className="flex items-center gap-3 p-4 bg-navy-card border border-navy-border hover:bg-navy-elevated rounded-xl text-left transition-all active:scale-98"
            >
              <div className="w-9 h-9 bg-secondary/15 rounded-lg flex items-center justify-center text-secondary">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Manual Entry Form</p>
                <p className="text-[11px] text-text-secondary">Type customer & line items manually</p>
              </div>
            </button>
          </div>
        </>
      )}

    </div>
  );
}
