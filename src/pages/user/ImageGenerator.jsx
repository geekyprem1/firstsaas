import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  FolderHeart, 
  Image as ImageIcon,
  Maximize2,
  Sliders,
  HelpCircle,
  Zap,
  Grid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { generateAIImage } from '../../services/aiService';
import Toast from '../../components/Toast';
import { safeStorage } from '../../services/safeStorage';

const STYLES = [
  { id: 'Realistic', name: 'Realistic', desc: 'Photorealistic details', color: 'from-amber-500 to-orange-600' },
  { id: 'Cinematic', name: 'Cinematic', desc: 'Dramatic lighting', color: 'from-blue-500 to-indigo-600' },
  { id: 'Anime', name: 'Anime', desc: 'Vibrant hand-drawn', color: 'from-pink-500 to-rose-600' },
  { id: '3D Render', name: '3D Render', desc: 'Octane studio style', color: 'from-cyan-500 to-blue-600' },
  { id: 'Cartoon', name: 'Cartoon', desc: 'Playful illustrated', color: 'from-yellow-400 to-amber-500' },
  { id: 'Fantasy', name: 'Fantasy', desc: 'Mystical & ethereal', color: 'from-purple-500 to-indigo-600' },
  { id: 'Product Ad', name: 'Product Ad', desc: 'Clean e-commerce studio', color: 'from-emerald-500 to-teal-600' },
  { id: 'UGC Style', name: 'UGC Style', desc: 'Casual selfie look', color: 'from-violet-500 to-purple-600' }
];

const RATIOS = [
  { id: '1:1', name: '1:1 Square', desc: 'Instagram Feed', width: 'w-10', height: 'h-10' },
  { id: '16:9', name: '16:9 Wide', desc: 'YouTube, Web banners', width: 'w-14', height: 'h-8' },
  { id: '9:16', name: '9:16 Portrait', desc: 'TikTok, Reels, Shorts', width: 'w-8', height: 'h-14' },
  { id: '4:5', name: '4:5 Social', desc: 'Premium IG / FB', width: 'w-9', height: 'h-11' }
];

