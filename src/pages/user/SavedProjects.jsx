import React, { useState, useEffect } from 'react';
import { 
  FolderHeart, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Copy, 
  Check, 
  Folder, 
  Calendar,
  Sparkles,
  Bookmark,
  BookmarkMinus,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

export const SavedProjects = ({ selectedProject, onClearSelectedProject }) => {
  const { user } = useAuth();
  const { generations, toggleSaveProject, deleteProject } = useDatabase();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'ad_generator', 'viral_hooks', 'ugc_scripts'
  const [showSavedOnly, setShowSavedOnly] = useState(true);

  // Detail Modal state
  const [activeModalGen, setActiveModalGen] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null); // tracking individual copy
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Sync selected project from dashboard clicks
  useEffect(() => {
    if (selectedProject) {
      setActiveModalGen(selectedProject);
      // Clear selection so returning later doesn't auto-popup
      onClearSelectedProject();
    }
  }, [selectedProject, onClearSelectedProject]);

  const handleCopyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation(); // Avoid triggering open modal
    if (confirm('Are you sure you want to permanently delete this generation?')) {
      await deleteProject(id);
      showToast('Generation deleted successfully.', 'info');
      if (activeModalGen?.id === id) setActiveModalGen(null);
    }
  };

  const handleToggleSave = async (id, e) => {
    e.stopPropagation();
    await toggleSaveProject(id);
  };

  // Process and filter lists
  const userGens = generations.filter(g => g.user_id === user?.id) || [];
  
  const filteredGens = userGens
    .filter(g => {
      // 1. Saved status filter
      if (showSavedOnly && !g.is_saved) return false;
      // 2. Tool type filter
      if (filterType !== 'all' && g.tool_type !== filterType) return false;
      // 3. Search query
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const prodName = g.input_data.product_name?.toLowerCase() || '';
        const prodDesc = g.input_data.product_description?.toLowerCase() || '';
        return prodName.includes(query) || prodDesc.includes(query);
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getToolBadge = (type) => {
    switch (type) {
      case 'ad_generator':
        return <span className="text-[10px] bg-purple-500/10 border border-purple-500/25 text-purple-400 font-bold px-2 py-0.5 rounded-full select-none uppercase shrink-0">Ad Builder</span>;
      case 'viral_hooks':
        return <span className="text-[10px] bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold px-2 py-0.5 rounded-full select-none uppercase shrink-0">Hooks</span>;
      case 'ugc_scripts':
        return <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold px-2 py-0.5 rounded-full select-none uppercase shrink-0">UGC Script</span>;
      default:
        return <span className="text-[10px] bg-gray-500/10 border border-gray-500/25 text-gray-400 font-bold px-2 py-0.5 rounded-full select-none uppercase shrink-0">Tool</span>;
    }
  };

  const getFormattedDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-wide">Saved Campaigns & Project Folders</h2>
        <p className="text-xs text-gray-400 mt-1">
          Review, extract, and delete your historical ad copywriting drafts. Manage saved items and explore full generations logs.
        </p>
      </div>

      {/* Control panel (Filter toolbar) */}
      <div className="glass-panel rounded-2xl border-purple-500/15 p-4 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Toggle Saved vs All */}
        <div className="flex gap-1 p-0.5 bg-black/40 border border-purple-500/10 rounded-xl shrink-0">
          <button
            onClick={() => setShowSavedOnly(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${showSavedOnly ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Saved Folders
          </button>
          <button
            onClick={() => setShowSavedOnly(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${!showSavedOnly ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
          >
            All Generations
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-1.5 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-purple-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#120a1f] border border-purple-500/15 focus:border-purple-500/40 rounded-xl py-1.5 px-3 text-xs text-purple-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Copy Tools</option>
            <option value="ad_generator">AI Ad Builder</option>
            <option value="viral_hooks">Viral Hooks</option>
            <option value="ugc_scripts">UGC Scripts</option>
          </select>
        </div>
      </div>

      {/* Grid displays */}
      {filteredGens.length === 0 ? (
        /* Empty State */
        <div className="py-24 text-center glass-panel border-purple-500/15 border-dashed rounded-2xl flex flex-col items-center justify-center p-6">
          <Folder className="w-12 h-12 text-purple-500/20 mb-4 animate-pulse-glow" />
          <h3 className="text-base font-extrabold text-gray-300">No campaigns found</h3>
          <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed font-medium">
            {showSavedOnly 
              ? 'You do not have any bookmarked campaigns. Navigate to tools and click Save Project to archive them here!'
              : 'You have not run any copy generators yet. Choose a creator tool to begin!'}
          </p>
        </div>
      ) : (
        /* Project Cards List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGens.map((gen) => (
            <div 
              key={gen.id} 
              onClick={() => setActiveModalGen(gen)}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border-purple-500/15 shadow-md flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden text-left group"
            >
              {/* Card top details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-purple-100 group-hover:text-purple-300 transition-colors truncate">
                    {gen.input_data.product_name || 'Viral Campaign'}
                  </h3>
                  {getToolBadge(gen.tool_type)}
                </div>

                <p className="text-xs text-gray-400 font-medium line-clamp-2 h-8 break-words select-none leading-relaxed">
                  {gen.input_data.product_description || 'Product features.'}
                </p>
              </div>

              {/* Card footer metrics */}
              <div className="flex items-center justify-between border-t border-purple-500/10 pt-3 text-[10px] text-gray-500 select-none">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-500/50" />
                  <span>{getFormattedDate(gen.created_at)}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {/* Save toggle */}
                  <button
                    onClick={(e) => handleToggleSave(gen.id, e)}
                    className="p-1 hover:bg-purple-600/20 rounded-md text-gray-400 hover:text-purple-300 border border-transparent hover:border-purple-500/20 transition-all cursor-pointer"
                    title={gen.is_saved ? 'Unsave' : 'Save'}
                  >
                    {gen.is_saved ? <Bookmark className="w-3.5 h-3.5 text-purple-400" /> : <BookmarkMinus className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete project */}
                  <button
                    onClick={(e) => handleDeleteProject(gen.id, e)}
                    className="p-1 hover:bg-rose-950/30 rounded-md text-gray-400 hover:text-rose-400 border border-transparent hover:border-rose-900/30 transition-all cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campaign Detail Modal */}
      {activeModalGen && (
        <Modal
          isOpen={!!activeModalGen}
          onClose={() => setActiveModalGen(null)}
          title={`Draft details: ${activeModalGen.input_data.product_name}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex gap-2">
              <button
                onClick={(e) => handleToggleSave(activeModalGen.id, e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer ${activeModalGen.is_saved ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-300'}`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {activeModalGen.is_saved ? 'Saved in Folder' : 'Bookmark Draft'}
              </button>
              <button
                onClick={() => setActiveModalGen(null)}
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Metadata Summary banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-purple-950/20 border border-purple-500/10 rounded-xl text-xs font-semibold">
              <div>
                <span className="text-gray-500">Tool:</span>
                <br />
                <span className="text-purple-300 capitalize">{activeModalGen.tool_type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-500">Platform:</span>
                <br />
                <span className="text-purple-300">{activeModalGen.input_data.platform || 'General'}</span>
              </div>
              <div>
                <span className="text-gray-500">Tone:</span>
                <br />
                <span className="text-purple-300">{activeModalGen.input_data.tone || 'Bold'}</span>
              </div>
              <div>
                <span className="text-gray-500">CTA:</span>
                <br />
                <span className="text-purple-300">{activeModalGen.input_data.cta_style || 'General'}</span>
              </div>
            </div>

            {/* Inputs description */}
            <div className="text-xs text-left p-3.5 bg-black/40 border border-purple-500/5 rounded-xl space-y-1">
              <div className="text-gray-500 uppercase tracking-widest text-[9px] font-black">Campaign Seed Information</div>
              <p className="text-gray-300 leading-relaxed break-words">{activeModalGen.input_data.product_description}</p>
            </div>

            <div className="border-t border-purple-500/10 pt-4 space-y-4">
              {/* Render dynamic structured content based on tool type */}
              
              {/* Case 1: Ad Generator Outputs */}
              {activeModalGen.tool_type === 'ad_generator' && (
                <div className="space-y-4 text-left">
                  {/* Primary Copy */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center select-none">
                      <span className="text-xs font-black uppercase text-purple-400 tracking-wider">Primary Body Text</span>
                      <button
                        onClick={() => handleCopyText(activeModalGen.generated_result.copy, 'body_copy')}
                        className="flex items-center gap-1 text-[10px] text-purple-300 hover:text-purple-200 font-extrabold cursor-pointer"
                      >
                        {copiedKey === 'body_copy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy Body
                      </button>
                    </div>
                    <div className="p-3 bg-black/40 border border-purple-500/10 rounded-xl text-xs text-gray-300 break-words whitespace-pre-wrap leading-relaxed">
                      {activeModalGen.generated_result.copy}
                    </div>
                  </div>

                  {/* Headlines & Hooks list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs font-black uppercase text-purple-400 tracking-wider">Headlines</span>
                      <div className="space-y-2">
                        {activeModalGen.generated_result.headlines?.map((h, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-black/40 border border-purple-500/10 rounded-lg text-xs font-bold text-gray-200">
                            <span className="truncate flex-1 pr-3">{h}</span>
                            <button onClick={() => handleCopyText(h, `hl_${i}`)} className="p-1 hover:bg-white/5 text-gray-500 hover:text-white rounded">
                              {copiedKey === `hl_${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-xs font-black uppercase text-purple-400 tracking-wider">Hook Variations</span>
                      <div className="space-y-2">
                        {activeModalGen.generated_result.hooks?.map((h, i) => (
                          <div key={i} className="flex items-start justify-between p-2.5 bg-black/40 border border-purple-500/10 rounded-lg text-[11px] text-gray-400 font-semibold leading-relaxed">
                            <span className="flex-1 pr-3">"{h}"</span>
                            <button onClick={() => handleCopyText(h, `hk_${i}`)} className="p-1 hover:bg-white/5 text-gray-500 hover:text-white rounded shrink-0">
                              {copiedKey === `hk_${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Case 2: Viral Hooks */}
              {activeModalGen.tool_type === 'viral_hooks' && (
                <div className="space-y-4 text-left">
                  {[
                    { key: 'curiosity_hooks', label: 'Curiosity Loop Hooks', color: 'text-purple-400' },
                    { key: 'emotional_hooks', label: 'Emotional Triggers', color: 'text-rose-400' },
                    { key: 'fear_hooks', label: 'FOMO Triggers', color: 'text-amber-500' },
                    { key: 'viral_hooks', label: 'TikTok Hooks', color: 'text-emerald-400' },
                    { key: 'short_form_hooks', label: 'Overlay Text', color: 'text-indigo-400' }
                  ].map(sec => (
                    <div key={sec.key} className="space-y-1.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${sec.color}`}>{sec.label}</span>
                      <div className="space-y-1.5">
                        {activeModalGen.generated_result[sec.key]?.map((h, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-black/40 border border-purple-500/10 rounded-lg text-xs font-semibold text-gray-300">
                            <span className="flex-1 pr-3 truncate font-mono">"{h}"</span>
                            <button onClick={() => handleCopyText(h, `${sec.key}_${i}`)} className="p-1 hover:bg-white/5 text-gray-500 hover:text-white rounded shrink-0">
                              {copiedKey === `${sec.key}_${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Case 3: UGC Scripts */}
              {activeModalGen.tool_type === 'ugc_scripts' && (
                <div className="space-y-4 text-left">
                  {/* Visual directions & spoken dialogs tabs select */}
                  {['tiktok_script', 'testimonial_script', 'problem_solution_script', 'thirty_second_ad'].map(scrKey => {
                    const block = activeModalGen.generated_result[scrKey];
                    if (!block) return null;
                    return (
                      <div key={scrKey} className="p-4 bg-black/40 border border-purple-500/10 rounded-xl space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-purple-500/5">
                          <span className="text-xs font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200">
                            {scrKey.replace('_', ' ').replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => handleCopyText(block.dialogue, `ugc_${scrKey}`)}
                            className="flex items-center gap-1 text-[10px] text-purple-300 hover:text-purple-200 font-extrabold cursor-pointer"
                          >
                            {copiedKey === `ugc_${scrKey}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            Copy Script
                          </button>
                        </div>
                        <div className="text-[11px] leading-relaxed text-gray-400">
                          <strong className="text-purple-400 text-xs">Visual Direction:</strong> {block.visual}
                        </div>
                        <div className="text-[11px] leading-relaxed text-gray-400 font-mono">
                          <strong className="text-indigo-400 text-xs">Sound Bed:</strong> {block.audio}
                        </div>
                        <div className="text-xs leading-relaxed text-purple-100 font-bold p-3 bg-purple-950/15 rounded-lg border border-purple-500/5">
                          "{block.dialogue}"
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </Modal>
      )}

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
export default SavedProjects;
