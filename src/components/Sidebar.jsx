import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Flame, 
  Clapperboard, 
  FolderHeart, 
  CreditCard, 
  Settings, 
  LogOut,
  Users,
  Coins,
  Cpu,
  Tags,
  History,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { safeStorage } from '../services/safeStorage';

export const Sidebar = ({ activeView, onViewChange, mobileOpen, setMobileOpen }) => {
  const { user, logout, switchUserRole } = useAuth();

  const handleNavClick = (viewId) => {
    onViewChange(viewId);
    if (setMobileOpen) setMobileOpen(false); // Close mobile drawer on selection
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  const handleRoleToggle = () => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    switchUserRole(nextRole);
    // Switch to appropriate landing tab
    onViewChange(nextRole === 'admin' ? 'admin_dashboard' : 'user_dashboard');
  };

  // Navigations Definitions
  const imageToolsEnabled = safeStorage.getItem('adviral_config_enable_image_tools') !== 'false';

  const userNav = [
    { id: 'user_dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'ad_generator', label: 'AI Ad Generator', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'viral_hooks', label: 'Viral Hooks', icon: <Flame className="w-5 h-5" /> },
    { id: 'ugc_scripts', label: 'UGC Scripts', icon: <Clapperboard className="w-5 h-5" /> },
    ...(imageToolsEnabled ? [
      { id: 'image_generator', label: 'AI Image Generator', icon: <ImageIcon className="w-5 h-5" /> },
      { id: 'vision', label: 'AI Vision', icon: <Eye className="w-5 h-5" /> }
    ] : []),
    { id: 'saved_projects', label: 'Saved Projects', icon: <FolderHeart className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing & Pricing', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const adminNav = [
    { id: 'admin_dashboard', label: 'Admin Panel', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'admin_users', label: 'User Accounts', icon: <Users className="w-5 h-5" /> },
    { id: 'admin_credits', label: 'Credit Controls', icon: <Coins className="w-5 h-5" /> },
    { id: 'admin_api', label: 'API Integrations', icon: <Cpu className="w-5 h-5" /> },
    { id: 'admin_plans', label: 'Plans & Pricing', icon: <Tags className="w-5 h-5" /> },
    { id: 'admin_generations', label: 'Generations Logs', icon: <History className="w-5 h-5" /> },
    { id: 'admin_analytics', label: 'Analytics Insights', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'admin_settings', label: 'System Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const currentNav = activeView.startsWith('admin_') ? adminNav : userNav;

  return (
    <>
      {/* Mobile Backdrop Drawer */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Panel */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-[#090513] border-r border-purple-500/15 flex flex-col z-50
        transition-transform duration-300 lg:translate-x-0 lg:static lg:h-[100vh]
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-purple-500/10">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                AdViral <span className="text-purple-400 font-semibold text-xs uppercase px-1.5 py-0.5 rounded bg-purple-950/50 border border-purple-800/30">AI</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Sidebar Scrollable Navigations */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="text-xs uppercase tracking-wider text-purple-400/50 px-3 mb-2 font-semibold">
            {activeView.startsWith('admin_') ? 'Admin Operations' : 'SaaS Application'}
          </div>
          {currentNav.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.08)]' 
                    : 'text-gray-400 hover:text-purple-200 hover:bg-white/5 border border-transparent'}
                `}
              >
                <div className={`${isActive ? 'text-purple-400' : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Operations */}
        <div className="p-4 border-t border-purple-500/10 space-y-3 bg-[#0c071a]/40">
          {/* Quick Role Switcher (Visible to Whitelisted Admins/Devs) */}
          {(user?.role === 'admin' || 
            user?.email === 'geekyprem4@gmail.com' || 
            user?.email === 'admin@adviral.ai' || 
            user?.email === 'alex@example.com') && (
            <button
              onClick={handleRoleToggle}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-500/20 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-[0_0_10px_rgba(168,85,247,0.05)] cursor-pointer"
            >
              {activeView.startsWith('admin_') ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  Switch to User Dashboard
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  Switch to Admin Panel
                </>
              )}
            </button>
          )}

          {/* User Account Info Bar */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-sm font-bold text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)] uppercase shrink-0">
              {user?.name?.substring(0, 2) || 'AV'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-200 truncate">{user?.name || 'Loading Account'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email || 'email@provider.com'}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 bg-white/5 hover:bg-rose-950/30 hover:border-rose-900/30 text-gray-400 hover:text-rose-400 border border-transparent rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
