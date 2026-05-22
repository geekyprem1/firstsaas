import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Sparkles, 
  Flame, 
  Clapperboard, 
  Calendar, 
  Eye, 
  Trash2, 
  X, 
  FileText,
  User,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

export const GenerationsLog = () => {
  const { generations, users, deleteProject } = useDatabase();
  const [toast, setToast] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [toolFilter, setToolFilter] = useState('all');

  // Modal detail display state
  const [selectedGen, setSelectedGen] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const getToolBadge = (toolType) => {
    switch (toolType) {
      case 'ad_generator':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-purple-950/60 border border-purple-500/25 text-purple-300 px-2 py-0.5 rounded-full font-bold select-none">
            <Sparkles className="w-3 h-3 text-purple-400" /> Ad Generator
          </span>
        );
      case 'viral_hooks':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-amber-950/60 border border-amber-500/25 text-amber-300 px-2 py-0.5 rounded-full font-bold select-none">
            <Flame className="w-3 h-3 text-amber-400 animate-pulse" /> Viral Hooks
          </span>
        );
      case 'ugc_scripts':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-blue-950/60 border border-blue-500/25 text-blue-300 px-2 py-0.5 rounded-full font-bold select-none">
            <Clapperboard className="w-3 h-3 text-blue-400" /> UGC Scripts
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-gray-950/60 border border-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-bold select-none">
            AI Engine
          </span>
        );
    }
  };

  const handleDeleteLog = async (id) => {
    if (confirm('Are you sure you want to delete this historical generation log? This action is irreversible.')) {
      await deleteProject(id);
      showToast('Generation log deleted successfully.', 'info');
    }
  };

  // Match generation to user details
  const getLogUser = (userId) => {
    const user = users.find(u => u.id === userId);
    return user || { name: 'Unknown User', email: 'deleted@user.com' };
  };

  // Filter logs
  const filteredGenerations = generations.filter(gen => {
    const user = getLogUser(gen.user_id);
    const searchMatch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (gen.input_data?.product_name || '').toLowerCase().includes(search.toLowerCase());
      
    const toolMatch = toolFilter === 'all' || gen.tool_type === toolFilter;
    
    return searchMatch && toolMatch;
  });

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" />
          Global Audit & AI Generations Logs
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Monitor all copy generated across the platform, audit database queries, and review details of prompts and results.
        </p>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative flex items-center w-full sm:w-80">
          <span className="absolute left-3.5 text-gray-500 pointer-events-none select-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by client name, email, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-10 text-xs text-white focus:outline-none placeholder-gray-600"
          />
        </div>

        {/* Dropdown tool types */}
        <select
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value)}
          className="w-full sm:w-48 bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-semibold cursor-pointer"
        >
          <option value="all">All AI Generators</option>
          <option value="ad_generator">AI Ad Generator</option>
          <option value="viral_hooks">Viral Hook Builder</option>
          <option value="ugc_scripts">UGC Scripting Studio</option>
        </select>
      </div>

      {/* Generations Audit Table */}
      <div className="glass-panel border-purple-500/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-500/10 bg-[#0c071a]/60 select-none">
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider">User Profile</th>
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider">AI Tool</th>
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider">Product Scope</th>
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider">Date & Time</th>
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider text-center">Cost</th>
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGenerations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-gray-500">
                    <FileText className="w-8 h-8 text-gray-700 mx-auto mb-2.5" />
                    No historical logs matching this query.
                  </td>
                </tr>
              ) : (
                filteredGenerations.map((gen) => {
                  const user = getLogUser(gen.user_id);
                  const date = new Date(gen.created_at);
                  const displayDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={gen.id} className="border-b border-purple-500/5 hover:bg-white/[0.02] transition-colors font-medium">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-950/40 text-purple-300 border border-purple-500/20 flex items-center justify-center font-bold text-[10px] uppercase shadow-[0_0_10px_rgba(168,85,247,0.05)] shrink-0">
                            {user.name.substring(0, 2)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-gray-200 font-bold truncate max-w-[140px]">{user.name}</span>
                            <span className="text-[10px] text-gray-500 truncate max-w-[140px]">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {getToolBadge(gen.tool_type)}
                      </td>
                      <td className="p-4 text-gray-300 font-bold truncate max-w-[180px]">
                        {gen.input_data?.product_name || 'N/A'}
                      </td>
                      <td className="p-4 text-gray-400 whitespace-nowrap">
                        {displayDate}
                      </td>
                      <td className="p-4 text-purple-300 font-black text-center">
                        {gen.credits_used || 1}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedGen(gen)}
                            className="p-1.5 hover:bg-purple-950/30 border border-purple-500/15 rounded-lg text-purple-400 hover:text-purple-300 transition-all cursor-pointer"
                            title="Inspect complete payload"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(gen.id)}
                            className="p-1.5 hover:bg-rose-950/30 border border-rose-500/15 rounded-lg text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                            title="Prune log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Log details Modal */}
      {selectedGen && (
        <Modal 
          isOpen={!!selectedGen} 
          onClose={() => setSelectedGen(null)}
          title="Global Generation Audit Detail"
        >
          <div className="space-y-5 text-left max-h-[70vh] overflow-y-auto pr-1">
            {/* Quick Profile Summary */}
            <div className="flex items-center gap-3.5 p-3.5 bg-black/40 border border-purple-500/10 rounded-2xl select-none">
              <div className="p-2.5 bg-purple-950/50 border border-purple-500/20 text-purple-300 rounded-xl">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-200">{getLogUser(selectedGen.user_id).name}</div>
                <div className="text-[10px] text-gray-500">{getLogUser(selectedGen.user_id).email}</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {new Date(selectedGen.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Inputs Prompt Scope */}
            <div className="space-y-2">
              <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider select-none">Input payload parameters</div>
              <div className="bg-black/30 border border-purple-500/5 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-semibold text-gray-400">
                {Object.entries(selectedGen.input_data || {}).map(([key, val]) => (
                  <div key={key} className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-purple-400/50 block select-none">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="text-gray-300 leading-normal">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Output results copy */}
            <div className="space-y-2">
              <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider select-none">Generated AI Output Result</div>
              <div className="bg-black/40 border border-purple-500/10 rounded-2xl p-4 text-[11px] font-mono text-gray-300 leading-relaxed overflow-x-auto space-y-4 max-h-[300px] overflow-y-auto">
                {selectedGen.tool_type === 'ad_generator' && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-purple-400 font-bold select-none">[Headlines]</span>
                      {selectedGen.generated_result?.headlines?.map((h, i) => (
                        <div key={i} className="mt-1 pl-3 border-l border-purple-800 text-gray-200">{h}</div>
                      ))}
                    </div>
                    <div>
                      <span className="text-purple-400 font-bold select-none">[Viral Hooks]</span>
                      {selectedGen.generated_result?.hooks?.map((h, i) => (
                        <div key={i} className="mt-1 pl-3 border-l border-purple-800 text-gray-200">{h}</div>
                      ))}
                    </div>
                    <div>
                      <span className="text-purple-400 font-bold select-none">[Body Copy]</span>
                      <pre className="mt-1 pl-3 border-l border-purple-800 whitespace-pre-wrap font-sans text-gray-200">{selectedGen.generated_result?.copy}</pre>
                    </div>
                    <div>
                      <span className="text-purple-400 font-bold select-none">[CTAs]</span>
                      {selectedGen.generated_result?.ctas?.map((c, i) => (
                        <div key={i} className="mt-1 pl-3 border-l border-purple-800 text-gray-200">{c}</div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGen.tool_type === 'viral_hooks' && (
                  <div className="space-y-3">
                    {Object.entries(selectedGen.generated_result || {}).map(([key, list]) => (
                      <div key={key}>
                        <span className="text-purple-400 font-bold uppercase select-none">[{key.replace('_', ' ')}]</span>
                        {Array.isArray(list) && list.map((item, idx) => (
                          <div key={idx} className="mt-1 pl-3 border-l border-purple-800 text-gray-200">{item}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {selectedGen.tool_type === 'ugc_scripts' && (
                  <div className="space-y-4">
                    {Object.entries(selectedGen.generated_result || {}).map(([scriptKey, data]) => (
                      <div key={scriptKey} className="p-3 bg-purple-950/20 border border-purple-500/5 rounded-xl space-y-2">
                        <span className="text-purple-400 font-bold uppercase select-none">[{scriptKey.replace('_', ' ')}]</span>
                        {data && (
                          <div className="space-y-1 text-xs font-sans">
                            <div><strong className="text-purple-300 font-bold select-none">Visual:</strong> <span className="text-gray-300">{data.visual}</span></div>
                            <div><strong className="text-purple-300 font-bold select-none">Audio:</strong> <span className="text-gray-300">{data.audio}</span></div>
                            <div className="mt-1.5"><strong className="text-purple-300 font-bold select-none">Dialogue:</strong> <p className="text-gray-200 bg-black/30 p-2 rounded-lg mt-0.5 border border-purple-500/5 whitespace-pre-wrap">{data.dialogue}</p></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-2 select-none border-t border-purple-500/10">
              <button
                onClick={() => setSelectedGen(null)}
                className="py-2 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Audit Detail
              </button>
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

export default GenerationsLog;
