import React, { useState } from 'react';
import { 
  Cpu, 
  Key, 
  Check, 
  HelpCircle, 
  Save, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import Toast from '../../components/Toast';

export const APISettings = () => {
  const { apiSettings, adminUpdateApiSetting, adminSetDefaultProvider } = useDatabase();
  const [toast, setToast] = useState(null);

  const openaiProvider = apiSettings.find(a => a.provider_name === 'openai');
  const geminiProvider = apiSettings.find(a => a.provider_name === 'gemini');

  const isOpenaiActive = openaiProvider && openaiProvider.status && openaiProvider.api_key && !openaiProvider.api_key.includes('••••');
  const isGeminiActive = geminiProvider && geminiProvider.status && geminiProvider.api_key && !geminiProvider.api_key.includes('••••');

  // Key visibility toggles
  const [showKeys, setShowKeys] = useState({});
  // Form input values (holds typed keys)
  const [formKeys, setFormKeys] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleKeyToggle = (providerName) => {
    setShowKeys(prev => ({
      ...prev,
      [providerName]: !prev[providerName]
    }));
  };

  const handleKeyChange = (providerName, val) => {
    setFormKeys(prev => ({
      ...prev,
      [providerName]: val
    }));
  };

  const handleSaveProvider = (provider) => {
    const enteredKey = formKeys[provider.provider_name] !== undefined 
      ? formKeys[provider.provider_name] 
      : provider.api_key;

    adminUpdateApiSetting(provider.provider_name, enteredKey, provider.status);
    showToast(`${provider.provider_name.toUpperCase()} credentials updated successfully!`, 'success');
  };

  const handleToggleStatus = (provider) => {
    const enteredKey = formKeys[provider.provider_name] !== undefined 
      ? formKeys[provider.provider_name] 
      : provider.api_key;

    const nextStatus = !provider.status;
    adminUpdateApiSetting(provider.provider_name, enteredKey, nextStatus);
    showToast(`${provider.provider_name.toUpperCase()} is now ${nextStatus ? 'ENABLED' : 'DISABLED'}`, 'info');
  };

  const handleSetDefault = (providerName) => {
    adminSetDefaultProvider(providerName);
    showToast(`${providerName.toUpperCase()} is now set as the system-wide default provider.`, 'success');
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Title block */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
          AI Provider Integrations Settings
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Configure systems API credentials, enable/disable generation adapters, and choose the default platform LLM fallback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left main provider list (8 columns) */}
        <div className="lg:col-span-8 space-y-5">
          {apiSettings.map((provider) => {
            const isDefault = provider.is_default;
            const isEnabled = provider.status;
            const provKey = provider.provider_name;
            const isVisible = showKeys[provKey];
            const currentInputValue = formKeys[provKey] !== undefined ? formKeys[provKey] : provider.api_key;

            return (
              <div 
                key={provider.id} 
                className={`glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl relative transition-all duration-300 ${
                  isEnabled 
                    ? 'shadow-[0_0_20px_rgba(168,85,247,0.05)] border-purple-500/20' 
                    : 'opacity-70 grayscale border-gray-800'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl font-bold uppercase text-xs tracking-wider border select-none ${
                      provKey === 'openai' 
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                        : 'bg-blue-950/40 text-blue-400 border-blue-500/20'
                    }`}>
                      {provKey}
                    </div>
                    <div className="flex items-center gap-2 select-none">
                      {isDefault && (
                        <span className="text-[10px] bg-purple-600/20 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full font-black tracking-wide uppercase">
                          System Default
                        </span>
                      )}
                      <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                      <span className="text-[10px] text-gray-500 font-bold uppercase">
                        {isEnabled ? 'Active' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons header */}
                  <div className="flex items-center gap-2">
                    {!isDefault && isEnabled && (
                      <button
                        onClick={() => handleSetDefault(provKey)}
                        className="py-1.5 px-3 bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-500/20 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}

                    {/* Enable Toggle Switch */}
                    <button
                      onClick={() => handleToggleStatus(provider)}
                      className={`flex items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isEnabled
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/30'
                          : 'bg-rose-950/20 border-rose-500/20 text-rose-400 hover:bg-rose-950/30'
                      }`}
                    >
                      {isEnabled ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          Disabled
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Form Input fields */}
                <div className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                      <span>API Secret Token / Token Key</span>
                      <span className="text-[10px] text-gray-500 lowercase font-medium select-none">
                        used for server compilations
                      </span>
                    </label>

                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-gray-500 pointer-events-none select-none">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        type={isVisible ? "text" : "password"}
                        value={currentInputValue}
                        onChange={(e) => handleKeyChange(provKey, e.target.value)}
                        placeholder={provKey === 'openai' ? "sk-proj-..." : "AIzaSy..."}
                        className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-10 text-xs text-white focus:outline-none placeholder-gray-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleKeyToggle(provKey)}
                        className="absolute right-3.5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Settings description */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <p className="text-[10px] text-gray-500 leading-normal max-w-md font-semibold select-none">
                      Credentials are saved safely inside mock storage configurations. In Production, these map to Supabase Environment Secrets.
                    </p>

                    <button
                      onClick={() => handleSaveProvider(provider)}
                      className="flex items-center justify-center gap-1.5 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Credentials
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Info pane (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-2xl border-purple-500/15 p-5 shadow-lg space-y-3 select-none">
            <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Dynamic Model Switching
            </div>
            <p className="text-[10px] text-gray-400 leading-normal font-semibold">
              AdViral AI features context-sensitive automatic routing. The platform leverages the <strong>default active provider</strong> first.
            </p>
            <p className="text-[10px] text-gray-500 leading-normal">
              If the default provider experiences quota errors, it falls back seamlessly to the secondary active provider, ensuring uninterrupted operation for your subscribers.
            </p>
          </div>

          <div className="glass-panel rounded-2xl border-purple-500/15 p-5 shadow-lg space-y-3.5 bg-purple-950/5">
            <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
              Integration Audits
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400">
                <span>OpenAI Connection</span>
                {isOpenaiActive ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Online
                  </span>
                ) : (
                  <span className="text-gray-500">Inactive</span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400">
                <span>Gemini API Node</span>
                {isGeminiActive ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="text-gray-500">Inactive</span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400">
                <span>SSL Security</span>
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Active
                </span>
              </div>
            </div>
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

export default APISettings;
