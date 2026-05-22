import React from 'react';
import { Menu, Wallet, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ activeView, setMobileOpen, onViewChange }) => {
  const { user } = useAuth();

  // Convert activeView key into premium Title
  const getHeaderTitle = () => {
    switch (activeView) {
      // User Tabs
      case 'user_dashboard': return 'Dashboard Overview';
      case 'ad_generator': return 'AI Ad Copy Generator';
      case 'viral_hooks': return 'Viral Hook Builder';
      case 'ugc_scripts': return 'UGC Script Studio';
      case 'saved_projects': return 'Saved Copy Library';
      case 'billing': return 'Billing & Pricing';
      case 'settings': return 'Account Settings';
      
      // Admin Tabs
      case 'admin_dashboard': return 'Admin Panel Overview';
      case 'admin_users': return 'User Accounts Directory';
      case 'admin_credits': return 'Credit & Tool Pricing Controls';
      case 'admin_api': return 'AI Provider Integrations';
      case 'admin_plans': return 'SaaS Subscription Plans';
      case 'admin_generations': return 'Global Audit & Generations Logs';
      case 'admin_analytics': return 'Platform Analytics & Growth';
      case 'admin_settings': return 'SaaS System Configuration';
      
      default: return 'AdViral AI Dashboard';
    }
  };

  const isAdminView = activeView.startsWith('admin_');

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[#090513]/40 backdrop-blur-md border-b border-purple-500/10 sticky top-0 z-35">
      {/* Mobile Drawer Trigger & View Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 hover:bg-white/5 border border-purple-500/15 rounded-lg text-gray-400 hover:text-white lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-md sm:text-lg font-bold tracking-wide text-white flex items-center gap-2">
          {isAdminView && <Shield className="w-4 h-4 text-purple-400 animate-pulse" />}
          {getHeaderTitle()}
        </h1>
      </div>

      {/* Credit Ledger & Role Indicator Badges */}
      <div className="flex items-center gap-3">
        {/* Role Indicator Badge */}
        <div className={`
          hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide select-none
          ${isAdminView 
            ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
            : 'bg-indigo-950/30 border-indigo-500/20 text-indigo-300'}
        `}>
          {isAdminView ? (
            <>
              <Shield className="w-3 h-3 text-purple-400" />
              Admin Access
            </>
          ) : (
            <>
              <User className="w-3 h-3 text-indigo-400" />
              Creator Panel
            </>
          )}
        </div>

        {/* Credit Indicator Wallet Card */}
        {user?.plan === 'Enterprise' ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#170e28]/70 border border-purple-500/30 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-purple-400/65 font-bold tracking-wider leading-none uppercase">Enterprise Plan</span>
              <span className="text-xs font-black text-white leading-none mt-0.5">Unlimited Credits</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onViewChange('billing')}
            className="flex items-center gap-2.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-950/30 to-violet-950/30 hover:from-purple-950/50 hover:to-violet-950/50 border border-purple-500/20 hover:border-purple-500/40 rounded-full transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.05)] group"
          >
            <Wallet className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-none">Wallet Balance</span>
              <span className="text-xs font-extrabold text-purple-200 leading-none mt-0.5">
                {user?.credits !== undefined ? user.credits : 0} <span className="text-[10px] text-gray-400 font-medium">credits</span>
              </span>
            </div>
          </button>
        )}
      </div>
    </header>
  );
};
export default Header;
