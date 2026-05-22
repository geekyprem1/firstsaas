import React, { useState } from 'react';
import { 
  Clapperboard, 
  Copy, 
  Check, 
  RotateCcw, 
  FolderHeart, 
  ArrowRight,
  Sparkles,
  Eye,
  Video,
  Mic,
  MessageSquare,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { generateAIContent } from '../../services/aiService';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';

export const UGCScriptGenerator = () => {
  const { user } = useAuth();
  const { deductCredits, addGeneration, toggleSaveProject, apiSettings } = useDatabase();

  // Form states
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('Energetic');

  // UI States
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentGenId, setCurrentGenId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeScriptTab, setActiveScriptTab] = useState('tiktok'); // 'tiktok', 'testimonial', 'problem', 'thirty'
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleCopyText = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(section);
    showToast('Dialogue copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    if (!productName || !productDesc || !targetAudience) {
      showToast('Please fill in name, description, and audience.', 'warning');
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
      const activeApi = apiSettings.find(a => a.is_default && a.status);
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
        target_audience: targetAudience,
        tone: tone
      };

      const generatedData = await generateAIContent('ugc_scripts', inputPayload, apiProvider, apiKey);
      const savedGen = await addGeneration('ugc_scripts', inputPayload, generatedData, user.id);

      setResult(generatedData);
      setCurrentGenId(savedGen ? savedGen.id : null);
      showToast('UGC Scripts generated! -1 credit.', 'success');
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
    showToast(!isSaved ? 'Scripts saved successfully!' : 'Scripts removed from library.', 'info');
  };

  const getActiveScriptData = () => {
    if (!result) return null;
    switch (activeScriptTab) {
      case 'tiktok': return { label: 'TikTok Trend Script', ...result.tiktok_script };
      case 'testimonial': return { label: 'Creator Testimonial', ...result.testimonial_script };
      case 'problem': return { label: 'Problem-Solution Video', ...result.problem_solution_script };
      case 'thirty': return { label: '30-Second Commercial', ...result.thirty_second_ad };
      default: return null;
    }
  };

  const activeScript = getActiveScriptData();

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-wide">UGC Scripting Director</h2>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          Create structured video directives for your content creators. Generate cinematic visual directions, sound designs, and conversion dialogues for TikTok trends, case reviews, and commercials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form panel (5 columns) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-purple-500/10">
            <div className="p-1.5 bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded-lg">
              <Clapperboard className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-200 tracking-wide">Configure Director</h3>
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. FitFlow Resistance Bands"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
            />
          </div>

          {/* Product Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Core Feature / Visual Benefit</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Fabric resistance bands that physically cannot roll up or pinch, bundled with a 10-minute daily home workout app."
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Target Audience</label>
            <input
              type="text"
              required
              placeholder="e.g. Busy mothers wanting fast, effective home workouts"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
            />
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Presentation Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-[#120a1f] border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-purple-300 focus:outline-none transition-all"
            >
              {['Energetic', 'Bold', 'Witty', 'Professional', 'Minimalist'].map(t => (
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
                Create Scripts (-1 Credit)
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Display Sandbox Panel (7 columns) */}
        <div className="lg:col-span-7 flex flex-col justify-start">
          {loading && <Loader />}

          {!loading && !result && (
            <div className="w-full py-24 glass-panel rounded-2xl border-purple-500/15 border-dashed flex flex-col items-center justify-center text-center p-6 min-h-[440px]">
              <Clapperboard className="w-12 h-12 text-purple-500/20 mb-4 animate-pulse-glow" />
              <h3 className="text-base font-extrabold text-gray-300">Script Studio Ready</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed font-medium">
                Set your parameters, select a tone, and click generate. We will construct fully fleshed-out video storyboards and verbal lines.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="glass-panel rounded-2xl border-purple-500/20 p-6 shadow-xl space-y-6">
              
              {/* Header Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-500/10">
                {/* Format selection sub-tabs */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'tiktok', label: 'TikTok Trend' },
                    { id: 'testimonial', label: 'Testimonial' },
                    { id: 'problem', label: 'Problem-Solution' },
                    { id: 'thirty', label: '30s Ad' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveScriptTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${activeScriptTab === tab.id ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSaveProject}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${isSaved ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-300'}`}
                  >
                    <FolderHeart className="w-3.5 h-3.5" />
                    {isSaved ? 'Saved' : 'Save Script'}
                  </button>
                  <button
                    onClick={() => handleGenerate()}
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Script Details Panel */}
              {activeScript && (
                <div className="space-y-5 animate-pulse-glow">
                  <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200">
                    {activeScript.label}
                  </h3>

                  {/* 1. Visual Directives */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 select-none">
                      <Video className="w-3.5 h-3.5 text-purple-400" />
                      Visual / Camera Storyboard
                    </h4>
                    <div className="p-3.5 bg-black/40 border border-purple-500/10 rounded-xl text-xs text-gray-300 leading-relaxed font-medium">
                      {activeScript.visual}
                    </div>
                  </div>

                  {/* 2. Audio Background */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 select-none">
                      <Mic className="w-3.5 h-3.5 text-indigo-400" />
                      Sound Design & BGM
                    </h4>
                    <div className="p-3.5 bg-black/40 border border-purple-500/10 rounded-xl text-xs text-gray-300 leading-relaxed font-medium font-mono">
                      {activeScript.audio}
                    </div>
                  </div>

                  {/* 3. Dialogue Script */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center select-none">
                      <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                        Spoken Dialogue / Voiceover Text
                      </h4>
                      <button
                        onClick={() => handleCopyText(activeScript.dialogue, 'dialogue')}
                        className="flex items-center gap-1 text-[10px] text-purple-300 hover:text-purple-200 font-extrabold cursor-pointer"
                      >
                        {copiedIndex === 'dialogue' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy Spoken Script
                      </button>
                    </div>
                    <div className="p-4 bg-purple-950/10 border border-purple-500/15 rounded-xl text-xs leading-relaxed text-purple-100 font-bold whitespace-pre-wrap select-text break-words shadow-inner">
                      {activeScript.dialogue}
                    </div>
                  </div>

                </div>
              )}

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
export default UGCScriptGenerator;
