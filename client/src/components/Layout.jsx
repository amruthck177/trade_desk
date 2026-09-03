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
  CreditCard,
  BookOpen,
  RefreshCw,
  UserCheck
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
    { name: 'Invoices & Quotes', path: '/jobs', icon: Wrench },
    { name: 'Digital Khata (उधार)', path: '/khata', icon: BookOpen },
    { name: 'Technicians Crew', path: '/team', icon: Users },
    { name: 'AMC Contracts', path: '/amc', icon: RefreshCw },
    { name: 'Customers CRM', path: '/customers', icon: UserCheck },
    { name: 'Rate Cards', path: '/catalog', icon: Package },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-navy-primary text-text-primary flex font-sans selection:bg-primary selection:text-white">
      
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
            <span className="font-display font-black text-base tracking-tight text-white animate-fade-in">
              TradeDesk <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase ml-1">PRO</span>
            </span>
          )}
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-card-glow shadow-primary/20' 
                    : 'text-text-secondary hover:text-white hover:bg-navy-surface'
                }`}
                title={!sidebarExpanded ? item.name : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarExpanded && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout Bottom */}
        <div className="p-3 border-t border-navy-border/60 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-navy-surface/50 border border-navy-border/40">
            <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            {sidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.businessName || user?.name || 'Technician'}</p>
                <p className="text-[10px] text-text-muted truncate font-mono">{user?.phone || 'Online'}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-danger hover:bg-danger/10 transition-colors w-full ${
              !sidebarExpanded && 'justify-center'
            }`}
            title="Log Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar (Mobile / Header) */}
        <header className="h-16 bg-navy-card/80 backdrop-blur-md border-b border-navy-border px-4 sm:px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <Link to="/" className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <span className="font-display font-black text-sm text-white">TradeDesk</span>
            </Link>
          </div>

          {/* Quick Actions in Navbar */}
          <div className="flex items-center gap-3">
            <Link
              to="/jobs/new"
              className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-orange-glow transition-all active:scale-95"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice Invoice</span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden bg-navy-card border-t border-navy-border px-2 py-1.5 flex items-center justify-around z-30">
          {[
            { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Invoices', path: '/jobs', icon: Wrench },
            { name: 'Khata', path: '/khata', icon: BookOpen },
            { name: 'Team', path: '/team', icon: Users },
            { name: 'CRM', path: '/customers', icon: UserCheck }
          ].map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold ${
                  isActive ? 'text-primary' : 'text-text-muted hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

      </div>

    </div>
  );
}
