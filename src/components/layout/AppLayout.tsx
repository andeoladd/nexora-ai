import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SUPPORT_CONFIG } from '../../config/support';
import {
  Sparkles,
  LayoutDashboard,
  Globe,
  Search,
  ListFilter,
  MessageSquare,
  Layers,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
} from 'lucide-react';

interface AppLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSupport: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onNavigate,
  onOpenSupport,
  children,
}) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'website-analyzer', label: 'Website Analyzer', icon: Globe },
    { id: 'find-leads', label: 'Find Leads', icon: Search },
    { id: 'leads', label: 'Leads Pipeline', icon: ListFilter },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'campaigns', label: 'Campaigns', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">Nexora</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-300 hover:text-white p-1 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 md:min-h-screen z-30`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">Nexora</span>
              <span className="block text-[10px] text-indigo-400 font-medium">Growth Intelligence</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Support Direct Action in Sidebar (Section 3) */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onOpenSupport}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-slate-700/60 text-xs font-semibold transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Contact Support</span>
          </button>
        </div>

        {/* User Account Capsule */}
        <div className="p-3 border-t border-slate-800/80 relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/70 transition-colors text-left"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-700/50 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">{user?.display_name || 'User'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {userDropdownOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 text-xs text-slate-300 z-50">
              <button
                type="button"
                onClick={() => {
                  onNavigate('settings');
                  setUserDropdownOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-700/60 flex items-center space-x-2 text-white"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Account Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenSupport();
                  setUserDropdownOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-700/60 flex items-center space-x-2 text-white"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Contact Support</span>
              </button>
              <div className="border-t border-slate-700/60 my-1" />
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-500/20 text-rose-300 flex items-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main App Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            Nexora SaaS Workspace • <span className="text-slate-800 capitalize">{currentView.replace(/-/g, ' ')}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onOpenSupport}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Contact Support</span>
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
