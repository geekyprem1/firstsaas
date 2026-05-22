import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  FolderHeart, 
  Eye, 
  FileText,
  HelpCircle,
  Zap,
  Trash2,
  Brain
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { analyzeAIVision } from '../../services/aiService';
import Toast from '../../components/Toast';
import { safeStorage } from '../../services/safeStorage';

const PRESETS = [
  { id: 'describe', label: '📸 Visual & Aesthetic Analysis', question: 'Describe the visual composition, subject matter, lighting, color psychology, and aesthetic vibe of this creative.' },
  { id: 'viral', label: '🔥 Attention Hooks & Viral Catalysts', question: 'Evaluate what makes this image visually striking. Suggest emotional hooks and scroll-stoppers suitable for Instagram/TikTok.' },
  { id: 'marketing', label: '📈 Copy Formulas & Ad Angles', question: 'Formulate three high-converting marketing frameworks (AIDA, ADHD Curiosity, and Social Proof) based on this creative.' },
  { id: 'optimize', label: '🧬 Optimization Recommendations', question: 'Analyze the demographics this creative appeals to and suggest 3 concrete visual changes to boost conversions by 20%.' }
];

export const Vision = () => {
  const { user } = useAuth();
  const { deductCredits, addGeneration, toggleSaveProject, apiSettings } = useDatabase();

  // Dynamic cost configuration from config or default to 2
  const creditCost = parseInt(safeStorage.getItem('adviral_config_cost_ai_vision')) ?? 2;

  // Form Inputs
  const [selectedFile, setSelectedFile] = useState(null); // File object
  const [imagePreview, setImagePreview] = useState(''); // Base64 data URL
  const [question, setQuestion] = useState(PRESETS[0].question);
  const [customQuestion, setCustomQuestion] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [result, setResult] = useState(null);
  const [currentGenId, setCurrentGenId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleCopyResult = () => {
    if (!result?.response) return;
    navigator.clipboard.writeText(result.response);
    setCopied(true);
    showToast('Analysis response copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert File to Base64
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Unsupported file type. Please upload a valid image (PNG/JPEG/WEBP).', 'warning');
      return;
    }
    
    // Max size 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit. Please upload a smaller file.', 'warning');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setResult(null); // Reset output when new image loaded
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSelectPreset = (qText) => {
    setQuestion(qText);
    setCustomQuestion('');
  };

  const triggerUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setResult(null);
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();

    if (!imagePreview) {
      showToast('Please upload or drag & drop an ad creative image first.', 'warning');
      return;
    }

    const activeQuestion = customQuestion.trim() ? customQuestion.trim() : question;
    if (!activeQuestion) {
      showToast('Please enter or select a strategic analysis question.', 'warning');
      return;
    }

    // 1. Credit Check
    if (user.plan !== 'Enterprise' && user.credits < creditCost) {
      showToast(`Insufficient credits! This analysis requires ${creditCost} credits. Please top up.`, 'error');
      return;
    }

    setLoading(true);
    setResult(null);
    setIsSaved(false);

    // Scanner loop sequences
    const phases = [
      'Extracting image visual metadata...',
      'Deconstructing color hex distributions...',
      'Parsing typographical copy layers...',
      'Running comparative neuro-hook models...',
      'Assembling strategic copywriting angles...'
    ];
    
    let phaseIdx = 0;
    setLoadingPhase(phases[0]);
    const phaseInterval = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % phases.length;
      setLoadingPhase(phases[phaseIdx]);
    }, 1500);

    try {
      // Extract base64 parameters from preview string (data:image/png;base64,xxxx)
      const mimeType = imagePreview.split(';')[0].split(':')[1];
      const base64Data = imagePreview.split(',')[1];

      // APIs selection logic
      const validApis = apiSettings.filter(a => a.status && a.api_key && !a.api_key.includes('••••'));
      let activeApi = validApis.find(a => a.is_default);
      if (!activeApi) {
        activeApi = validApis[0];
      }

      const provider = activeApi ? activeApi.provider_name : 'openai';
      const apiKey = activeApi ? activeApi.api_key : '';

      // 2. Deduct credits
      const deductionSuccess = await deductCredits(user.id, creditCost);
      if (!deductionSuccess) {
        showToast('Credit deduction failed. Please reload page.', 'error');
        clearInterval(phaseInterval);
        setLoading(false);
        return;
      }

      // 3. Trigger API Call
      const generated = await analyzeAIVision(
        mimeType, 
        base64Data, 
        activeQuestion, 
        provider, 
        apiKey
      );

      // 4. Save into Database history
      const inputPayload = {
        image_url: imagePreview.length > 500 ? 'data_base64_packet' : imagePreview, // Use short placeholder in sandbox lists
        question: activeQuestion
      };
      
      // Overwrite input_data to have custom preview data
      const dbPayload = {
        image_url: imagePreview, // Full base64 is saved for rendering in history modals!
        question: activeQuestion
      };

      const savedGen = await addGeneration('vision', dbPayload, generated, user.id, creditCost);

      setResult(generated);
      setCurrentGenId(savedGen ? savedGen.id : null);
      showToast(`Creative analysis complete! -${creditCost} credits.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Analysis request failed. Please check credentials settings.', 'error');
    } finally {
      clearInterval(phaseInterval);
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!currentGenId) return;
    await toggleSaveProject(currentGenId);
    setIsSaved(!isSaved);
    showToast(!isSaved ? 'Analysis saved to projects!' : 'Removed from projects.', 'info');
  };

  // Convert markdown bold/headers in mockup fallbacks for premium rendering
  const parseMarkdownCustom = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => {
      let parsed = line;
      let lineClass = "text-xs font-semibold text-gray-300 mb-1 leading-relaxed";

      if (parsed.startsWith('### ')) {
        parsed = parsed.replace('### ', '');
        lineClass = "text-sm font-black text-purple-300 mt-4 mb-2 select-none uppercase tracking-wide border-l-2 border-purple-500 pl-2";
      } else if (parsed.startsWith('#### ')) {
        parsed = parsed.replace('#### ', '');
        lineClass = "text-xs font-black text-indigo-400 mt-2 mb-1.5 uppercase select-none";
      } else if (parsed.startsWith('- ') || parsed.startsWith('* ')) {
        parsed = parsed.substring(2);
        lineClass = "text-xs text-gray-400 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-purple-400 mb-1 leading-relaxed";
      }

      // Inline Bold formatting (**bold**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIdx = 0;
      let match;
      while ((match = boldRegex.exec(parsed)) !== null) {
        if (match.index > lastIdx) {
          parts.push(parsed.substring(lastIdx, match.index));
        }
        parts.push(<strong key={match.index} className="text-purple-200 font-extrabold">{match[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < parsed.length) {
        parts.push(parsed.substring(lastIdx));
      }

      return (
        <div key={idx} className={lineClass}>
          {parts.length > 0 ? parts : parsed}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Description Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-extrabold text-white tracking-wide">AI Vision & Creative Auditor</h2>
          <span className="text-[10px] bg-purple-500/10 border border-purple-500/30 text-purple-400 font-black px-2 py-0.5 rounded-full select-none uppercase tracking-wider">Multimodal</span>
        </div>
        <p className="text-xs text-gray-400 mt-1 max-w-xl font-semibold">
          Upload any banner advertisement, competitor landing screen, or photo model, and let our GPT-4o-mini & Gemini 2.5 multimodal algorithms perform visual triggers auditing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Upload Zone & Question select (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Uploader Card */}
          <div className="glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded-lg">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-200 tracking-wide">Creative Assets</h3>
              </div>
              
              <div className="flex items-center gap-1 bg-purple-950/30 border border-purple-500/20 text-purple-300 font-extrabold text-[10px] py-1 px-2.5 rounded-xl select-none">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Cost: {creditCost} Credits
              </div>
            </div>

            {/* Drag Drop Area */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!imagePreview ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerUploadClick}
                className={`
                  border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 select-none
                  ${dragActive 
                    ? 'border-purple-400 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                    : 'border-purple-500/15 bg-black/30 hover:border-purple-500/40 hover:bg-white/[0.01]'
                  }
                `}
              >
                <div className="p-3 bg-purple-950/30 border border-purple-500/10 text-purple-400 rounded-2xl w-fit mx-auto mb-3.5">
                  <Upload className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-xs font-bold text-gray-300">Drag & Drop Image</h4>
                <p className="text-[10px] text-gray-500 mt-1 font-semibold leading-normal">
                  Supports JPEG, PNG, or WEBP formats up to 5MB.
                </p>
                <button
                  type="button"
                  className="mt-3.5 py-1 px-3 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-300 rounded-lg text-[10px] font-bold transition-all"
                >
                  Select File
                </button>
              </div>
            ) : (
              <div className="relative group overflow-hidden rounded-xl border border-purple-500/10 shadow-lg bg-[#0b0513] max-h-[220px]">
                <img 
                  src={imagePreview} 
                  alt="Creative preview" 
                  className="w-full h-full object-contain max-h-[220px]"
                />
                
                {/* Clear Overlay button */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Strategic Prompts selector */}
          <div className="glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-purple-500/10 select-none">
              <div className="p-1.5 bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded-lg">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-200 tracking-wide">Analysis Blueprint</h3>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2 select-none">
              <label className="text-[10px] text-purple-400 font-black uppercase tracking-wider block">Auditing Angle presets</label>
              <div className="flex flex-col gap-2">
                {PRESETS.map(pr => {
                  const isActive = question === pr.question && !customQuestion.trim();
                  return (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => handleSelectPreset(pr.question)}
                      className={`
                        p-2.5 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer leading-tight
                        ${isActive 
                          ? 'border-purple-500 bg-purple-950/20 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.05)]' 
                          : 'border-purple-500/5 bg-black/30 text-gray-400 hover:text-gray-300 hover:bg-white/[0.01]'
                        }
                      `}
                    >
                      {pr.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5 pt-2 border-t border-purple-500/5">
              <label className="text-[10px] text-purple-400 font-black uppercase tracking-wider block">Custom auditing query</label>
              <textarea
                rows={2}
                placeholder="Or type a custom marketing question e.g. Analyze text overlays contrast and advise readability ratios..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-600 focus:outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !imagePreview}
              className="w-full py-3.5 px-4 btn-primary rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  Initiate Creative Audit
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Side: Analysis Output Showcases (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel border-purple-500/15 rounded-3xl p-6 min-h-[580px] flex flex-col justify-between shadow-xl relative overflow-hidden">
            {/* Glow absolute design decoration */}
            <div className="absolute -top-1/4 -right-1/4 w-[300px] h-[300px] bg-purple-950/20 rounded-full blur-3xl pointer-events-none" />

            {/* CASE 1: LOADING STATE */}
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-5 py-20 relative z-10 select-none">
                {/* Custom scanning animation box */}
                <div className="relative w-44 h-44 rounded-2xl border border-purple-500/20 overflow-hidden bg-black/40 shadow-inner flex items-center justify-center">
                  <img src={imagePreview} className="w-full h-full object-contain opacity-50" alt="Scanning input" />
                  
                  {/* Neon Optical Scanning line overlay */}
                  <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_10px_#a855f7] animate-scan" />
                </div>
                <div className="text-center space-y-1.5">
                  <h4 className="text-sm font-bold text-purple-200">Multimodal Audit active</h4>
                  <p className="text-[11px] text-gray-500 font-mono tracking-wider h-6 transition-all duration-300">{loadingPhase}</p>
                </div>

                <div className="w-56 h-3.5 bg-purple-950/30 border border-purple-500/5 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-full animate-skeleton" />
                </div>
              </div>
            )}

            {/* CASE 2: EMPTY STATE */}
            {!loading && !result && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-32 relative z-10 select-none">
                <div className="p-4 bg-purple-950/30 border border-purple-500/15 text-purple-400 rounded-3xl relative">
                  <div className="absolute inset-0 bg-purple-500/10 rounded-3xl blur-xl animate-pulse" />
                  <Eye className="w-10 h-10 relative z-10" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-black">Audit Report Empty</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                    Upload an ad banner, choose your target blueprint, and initiate creative auditing.
                  </p>
                </div>
              </div>
            )}

            {/* CASE 3: AUDITED RESULT */}
            {!loading && result && (
              <div className="flex-1 flex flex-col gap-5 relative z-10">
                {/* Result header */}
                <div className="flex items-center justify-between pb-3 border-b border-purple-500/5 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black px-2.5 py-0.5 rounded-full uppercase shrink-0">
                      Audit Ledger compiled
                    </span>
                    <span className="text-[10px] bg-purple-500/10 border border-purple-500/15 text-gray-400 px-2 py-0.5 rounded-full font-bold">
                      Cost: {creditCost} Credits
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
                      {isSaved ? 'Saved to Projects' : 'Save Report'}
                    </button>
                    
                    <button
                      onClick={handleAnalyze}
                      className="flex items-center gap-1.5 py-1 px-3 bg-white/5 border border-purple-500/10 hover:border-purple-500/30 text-gray-300 hover:text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      Regenerate
                    </button>
                  </div>
                </div>

                {/* Audit query recap block */}
                <div className="bg-purple-950/10 border border-purple-500/10 rounded-2xl p-3.5 select-none">
                  <span className="text-[9px] uppercase tracking-wider text-purple-400 font-bold block select-none">Target Auditing Question</span>
                  <p className="text-xs font-bold text-gray-200 mt-1 italic leading-relaxed">"{customQuestion.trim() ? customQuestion : question}"</p>
                </div>

                {/* Results Card text container */}
                <div className="flex-1 p-4 bg-black/40 border border-purple-500/5 rounded-2xl max-h-[380px] overflow-y-auto scrollbar-thin text-left">
                  {parseMarkdownCustom(result.response)}
                </div>

                {/* Bottom toolbar */}
                <div className="flex items-center justify-between pt-3.5 border-t border-purple-500/5">
                  <button
                    onClick={handleCopyResult}
                    className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    Copy Audit Report
                  </button>
                  
                  <span className="text-[10px] text-gray-500 font-bold font-mono">
                    Provider: {result._provider || 'local'}
                  </span>
                </div>
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

export default Vision;
