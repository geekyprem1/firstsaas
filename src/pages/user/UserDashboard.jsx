import React from 'react';
import { 
  Sparkles, 
  Coins, 
  History, 
  FolderHeart, 
  ArrowUpRight, 
  ArrowRight,
  Eye, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';

export const UserDashboard = ({ onViewChange, onSelectProject }) => {
  const { user } = useAuth();
  const { generations } = useDatabase();

  // Filter generations belonging to current active user
  const userGens = generations.filter(g => g.user_id === user?.id) || [];
  const totalGenerationsCount = userGens.length;
  const savedProjectsCount = userGens.filter(g => g.is_saved).length;
  const recentGens = userGens.slice(0, 3); // Get last 3 runs

  const handleViewProject = (proj) => {
    onSelectProject(proj);
    onViewChange('saved_projects');
  };

  const getToolTypeLabel = (type) => {
    switch (type) {
      case 'ad_generator': return 'Ad Generator';
      case 'viral_hooks': return 'Viral Hooks';
      case 'ugc_scripts': return 'UGC Script';
      default: return 'AI Tool';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Welcome Card Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/25 via-[#130722]/50 to-black p-6 sm:p-8 neon-glow-purple-sm">
        {/* Background visual glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Viral Copywriting Suite
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200">{user?.name || 'Creator'}</span>!
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Ready to generate scroll-stopping, high-converting copy? Choose a copywriting tool from the sidebar or click below to launch your next campaign.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onViewChange('ad_generator')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-purple-500/30 cursor-pointer"
            >
              Generate AI Ad Copy
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewChange('viral_hooks')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Build Viral Hooks
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Stat Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance Card */}
        <div className="glass-panel rounded-2xl p-5 border-purple-500/15 flex items-start justify-between shadow-lg">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Credits Remaining</div>
            <div className="text-2xl font-black text-white">
              {user?.plan === 'Enterprise' ? 'Unlimited' : user?.credits}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Plan: <span className="text-purple-400 font-semibold">{user?.plan} Tier</span>
            </div>
          </div>
          <div className="p-3 bg-purple-950/40 border border-purple-500/20 text-purple-400 rounded-xl">
            <Coins className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Total Generations Card */}
        <div className="glass-panel rounded-2xl p-5 border-purple-500/15 flex items-start justify-between shadow-lg">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Generations</div>
            <div className="text-2xl font-black text-white">{totalGenerationsCount}</div>
            <div className="text-xs text-gray-500 font-medium">Credits saved: {totalGenerationsCount}</div>
          </div>
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <History className="w-5 h-5" />
          </div>
        </div>

        {/* Saved Projects Card */}
        <div className="glass-panel rounded-2xl p-5 border-purple-500/15 flex items-start justify-between shadow-lg">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Saved Projects</div>
            <div className="text-2xl font-black text-white">{savedProjectsCount}</div>
            <div className="text-xs text-gray-500 font-medium">In your saved library</div>
          </div>
          <div className="p-3 bg-rose-950/40 border border-rose-500/20 text-rose-400 rounded-xl">
            <FolderHeart className="w-5 h-5" />
          </div>
        </div>

        {/* active plan details Card */}
        <div className="glass-panel rounded-2xl p-5 border-purple-500/15 flex items-start justify-between shadow-lg bg-gradient-to-b from-[#180d28]/35 to-transparent">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Plan</div>
            <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">
              {user?.plan} Premium
            </div>
            <button
              onClick={() => onViewChange('billing')}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 group transition-all"
            >
              Upgrade & Top-up
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl font-black text-xs select-none">
            PRO
          </div>
        </div>
      </div>

      {/* 3. Recent Generations Log & Promotion Card Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recent Generations List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-white text-base tracking-wide">Recent Creative Outputs</h3>
            <button 
              onClick={() => onViewChange('saved_projects')}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold transition-all"
            >
              View Full Library
            </button>
          </div>

          {recentGens.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-purple-500/15 rounded-xl bg-purple-950/5">
              <Sparkles className="w-10 h-10 text-purple-500/30 mb-3" />
              <h4 className="text-sm font-bold text-gray-300">No copywriting history yet</h4>
              <p className="text-xs text-gray-500 text-center max-w-xs mt-1 leading-relaxed">
                Unlock your copywriting balance and generate beautiful headlines, scripts, and Facebook ads.
              </p>
              <button
                onClick={() => onViewChange('ad_generator')}
                className="mt-4 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Create Ad Copy Now
              </button>
            </div>
          ) : (
            /* List of Generations */
            <div className="space-y-3">
              {recentGens.map((gen) => (
                <div 
                  key={gen.id} 
                  className="flex items-center justify-between p-4 bg-purple-950/10 border border-purple-500/10 hover:border-purple-500/25 rounded-xl transition-all group text-left"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-purple-200 truncate">
                        {gen.input_data.product_name || 'Viral Campaign'}
                      </span>
                      <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold select-none uppercase shrink-0">
                        {getToolTypeLabel(gen.tool_type)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      Platform: <span className="text-gray-400 font-semibold">{gen.input_data.platform || 'N/A'}</span> • Tone: <span className="text-gray-400 font-semibold">{gen.input_data.tone || 'Bold'}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewProject(gen)}
                    className="p-2 bg-white/5 hover:bg-purple-600 text-gray-400 hover:text-white border border-white/5 hover:border-purple-500 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-md"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Open
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Promotion Banner Cards */}
        <div className="flex flex-col gap-4">
          
          {/* Upgrade Plan Promotion (Only if plan !== 'Enterprise') */}
          {user?.plan !== 'Enterprise' && (
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#270e4e] via-[#100721] to-[#040108] p-6 text-left shadow-xl neon-glow-purple-sm flex flex-col justify-between h-full min-h-[250px]">
              {/* Background glowing line */}
              <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-purple-500/20 to-transparent" />
              
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Exclusive Deal
                </div>
                <h4 className="text-lg font-black text-white leading-tight">
                  Unlock Infinite Creativity with Pro Premium
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-400 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    1,000 Credits loaded instantly
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    Priority access to GPT-4o-mini & Gemini
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    Unlimited saved folders and projects
                  </li>
                </ul>
              </div>

              <div className="pt-4 space-y-2">
                <div className="text-xs text-gray-500">
                  Cancel anytime • Only <span className="text-white font-bold">$49/mo</span>
                </div>
                <button
                  onClick={() => onViewChange('billing')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer"
                >
                  Upgrade Account
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Quick-Help Tooltips Card */}
          <div className="glass-panel rounded-2xl border-purple-500/15 p-5 text-left flex flex-col gap-3 shadow-lg bg-purple-950/5">
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-400">Pro-Tip for Creators</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Struggling with high-performance ad returns? Set your <strong>CTA style</strong> to <span className="text-purple-300 font-semibold">"Shop Now"</span> and use a <span className="text-purple-300 font-semibold">"Witty"</span> tone for TikTok, and <span className="text-purple-300 font-semibold">"Professional"</span> for LinkedIn campaigns to hit high click-through ratios!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserDashboard;
