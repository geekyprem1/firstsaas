import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

// User Views
import UserDashboard from './pages/user/UserDashboard';
import AdGenerator from './pages/user/AdGenerator';
import HookGenerator from './pages/user/HookGenerator';
import UGCScriptGenerator from './pages/user/UGCScriptGenerator';
import SavedProjects from './pages/user/SavedProjects';
import Billing from './pages/user/Billing';
import Settings from './pages/user/Settings';

// Admin Views
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CreditManagement from './pages/admin/CreditManagement';
import APISettings from './pages/admin/APISettings';
import PlansPricing from './pages/admin/PlansPricing';
import GenerationsLog from './pages/admin/GenerationsLog';
import Analytics from './pages/admin/Analytics';

// Icons & Toasts
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import Toast from './components/Toast';

// Sub-component to leverage React Contexts
const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [activeView, setActiveView] = useState('user_dashboard');
  const [publicTab, setPublicTab] = useState('landing'); // 'landing' or 'auth'
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync activeView with user role changes automatically
  useEffect(() => {
    if (user) {
      // Ensure we clear out of login page once authenticated
      setPublicTab('landing');
      
      if (user.role === 'admin') {
        if (!activeView.startsWith('admin_')) {
          setActiveView('admin_dashboard');
        }
      } else {
        if (activeView.startsWith('admin_')) {
          setActiveView('user_dashboard');
        }
      }
    }
  }, [user]);

  // Loading indicator screen
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4 select-none">
        <div className="relative">
          {/* Pulsing gradient glow */}
          <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-xl animate-pulse" />
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin relative z-10" />
        </div>
        <div className="text-xs font-black uppercase text-purple-400 tracking-widest animate-pulse">
          AdViral AI Engine loading...
        </div>
      </div>
    );
  }

  // Not Authenticated flow
  if (!user) {
    if (publicTab === 'landing') {
      return (
        <LandingPage 
          onAuthAction={(mode) => {
            setPublicTab('auth');
          }} 
        />
      );
    }
    
    // Auth mode (Login / Sign Up tabs)
    return (
      <div className="relative min-h-screen bg-black">
        {/* Floating Back to Home Navigation */}
        <button
          onClick={() => setPublicTab('landing')}
          className="fixed top-5 left-5 z-50 flex items-center gap-1.5 py-2 px-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-purple-500/10 hover:border-purple-500/30 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer select-none"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400" />
          Back to Home
        </button>
        <Login onViewChange={setActiveView} />
      </div>
    );
  }

  // Suspended Account -> Ban layout
  if (user.is_banned) {
    return (
      <div className="min-h-screen bg-[#07020d] bg-gradient-to-br from-black via-[#090314] to-[#1b0632] flex items-center justify-center p-4">
        {/* Decorative Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

        <div className="max-w-md w-full glass-panel border-rose-500/20 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(244,63,94,0.08)] relative z-10">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-rose-500/20 rounded-2xl blur-xl animate-pulse" />
            <div className="bg-rose-950/40 border border-rose-500/30 text-rose-400 p-4 rounded-2xl relative z-10">
              <ShieldAlert className="w-10 h-10 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-white">Account Access Suspended</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your AdViral AI SaaS access has been restricted by platform compliance rules. Please audit subscription credentials or connect with site support nodes.
            </p>
          </div>

          {/* Account information details card */}
          <div className="bg-black/40 border border-rose-500/10 rounded-2xl p-4 text-left text-xs font-semibold text-gray-400 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500 uppercase select-none">Client Email</span>
              <span className="text-gray-300 font-bold">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500 uppercase select-none">Active UID</span>
              <span className="font-mono text-[10px] text-rose-400/80">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500 uppercase select-none">Access Level</span>
              <span className="text-gray-300 font-bold uppercase">{user.plan} ({user.role})</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => logout()}
              className="flex-1 py-3 px-4 bg-rose-950 hover:bg-rose-900 border border-rose-500/25 hover:border-rose-500/40 text-rose-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Session
            </button>
            <a
              href="mailto:support@adviral.ai"
              className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-transparent hover:border-purple-500/25 flex items-center justify-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render view controller mappings
  const renderView = () => {
    switch (activeView) {
      // Standard Client views
      case 'user_dashboard':
        return <UserDashboard onViewChange={setActiveView} />;
      case 'ad_generator':
        return <AdGenerator />;
      case 'viral_hooks':
        return <HookGenerator />;
      case 'ugc_scripts':
        return <UGCScriptGenerator />;
      case 'saved_projects':
        return <SavedProjects />;
      case 'billing':
        return <Billing />;
      case 'settings':
        return <Settings />;

      // Administrative views
      case 'admin_dashboard':
        return <AdminDashboard onViewChange={setActiveView} />;
      case 'admin_users':
        return <UserManagement />;
      case 'admin_credits':
        return <CreditManagement />;
      case 'admin_api':
        return <APISettings />;
      case 'admin_plans':
        return <PlansPricing />;
      case 'admin_generations':
        return <GenerationsLog />;
      case 'admin_analytics':
        return <Analytics />;
      case 'admin_settings':
        return <CreditManagement />; // Map systems configuration to dynamic Credit controls

      default:
        return <UserDashboard onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#07020d] text-gray-200 overflow-hidden font-sans antialiased">
      {/* Sidebar Panel Navigation drawer wrapper */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* Main viewport panels */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Glow absolute decoration */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <Header 
          activeView={activeView} 
          setMobileOpen={setMobileOpen} 
          onViewChange={setActiveView} 
        />

        {/* Content canvas scrolling container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-black via-[#080312] to-[#110522] scrollbar-thin">
          <div className="animate-fadeIn max-w-6xl mx-auto space-y-6">
            {renderView()}
          </div>
        </main>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

// Global App wrapper orchestrating contexts loading
function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <AppContent />
      </DatabaseProvider>
    </AuthProvider>
  );
}

export default App;
