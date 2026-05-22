import React, { useState } from 'react';
import { 
  Coins, 
  Settings, 
  Sparkles, 
  Flame, 
  Clapperboard, 
  Plus, 
  Save, 
  Gift, 
  RefreshCw,
  CoinsIcon,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import Toast from '../../components/Toast';
import { safeStorage } from '../../services/safeStorage';

export const CreditManagement = () => {
  const { users, adminAddUserCredits, refreshAllData } = useDatabase();

  // Load and save local settings for credit operations
  const [welcomeCredits, setWelcomeCredits] = useState(
    parseInt(safeStorage.getItem('adviral_config_welcome_credits')) || 50
  );
  
  // Custom tool pricing state
  const [costAd, setCostAd] = useState(
    parseInt(safeStorage.getItem('adviral_config_cost_ad_generator')) || 1
  );
  const [costHooks, setCostHooks] = useState(
    parseInt(safeStorage.getItem('adviral_config_cost_viral_hooks')) || 1
  );
  const [costScripts, setCostScripts] = useState(
    parseInt(safeStorage.getItem('adviral_config_cost_ugc_scripts')) || 1
  );
  const [costImageGen, setCostImageGen] = useState(
    parseInt(safeStorage.getItem('adviral_config_cost_image_generator')) ?? 5
  );
  const [costVision, setCostVision] = useState(
    parseInt(safeStorage.getItem('adviral_config_cost_ai_vision')) ?? 2
  );
  const [enableImageTools, setEnableImageTools] = useState(
    safeStorage.getItem('adviral_config_enable_image_tools') !== 'false'
  );

  // Global operations state
  const [bulkBonus, setBulkBonus] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSaveConfigs = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    safeStorage.setItem('adviral_config_welcome_credits', welcomeCredits.toString());
    safeStorage.setItem('adviral_config_cost_ad_generator', costAd.toString());
    safeStorage.setItem('adviral_config_cost_viral_hooks', costHooks.toString());
    safeStorage.setItem('adviral_config_cost_ugc_scripts', costScripts.toString());
    safeStorage.setItem('adviral_config_cost_image_generator', costImageGen.toString());
    safeStorage.setItem('adviral_config_cost_ai_vision', costVision.toString());
    safeStorage.setItem('adviral_config_enable_image_tools', enableImageTools.toString());

    setFormLoading(false);
    showToast('Platform configurations and credit cost rates updated!', 'success');
  };

  const handleGlobalGift = async (e) => {
    e.preventDefault();
    if (!bulkBonus || parseInt(bulkBonus) <= 0) {
      showToast('Please enter a valid positive bonus amount.', 'warning');
      return;
    }

    setBulkLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate mass DB execution

    // Loop and add credits to all typical users (skip admin)
    users.forEach(u => {
      if (u.role !== 'admin') {
        adminAddUserCredits(u.id, bulkBonus);
      }
    });

    refreshAllData();
    setBulkLoading(false);
    showToast(`Global injection complete! Granted +${bulkBonus} credits to all accounts.`, 'success');
    setBulkBonus('');
  };

  const handleMassReset = () => {
    if (confirm('Are you sure you want to reset ALL users back to their plan default credit limits? This will override custom credits.')) {
      // Stub: in database context this is triggered per user
      users.forEach(u => {
        const defaultLimit = u.plan === 'Pro' ? 1000 : u.plan === 'Enterprise' ? 99999 : 50;
        // Direct storage update
        const rawUsers = JSON.parse(safeStorage.getItem('adviral_users')) || [];
        const idx = rawUsers.findIndex(item => item.id === u.id);
        if (idx !== -1) {
          rawUsers[idx].credits = defaultLimit;
          safeStorage.setItem('adviral_users', JSON.stringify(rawUsers));
        }
      });
      refreshAllData();
      showToast('All accounts reset to subscription baselines.', 'info');
    }
  };

  // Calculate platform credit aggregate
  const totalActiveCredits = users
    .filter(u => u.plan !== 'Enterprise')
    .reduce((acc, u) => acc + (u.credits || 0), 0);

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-wide">Credit Settings & Global Wallet Operations</h2>
        <p className="text-xs text-gray-400 mt-1">
          Set default registration welcome points, modify individual tool consumption costs, and perform bulk credit drops.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: System pricing configurations (7 columns) */}
        <form onSubmit={handleSaveConfigs} className="md:col-span-7 glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-purple-500/10 select-none">
            <div className="p-1.5 bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded-lg">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gray-200 tracking-wide">Credit System Settings</h3>
          </div>

          {/* Default welcome points */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Default Sign Up Credits</label>
            <input
              type="number"
              required
              value={welcomeCredits}
              onChange={(e) => setWelcomeCredits(parseInt(e.target.value) || 0)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none"
            />
            <p className="text-[10px] text-gray-500">Welcome points loaded automatically on new email registrations.</p>
          </div>

          {/* Pricing per Tool grid */}
          <div className="space-y-3 pt-2 border-t border-purple-500/5">
            <div className="text-xs font-black uppercase text-purple-400 tracking-wider select-none">Individual Tool Cost Rates</div>
            
            {/* Tool 1: Ad Generator */}
            <div className="flex items-center justify-between p-3.5 bg-black/40 border border-purple-500/10 rounded-xl">
              <div className="flex items-center gap-3 select-none">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs font-bold text-gray-200">AI Ad Copy Generator</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  value={costAd}
                  onChange={(e) => setCostAd(parseInt(e.target.value) || 0)}
                  className="w-16 bg-[#120a1f] border border-purple-500/15 focus:border-purple-500/40 rounded-lg py-1 px-2 text-xs text-center text-white focus:outline-none font-bold"
                />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black select-none">Credits</span>
              </div>
            </div>

            {/* Tool 2: Viral Hooks */}
            <div className="flex items-center justify-between p-3.5 bg-black/40 border border-purple-500/10 rounded-xl">
              <div className="flex items-center gap-3 select-none">
                <Flame className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs font-bold text-gray-200">Viral Hook Builder</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  value={costHooks}
                  onChange={(e) => setCostHooks(parseInt(e.target.value) || 0)}
                  className="w-16 bg-[#120a1f] border border-purple-500/15 focus:border-purple-500/40 rounded-lg py-1 px-2 text-xs text-center text-white focus:outline-none font-bold"
                />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black select-none">Credits</span>
              </div>
            </div>

            {/* Tool 3: UGC Scripts */}
            <div className="flex items-center justify-between p-3.5 bg-black/40 border border-purple-500/10 rounded-xl">
              <div className="flex items-center gap-3 select-none">
                <Clapperboard className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs font-bold text-gray-200">UGC Scripting Director</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  value={costScripts}
                  onChange={(e) => setCostScripts(parseInt(e.target.value) || 0)}
                  className="w-16 bg-[#120a1f] border border-purple-500/15 focus:border-purple-500/40 rounded-lg py-1 px-2 text-xs text-center text-white focus:outline-none font-bold"
                />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black select-none">Credits</span>
              </div>
            </div>

            {/* Tool 4: AI Image Generator */}
            <div className="flex items-center justify-between p-3.5 bg-black/40 border border-purple-500/10 rounded-xl">
              <div className="flex items-center gap-3 select-none">
                <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs font-bold text-gray-200">AI Image Generator</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  value={costImageGen}
                  onChange={(e) => setCostImageGen(parseInt(e.target.value) || 0)}
                  className="w-16 bg-[#120a1f] border border-purple-500/15 focus:border-purple-500/40 rounded-lg py-1 px-2 text-xs text-center text-white focus:outline-none font-bold"
                />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black select-none">Credits</span>
              </div>
            </div>

            {/* Tool 5: AI Vision Auditor */}
            <div className="flex items-center justify-between p-3.5 bg-black/40 border border-purple-500/10 rounded-xl">
              <div className="flex items-center gap-3 select-none">
                <Eye className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs font-bold text-gray-200">AI Vision auditor</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  value={costVision}
                  onChange={(e) => setCostVision(parseInt(e.target.value) || 0)}
                  className="w-16 bg-[#120a1f] border border-purple-500/15 focus:border-purple-500/40 rounded-lg py-1 px-2 text-xs text-center text-white focus:outline-none font-bold"
                />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black select-none">Credits</span>
              </div>
            </div>

            {/* Global Switch: Enable Image & Vision tools */}
            <div className="flex items-center justify-between p-3.5 bg-purple-950/20 border border-purple-500/15 rounded-xl">
              <div className="flex flex-col text-left select-none max-w-[70%]">
                <span className="text-xs font-bold text-purple-200">Enable Premium Image Tools</span>
                <span className="text-[9px] text-gray-500 font-semibold leading-normal mt-0.5">
                  Globally show or hide AI Image Generator and AI Vision menus on user dashboards.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={enableImageTools}
                  onChange={(e) => setEnableImageTools(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white" />
              </label>
            </div>
          </div>

          {/* Commit Save */}
          <button
            type="submit"
            disabled={formLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 btn-primary rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer"
          >
            {formLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Platform Configurations
              </>
            )}
          </button>
        </form>

        {/* Right Side: Global Mass drops (5 columns) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          
          {/* Active Ledger statistics */}
          <div className="glass-panel rounded-2xl border-purple-500/15 p-5 shadow-lg space-y-2 select-none">
            <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider">Active Credit Supply</div>
            <h3 className="text-xl font-black text-white">{totalActiveCredits.toLocaleString()} Active</h3>
            <p className="text-[10px] text-gray-500 leading-normal font-semibold">
              Total cumulative credits circulating across standard Free/Pro tiers (excluding unlimited Enterprise subscriptions).
            </p>
          </div>

          {/* Mass Global injection */}
          <div className="glass-panel rounded-2xl border-purple-500/15 p-5 shadow-lg space-y-4">
            <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" />
              Mass Credit Airdrop
            </div>
            <p className="text-[10px] text-gray-500 leading-normal font-semibold">
              Inject bonus credits globally onto all registered user balances simultaneously.
            </p>

            <form onSubmit={handleGlobalGift} className="space-y-3">
              <input
                type="number"
                required
                placeholder="e.g. +100 bonus credits"
                value={bulkBonus}
                onChange={(e) => setBulkBonus(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={bulkLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {bulkLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Launch Airdrop Drop
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Mass System Reset controls */}
          <div className="glass-panel rounded-2xl border-rose-500/15 p-5 shadow-lg space-y-3 bg-rose-950/5">
            <div className="text-[10px] text-rose-400 font-black uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
              Reset Wallet Baselines
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
              Perform a database-wide override resetting all user credit balances back to standard limits defined in their billing subscription tiers.
            </p>
            <button
              onClick={handleMassReset}
              className="w-full py-2 px-3 bg-rose-950 hover:bg-rose-900 border border-rose-500/25 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Reset All User Balances
            </button>
          </div>

        </div>

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
export default CreditManagement;
