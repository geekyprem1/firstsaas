import React, { useState } from 'react';
import { 
  Flame, 
  Copy, 
  Check, 
  RotateCcw, 
  FolderHeart, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  Brain,
  TrendingUp,
  Skull,
  Eye,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { generateAIContent } from '../../services/aiService';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';

export const HookGenerator = () => {
  const { user } = useAuth();
  const { deductCredits, addGeneration, toggleSaveProject, apiSettings } = useDatabase();

  // Input states
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('Bold');

  // UI state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentGenId, setCurrentGenId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null); // { section, index }
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleCopyText = (text, section, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex({ section, index });
    showToast('Copied hook to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    if (!productName || !productDesc) {
      showToast('Please fill in the product name and description.', 'warning');
      return;
    }

    if (user.plan !== 'Enterprise' && user.credits < 1) {
      showToast('Insufficient credits! Please top up in the billing tab.', 'error');
      return;
    }

    setLoading(true);
    setResult(null);
    setIsSaved(false);

    try {
      // Filter only enabled providers that have a configured key (not masked with dots or empty)
      const validApis = apiSettings.filter(a => a.status && a.api_key && !a.api_key.includes('••••'));
      
      // Prefer the default provider if it is in our valid list
      let activeApi = validApis.find(a => a.is_default);
      
      // Fallback to any valid provider if default is not fully configured
      if (!activeApi) {
        activeApi = validApis[0];
      }

      const apiProvider = activeApi ? activeApi.provider_name : 'openai';
      const apiKey = activeApi ? activeApi.api_key : '';

      const deductionSuccess = await deductCredits(user.id, 1);
      if (!deductionSuccess) {
        showToast('Credit check failed.', 'error');
        setLoading(false);
        return;
      }

      const inputPayload = {
        product_name: productName,
        product_description: productDesc,
        target_audience: targetAudience || 'General Consumers',
        tone: tone
      };

      const generatedData = await generateAIContent('viral_hooks', inputPayload, apiProvider, apiKey);
      const savedGen = await addGeneration('viral_hooks', inputPayload, generatedData, user.id);

      setResult(generatedData);
      setCurrentGenId(savedGen ? savedGen.id : null);
      showToast('Hooks structured! -1 credit.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Generation failed. Checking API credentials...', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!currentGenId) return;
    await toggleSaveProject(currentGenId);
    setIsSaved(!isSaved);
    showToast(!isSaved ? 'Hooks saved to Saved Projects!' : 'Removed hooks from Saved Projects.', 'info');
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-wide">Psychology-Backed Viral Hooks Builder</h2>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          Get scroll-stopping marketing angles based on cognitive neuroscience. Generate Curiosity hooks, Emotional hooks, Fear-inducing hooks, and TikTok-specific hooks to double your click-through rates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form panel (5 columns) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-purple-500/10">
            <div className="p-1.5 bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded-lg">
              <Flame className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-gray-200 tracking-wide">Configure Hook Builder</h3>
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. SleepGlow Nightcap"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
            />
          </div>

          {/* Product Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Core Hook/Problem Solved</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. A silk-lined sleep cap that protects curly hair from frizz and breakage, while infusing lavender micro-nutrients."
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Target Audience (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Natural hair enthusiasts, curly hair women"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
            />
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Emotional Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-[#120a1f] border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-purple-300 focus:outline-none transition-all"
            >
              {['Bold', 'Witty', 'Professional', 'Energetic', 'Minimalist'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 btn-primary rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Build Viral Hooks (-1 Credit)
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Display Panel (7 columns) */}
        <div className="lg:col-span-7 flex flex-col justify-start">
          {loading && <Loader />}

          {!loading && !result && (
            <div className="w-full py-24 glass-panel rounded-2xl border-purple-500/15 border-dashed flex flex-col items-center justify-center text-center p-6 min-h-[440px]">
              <Flame className="w-12 h-12 text-purple-500/20 mb-4 animate-pulse-glow" />
              <h3 className="text-base font-extrabold text-gray-300">Hooks Sandbox Active</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed font-medium">
                Enter your product benefits in the configurator. AdViral will structure copy variations targeting specific emotional trigger points.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="glass-panel rounded-2xl border-purple-500/20 p-6 shadow-xl space-y-6">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-purple-500/15 border border-purple-500/25 text-purple-400 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {tone} Hooks
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">• Psychology-mapped</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveProject}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${isSaved ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'}`}
                  >
                    <FolderHeart className="w-3.5 h-3.5" />
                    {isSaved ? 'Saved' : 'Save Hooks'}
                  </button>
                  <button
                    onClick={() => handleGenerate()}
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 1. Curiosity Hooks (Brain Icon) */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 select-none">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  Curiosity / Open Loop Hooks
                </h4>
                <div className="space-y-2">
                  {result.curiosity_hooks?.map((h, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-black/40 border border-purple-500/10 rounded-xl hover:border-purple-500/20 transition-all text-left text-xs font-medium text-gray-300">
                      <span className="flex-1 pr-4 font-mono">"{h}"</span>
                      <button
                        onClick={() => handleCopyText(h, 'curiosity', idx)}
                        className="p-1.5 bg-white/5 hover:bg-purple-600/30 text-gray-400 hover:text-purple-300 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {copiedIndex?.section === 'curiosity' && copiedIndex?.index === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Emotional Hooks (Heart Icon) */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 select-none">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Emotional Connection Hooks
                </h4>
                <div className="space-y-2">
                  {result.emotional_hooks?.map((h, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-black/40 border border-purple-500/10 rounded-xl hover:border-purple-500/20 transition-all text-left text-xs font-medium text-gray-300">
                      <span className="flex-1 pr-4 font-mono">"{h}"</span>
                      <button
                        onClick={() => handleCopyText(h, 'emotional', idx)}
                        className="p-1.5 bg-white/5 hover:bg-purple-600/30 text-gray-400 hover:text-purple-300 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {copiedIndex?.section === 'emotional' && copiedIndex?.index === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Fear / FOMO Hooks (Skull Icon) */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 select-none">
                  <Skull className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  Fear of Loss / FOMO Hooks
                </h4>
                <div className="space-y-2">
                  {result.fear_hooks?.map((h, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-black/40 border border-purple-500/10 rounded-xl hover:border-purple-500/20 transition-all text-left text-xs font-medium text-gray-300">
                      <span className="flex-1 pr-4 font-mono text-amber-100/90">"{h}"</span>
                      <button
                        onClick={() => handleCopyText(h, 'fear', idx)}
                        className="p-1.5 bg-white/5 hover:bg-purple-600/30 text-gray-400 hover:text-purple-300 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {copiedIndex?.section === 'fear' && copiedIndex?.index === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Viral TikTok Hooks (TrendingUp Icon) */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 select-none">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  TikTok & Reels Viral Triggers
                </h4>
                <div className="space-y-2">
                  {result.viral_hooks?.map((h, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-black/40 border border-purple-500/10 rounded-xl hover:border-purple-500/20 transition-all text-left text-xs font-medium text-gray-300">
                      <span className="flex-1 pr-4 font-mono text-purple-100">"{h}"</span>
                      <button
                        onClick={() => handleCopyText(h, 'viral', idx)}
                        className="p-1.5 bg-white/5 hover:bg-purple-600/30 text-gray-400 hover:text-purple-300 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {copiedIndex?.section === 'viral' && copiedIndex?.index === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Short-form Video Hooks (Eye Icon) */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 select-none">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  Short-form Video Text Overlays
                </h4>
                <div className="space-y-2">
                  {result.short_form_hooks?.map((h, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-black/40 border border-purple-500/10 rounded-xl hover:border-purple-500/20 transition-all text-left text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200">
                      <span className="flex-1 pr-4">"{h}"</span>
                      <button
                        onClick={() => handleCopyText(h, 'short', idx)}
                        className="p-1.5 bg-white/5 hover:bg-purple-600/30 text-gray-400 hover:text-purple-300 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {copiedIndex?.section === 'short' && copiedIndex?.index === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

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
export default HookGenerator;