export const ImageGenerator = () => {
  const { user } = useAuth();
  const { deductCredits, addGeneration, toggleSaveProject, apiSettings } = useDatabase();

  // Load dynamic tool credit cost from config or default to 5
  const creditCost = parseInt(safeStorage.getItem('adviral_config_cost_image_generator')) ?? 5;

  // Form Inputs
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState('HD');

  // UI States
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [result, setResult] = useState(null);
  const [currentGenId, setCurrentGenId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    showToast('Prompt copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async (url, index) => {
    try {
      showToast('Preparing download...', 'info');
      
      // If it's a data url or unsplash image, download it
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `adviral-image-${selectedStyle.toLowerCase().replace(' ', '-')}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      showToast('Image downloaded successfully!', 'success');
    } catch (err) {
      // Fallback: Open in new tab
      window.open(url, '_blank');
      showToast('Opened image in a new tab for manual saving.', 'info');
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    if (!prompt.trim()) {
      showToast('Please type a descriptive image prompt first.', 'warning');
      return;
    }

    // 1. Credit Check
    if (user.plan !== 'Enterprise' && user.credits < creditCost) {
      showToast(`Insufficient credits! This tool requires ${creditCost} credits. Please top up.`, 'error');
      return;
    }

    setLoading(true);
    setResult(null);
    setIsSaved(false);

    // Dynamic loading text sequences
    const phases = [
      'Authenticating API credentials...',
      'Analyzing artistic visual style...',
      'Synthesizing photorealistic pixels...',
      'Refining exposure & specular shading...',
      'Injecting dynamic color range values...',
      'Assembling final HD layout canvas...'
    ];
    
    let phaseIdx = 0;
    setLoadingPhase(phases[0]);
    const phaseInterval = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % phases.length;
      setLoadingPhase(phases[phaseIdx]);
    }, 1500);

    try {
      // Filter only enabled providers that have configured keys (not masked or empty)
      const validApis = apiSettings.filter(a => a.status && a.api_key && !a.api_key.includes('••••'));
      let activeApi = validApis.find(a => a.is_default);
      if (!activeApi) {
        activeApi = validApis[0];
      }

      const provider = activeApi ? activeApi.provider_name : 'openai';
      const apiKey = activeApi ? activeApi.api_key : '';

      // 2. Deduct dynamic credits
      const deductionSuccess = await deductCredits(user.id, creditCost);
      if (!deductionSuccess) {
        showToast('Credit deduction failed. Please reload page.', 'error');
        clearInterval(phaseInterval);
        setLoading(false);
        return;
      }

      // 3. Make Service API Call
      const generated = await generateAIImage(
        prompt, 
        selectedStyle, 
        aspectRatio, 
        quality, 
        provider, 
        apiKey
      );

      // 4. Save into Database history
      const inputPayload = {
        prompt,
        style: selectedStyle,
        aspect_ratio: aspectRatio,
        quality
      };

      const savedGen = await addGeneration('image_generator', inputPayload, generated, user.id, creditCost);

      setResult(generated);
      setCurrentGenId(savedGen ? savedGen.id : null);
      showToast(`Image generated successfully! -${creditCost} credits.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Generation request failed. Checking failover stubs...', 'error');
    } finally {
      clearInterval(phaseInterval);
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!currentGenId) return;
    await toggleSaveProject(currentGenId);
    setIsSaved(!isSaved);
    showToast(!isSaved ? 'Creative saved to projects!' : 'Removed from projects.', 'info');
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Title block */}
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-extrabold text-white tracking-wide">AI Image & Ad Creative Generator</h2>
          <span className="text-[10px] bg-purple-500/10 border border-purple-500/30 text-purple-400 font-black px-2 py-0.5 rounded-full select-none uppercase tracking-wider">Premium Feature</span>
        </div>
        <p className="text-xs text-gray-400 mt-1 max-w-xl font-semibold">
          Synthesize high-converting display advertisements, hyper-realistic product display assets, and dramatic social banners instantly utilizing OpenAI DALL-E 3 & Gemini Imagen 3 models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Config Form (5 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded-lg">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-200 tracking-wide">Render Parameters</h3>
            </div>
            
            <div className="flex items-center gap-1 bg-purple-950/30 border border-purple-500/20 text-purple-300 font-extrabold text-[10px] py-1 px-2.5 rounded-xl select-none">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Cost: {creditCost} Credits
            </div>
          </div>

          {/* Text prompt */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-300">Detailed Visual Prompt</label>
              {prompt.trim() && (
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Prompt
                </button>
              )}
            </div>
            <textarea
              required
              rows={4}
              placeholder="e.g. A gorgeous luxury avocado skincare oil bottle, glowing from within, resting on basalt stone structure with natural sun flare background, wet water droplets, elegant HSL lighting..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Dynamic Style Visual selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block select-none">Artistic Style Theme</label>
            <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
              {STYLES.map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStyle(st.id)}
                  className={`
                    p-2 text-left rounded-xl border text-xs font-bold transition-all relative overflow-hidden group cursor-pointer
                    ${selectedStyle === st.id 
                      ? 'border-purple-500 bg-purple-950/20 text-purple-200' 
                      : 'border-purple-500/5 bg-black/30 text-gray-400 hover:text-gray-300 hover:bg-white/[0.02]'
                    }
                  `}
                >
                  <div className="relative z-10">
                    <div>{st.name}</div>
                    <div className="text-[9px] text-gray-500 font-semibold group-hover:text-gray-400 transition-colors mt-0.5 leading-tight">{st.desc}</div>
                  </div>
                  {selectedStyle === st.id && (
                    <div className={`absolute bottom-0 right-0 w-1.5 h-full bg-gradient-to-t ${st.color}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block select-none">Aspect Ratio Dimensions</label>
            <div className="grid grid-cols-2 gap-2">
              {RATIOS.map(rat => (
                <button
                  key={rat.id}
                  type="button"
                  onClick={() => setAspectRatio(rat.id)}
                  className={`
                    p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 cursor-pointer
                    ${aspectRatio === rat.id 
                      ? 'border-purple-500 bg-purple-950/20 text-purple-200' 
                      : 'border-purple-500/5 bg-black/30 text-gray-400 hover:text-gray-300 hover:bg-white/[0.02]'
                    }
                  `}
                >
                  {/* Dynamic mini ratio visualizer box */}
                  <div className="w-16 h-10 border border-purple-500/20 rounded bg-[#090514] flex items-center justify-center select-none shrink-0">
                    <div className={`${rat.width} ${rat.height} border border-purple-400/50 bg-purple-500/10 rounded-sm`} />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-[11px] truncate">{rat.name}</div>
                    <div className="text-[9px] text-gray-500 font-semibold truncate mt-0.5">{rat.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Selector */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block select-none">Quality Level</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full bg-[#120a1f] border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-purple-300 focus:outline-none transition-all cursor-pointer font-bold"
              >
                <option value="Standard">Standard (Low GPU cost)</option>
                <option value="HD">HD Premium (Super-Sampling)</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block select-none">Provider Fallback</label>
              <div className="w-full bg-[#0a0512] border border-purple-500/5 rounded-xl py-2 px-3.5 text-xs text-gray-500 font-bold select-none truncate">
                Multi-Model Automatic
              </div>
            </div>
          </div>

          {/* Action Generate */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 btn-primary rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                Compile Pixel Masterpiece
              </>
            )}
          </button>
        </form>

        {/* Right column: Creative Showcase Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Showcase wrapper */}
          <div className="glass-panel border-purple-500/15 rounded-3xl p-6 min-h-[460px] flex flex-col justify-between shadow-xl relative overflow-hidden">
            {/* Ambient Purple glow in showcase */}
            <div className="absolute -top-1/4 -right-1/4 w-[300px] h-[300px] bg-purple-950/20 rounded-full blur-3xl pointer-events-none" />

            {/* CASE 1: LOADING STATE */}
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-5 animate-pulse-glow py-10 relative z-10 select-none">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl border-4 border-purple-500/10 border-t-purple-400 border-b-purple-400 animate-spin" />
                  <div className="w-16 h-16 rounded-full border border-violet-500/20 animate-ping absolute top-4 left-4" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-purple-950/50 rounded-xl border border-purple-500/30">
                    <ImageIcon className="w-6 h-6 text-purple-400 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-purple-200">Creative Engine Active</h4>
                  <p className="text-[11px] text-gray-500 font-mono tracking-wider h-6 transition-all duration-300">{loadingPhase}</p>
                </div>

                {/* Shimmer loading boxes to represent dynamic aspect ratios */}
                <div className="w-56 h-3.5 bg-purple-950/30 border border-purple-500/5 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-full animate-skeleton" />
                </div>
              </div>
            )}

            {/* CASE 2: EMPTY STATE */}
            {!loading && !result && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-20 relative z-10 select-none">
                <div className="p-4 bg-purple-950/30 border border-purple-500/15 text-purple-400 rounded-3xl relative">
                  <div className="absolute inset-0 bg-purple-500/10 rounded-3xl blur-xl animate-pulse" />
                  <ImageIcon className="w-10 h-10 relative z-10" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-black">Pixel Showcase Empty</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                    Set your aspect ratios, input detailed context parameters on the configurator, and launch compile.
                  </p>
                </div>
              </div>
            )}

            {/* CASE 3: RENDERED RESULT */}
            {!loading && result && (
              <div className="flex-1 flex flex-col gap-6 relative z-10">
                {/* Result header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-purple-500/5 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black px-2.5 py-0.5 rounded-full uppercase shrink-0">
                      Pixel Sync Complete
                    </span>
                    <span className="text-[10px] bg-purple-500/10 border border-purple-500/15 text-gray-400 px-2 py-0.5 rounded-full font-bold">
                      Format: {aspectRatio}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleSaveProject}
                      className={`
                        flex items-center gap-1.5 py-1 px-3 border rounded-xl text-[10px] font-bold cursor-pointer transition-all
                        ${isSaved 
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md' 
                          : 'bg-white/5 border-purple-500/10 hover:border-purple-500/30 text-gray-300 hover:text-white'
                        }
                      `}
                    >
                      <FolderHeart className="w-3.5 h-3.5 shrink-0" />
                      {isSaved ? 'Saved to Projects' : 'Save Creative'}
                    </button>
                    
                    <button
                      onClick={handleGenerate}
                      className="flex items-center gap-1.5 py-1 px-3 bg-white/5 border border-purple-500/10 hover:border-purple-500/30 text-gray-300 hover:text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      Regenerate
                    </button>
                  </div>
                </div>

                {/* Display grid (responsive) */}
                <div className="flex-1 flex items-center justify-center p-2 rounded-2xl bg-black/40 border border-purple-500/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {result.images?.map((imgUrl, idx) => (
                      <div key={idx} className="relative group overflow-hidden rounded-xl border border-purple-500/10 shadow-lg aspect-square bg-[#0b0513] select-none">
                        <img 
                          src={imgUrl} 
                          alt={`Generated creative ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        
                        {/* Hover Overlay triggers */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                          <span className="text-[9px] uppercase font-black tracking-widest text-purple-400 bg-black/40 border border-purple-500/20 py-0.5 px-2 rounded-full self-start">
                            Render {idx + 1}
                          </span>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.open(imgUrl, '_blank')}
                              className="flex-1 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-purple-300 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all"
                            >
                              <Maximize2 className="w-3 h-3" />
                              Expand
                            </button>
                            <button
                              onClick={() => downloadImage(imgUrl, idx)}
                              className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info label */}
                <p className="text-[10px] text-gray-500 leading-normal text-left font-semibold">
                  ⚠️ Note: Unsplash photography proxies are returned instantly when local sandbox compiler runs. Actual base64 buffer packets are drawn if dynamic OpenAI/Gemini secret strings are loaded.
                </p>
              </div>
            )}
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

export default ImageGenerator;
