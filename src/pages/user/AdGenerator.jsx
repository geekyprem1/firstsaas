import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  FolderHeart, 
  ArrowRight, 
  AlertCircle,
  FileText,
  Volume2,
  Tv,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { generateAIContent } from '../../services/aiService';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';

export const AdGenerator = () => {
  const { user } = useAuth();
  const { deductCredits, addGeneration, toggleSaveProject, apiSettings } = useDatabase();

  // Form Inputs State
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [platform, setPlatform] = useState('Facebook');
  const [tone, setTone] = useState('Bold');
  const [ctaStyle, setCtaStyle] = useState('Shop Now');

  // App UI State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentGenId, setCurrentGenId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  
  // Copy to clipboard tracking states
  const [copiedIndex, setCopiedIndex] = useState(null); // { section: 'headline', index: 0 }
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleCopyText = (text, section, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex({ section, index });
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    
    if (!productName || !productDesc || !targetAudience) {
      showToast('Please fill in the product name, description, and audience.', 'warning');
      return;
    }

    // 1. Credit Check
    if (user.plan !== 'Enterprise' && user.credits < 1) {
      showToast('Insufficient credits! Please upgrade your plan in the billing page.', 'error');
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

      // 3. Deduct credit
      const deductionSuccess = await deductCredits(user.id, 1);
      if (!deductionSuccess) {
        showToast('Credit deduction failed. Please try again.', 'error');
        setLoading(false);
        return;
      }

      // 4. Generate copy content
      const inputPayload = {
        product_name: productName,
        product_description: productDesc,
        target_audience: targetAudience,
        platform: platform,
        tone: tone,
        cta_style: ctaStyle
      };

      const generatedData = await generateAIContent('ad_generator', inputPayload, apiProvider, apiKey);

      // 5. Store generation in DB history
      const savedGen = await addGeneration('ad_generator', inputPayload, generatedData, user.id);
      
      setResult(generatedData);
      setCurrentGenId(savedGen ? savedGen.id : null);
      showToast('Copy generated successfully! -1 credit.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Generation failed. Checking credentials...', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!currentGenId) return;
    await toggleSaveProject(currentGenId);
    setIsSaved(!isSaved);
    showToast(!isSaved ? 'Project saved successfully!' : 'Project removed from saved folder.', 'info');
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Description header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-wide">High-Converting Ad Copy Builder</h2>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          Enter your product attributes and let AdViral compile custom headlines, scroll-stopping primary texts, and strategic viral hooks tailored specifically to your marketing channel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Campaign Configurator Form (5 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl space-y-4">
          
          <div className="flex items-center gap-2 pb-3 border-b border-purple-500/10">
            <div className="p-1.5 bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gray-200 tracking-wide">Configure Campaign</h3>
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Product/Brand Name</label>
            <input
              type="text"
              required
              placeholder="e.g. HyperFocus Planner"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
            />
          </div>

          {/* Product Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Product Features / Benefits</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Daily daily undated planner backed by ADHD productivity science, using dopamine-stacking tracking bars."
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Target Customer Profile</label>
            <input
              type="text"
              required
              placeholder="e.g. ADHD Entrepreneurs, creators & students"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
            />
          </div>

          {/* Platform and Tone Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Platform Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Destination Channel</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-[#120a1f] border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-purple-300 focus:outline-none transition-all"
              >
                {['Facebook', 'TikTok', 'Instagram', 'YouTube', 'LinkedIn'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Tone Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Brand Tone</label>
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
          </div>

          {/* CTA Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Primary Call-to-Action (CTA)</label>
            <select
              value={ctaStyle}
              onChange={(e) => setCtaStyle(e.target.value)}
              className="w-full bg-[#120a1f] border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-purple-300 focus:outline-none transition-all"
            >
              {['Shop Now', 'Learn More', 'Sign Up', 'Get Offer', 'Subscribe', 'Claim Discount'].map(c => (
                <option key={c} value={c}>{c}</option>
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
                Compile Copy (Costs 1 Credit)
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Right Side: Creative Outputs Sandbox Display (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-start">
          
          {loading && <Loader />}

          {!loading && !result && (
            /* Empty State Prompt */
            <div className="w-full py-24 glass-panel rounded-2xl border-purple-500/15 border-dashed flex flex-col items-center justify-center text-center p-6 min-h-[460px]">
              <Sparkles className="w-12 h-12 text-purple-500/20 mb-4 animate-pulse-glow" />
              <h3 className="text-base font-extrabold text-gray-300">Creative Sandbox Ready</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed font-medium">
                Adjust the settings in the editor panel and generate conversion-ready copy. Your outputs will display instantly in this preview workspace!
              </p>
            </div>
          )}

          {!loading && result && (
            /* Structured Generation Output Display */
            <div className="glass-panel rounded-2xl border-purple-500/20 p-6 shadow-xl space-y-6 animate-pulse-glow">
              
              {/* Output Actions ToolBar */}
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-purple-500/15 border border-purple-500/25 text-purple-400 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {platform} Copy
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">• Tone: {tone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveProject}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${isSaved ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'}`}
                  >
                    <FolderHeart className="w-3.5 h-3.5" />
                    {isSaved ? 'Saved to Folder' : 'Save Project'}
                  </button>
                  <button
                    onClick={() => handleGenerate()}
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Regenerate (Costs another credit)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SECTION 1: Headline Options */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  Scroll-Stopping Headlines
                </h4>
                <div className="space-y-2">
                  {result.headlines?.map((hl, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-black/40 border border-purple-500/10 rounded-xl group hover:border-purple-500/20 transition-all text-left text-xs font-extrabold text-gray-200">
                      <span className="flex-1 pr-4">{hl}</span>
                      <button
                        onClick={() => handleCopyText(hl, 'headline', idx)}
                        className="p-1.5 bg-white/5 hover:bg-purple-600/30 text-gray-400 hover:text-purple-300 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {copiedIndex?.section === 'headline' && copiedIndex?.index === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Primary Copy */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    Primary Body Ad Copy
                  </h4>
                  <button
                    onClick={() => handleCopyText(result.copy, 'body', 0)}
                    className="flex items-center gap-1 text-[10px] text-purple-300 hover:text-purple-200 font-extrabold cursor-pointer"
                  >
                    {copiedIndex?.section === 'body' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy Whole Body
                  </button>
                </div>
                <div className="p-4 bg-black/40 border border-purple-500/10 rounded-xl text-xs leading-relaxed text-gray-300 font-medium break-words whitespace-pre-wrap">
                  {result.copy}
                </div>
              </div>

              {/* SECTION 3: Hooks / CTA variations grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Scroll Hooks */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-400">Scroll-Stopping Hooks</h4>
                  <div className="space-y-2">
                    {result.hooks?.map((h, idx) => (
                      <div key={idx} className="flex items-start justify-between p-3 bg-black/40 border border-purple-500/10 rounded-xl text-left text-[11px] text-gray-400 font-semibold leading-relaxed">
                        <span className="flex-1 pr-4">"{h}"</span>
                        <button
                          onClick={() => handleCopyText(h, 'hooks', idx)}
                          className="p-1 bg-white/5 hover:bg-purple-600/30 text-gray-400 hover:text-purple-300 rounded transition-colors cursor-pointer shrink-0 mt-0.5"
                        >
                          {copiedIndex?.section === 'hooks' && copiedIndex?.index === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call To Actions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-400">CTA Variations</h4>
                  <div className="space-y-2">
                    {result.ctas?.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-black/40 border border-purple-500/10 rounded-xl text-left text-xs text-gray-300 font-extrabold">
                        <span className="flex-1 pr-4 truncate">{c}</span>
                        <button
                          onClick={() => handleCopyText(c, 'ctas', idx)}
                          className="p-1 bg-white/5 hover:bg-purple-600/30 text-gray-400 hover:text-purple-300 rounded transition-colors cursor-pointer shrink-0"
                        >
                          {copiedIndex?.section === 'ctas' && copiedIndex?.index === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 4: Marketing Angles */}
              <div className="space-y-2 pt-2 border-t border-purple-500/10">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-purple-400" />
                  Viral Marketing Angles
                </h4>
                <div className="space-y-2">
                  {result.viral_angles?.map((va, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-purple-950/10 border border-purple-500/5 hover:border-purple-500/20 rounded-xl text-left text-[11px] text-purple-200 font-bold">
                      <span className="flex-1 pr-4">{va}</span>
                      <button
                        onClick={() => handleCopyText(va, 'angles', idx)}
                        className="p-1 bg-white/5 hover:bg-purple-600/30 text-gray-400 hover:text-purple-300 rounded transition-colors cursor-pointer shrink-0"
                      >
                        {copiedIndex?.section === 'angles' && copiedIndex?.index === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
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
export default AdGenerator;
