import React, { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  KeyRound, 
  Cpu, 
  Save, 
  ShieldAlert,
  Coins,
  BadgeAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import Toast from '../../components/Toast';
import { safeStorage } from '../../services/safeStorage';

export const Settings = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [personalOpenAiKey, setPersonalOpenAiKey] = useState(safeStorage.getItem(`adviral_personal_key_openai_${user?.id}`) || '');
  const [personalGeminiKey, setPersonalGeminiKey] = useState(safeStorage.getItem(`adviral_personal_key_gemini_${user?.id}`) || '');
  
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'warning');
      return;
    }

    setFormLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate save

    // Update in LocalStorage & local mock db
    const users = JSON.parse(safeStorage.getItem('adviral_users')) || [];
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index].name = name.trim();
      safeStorage.setItem('adviral_users', JSON.stringify(users));
    }

    // Save personal keys
    safeStorage.setItem(`adviral_personal_key_openai_${user.id}`, personalOpenAiKey.trim());
    safeStorage.setItem(`adviral_personal_key_gemini_${user.id}`, personalGeminiKey.trim());

    const updatedUser = { ...user, name: name.trim() };
    setUser(updatedUser);
    safeStorage.setItem('adviral_active_user', JSON.stringify(updatedUser));
    
    setFormLoading(false);
    showToast('Profile configuration updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-wide">Account Configuration</h2>
        <p className="text-xs text-gray-400 mt-1">
          Customize your creator profile credentials, manage personal API security keys, and inspect subscription levels.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Profile Details (7 columns) */}
        <div className="md:col-span-7 glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl space-y-5">
          
          <div className="flex items-center gap-2 pb-3 border-b border-purple-500/10 select-none">
            <div className="p-1.5 bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded-lg">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gray-200 tracking-wide">Creator Profile Details</h3>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Registered Full Name</label>
            <input
              type="text"
              required
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none transition-all"
            />
          </div>

          {/* Email Address (disabled) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Email Address (Read-only)</label>
            <input
              type="email"
              disabled
              value={user?.email || 'email@domain.com'}
              className="w-full bg-purple-950/5 border border-purple-500/5 rounded-xl py-2 px-3.5 text-xs text-gray-500 cursor-not-allowed select-none"
            />
          </div>

          {/* Custom Personal API keys box */}
          <div className="border-t border-purple-500/10 pt-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-purple-400 select-none">
              <KeyRound className="w-4 h-4 text-purple-400" />
              Personal AI Provider Keys (Optional)
            </div>
            <p className="text-[10px] text-gray-500 leading-normal font-medium">
              Want to skip platform limits? Supply your personal API keys below. If entered, your generations will connect directly to OpenAI/Gemini using your key, completely bypassing SaaS default limits!
            </p>

            {/* Personal OpenAI Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Personal OpenAI Key</label>
              <input
                type="password"
                placeholder="sk-proj-••••••••••••••••"
                value={personalOpenAiKey}
                onChange={(e) => setPersonalOpenAiKey(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Personal Gemini Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Personal Gemini Key</label>
              <input
                type="password"
                placeholder="AIzaSy••••••••••••••••"
                value={personalGeminiKey}
                onChange={(e) => setPersonalGeminiKey(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={formLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 btn-primary rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer disabled:opacity-60"
          >
            {formLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Commit Modifications
              </>
            )}
          </button>

        </div>

        {/* Right Side: Account Summary details (5 columns) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          
          {/* Subscription Summary */}
          <div className="glass-panel rounded-2xl border-purple-500/15 p-5 shadow-lg space-y-4">
            <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider select-none">Active Subscription Tier</div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-base font-black text-white">{user?.plan} Level Premium</h4>
                <div className="text-[10px] text-gray-500 font-semibold uppercase">Renews monthly</div>
              </div>
              <div className="p-3 bg-purple-500/15 text-purple-400 rounded-2xl border border-purple-500/20 font-black text-xs select-none">
                {user?.plan}
              </div>
            </div>

            <div className="h-[1px] bg-purple-500/10" />

            <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
              <span>Account Role</span>
              <span className="text-purple-300 font-extrabold capitalize">{user?.role}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
              <span>Available Wallet Balance</span>
              <span className="text-purple-300 font-extrabold">
                {user?.plan === 'Enterprise' ? 'Unlimited' : `${user?.credits || 0} Credits`}
              </span>
            </div>
          </div>

          {/* Security Alert box */}
          <div className="glass-panel rounded-2xl border-rose-500/15 p-5 shadow-lg space-y-3 bg-rose-950/5">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-black uppercase tracking-wider select-none">
              <BadgeAlert className="w-4 h-4 text-rose-400" />
              API Security Disclaimer
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
              Your API keys are encrypted and stored solely in your local web browser session (`localStorage`). They are never uploaded or indexed by our SaaS servers. Keep your API keys safe!
            </p>
          </div>

        </div>

      </form>

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
export default Settings;
