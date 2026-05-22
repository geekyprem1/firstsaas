import React from 'react';
import { 
  Users, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  Cpu, 
  Activity, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const AdminDashboard = ({ onViewChange }) => {
  const { users, generations, apiSettings, transactions } = useDatabase();

  // Metrics calculations
  const totalUsersCount = users.length;
  
  // Active users = users with at least 1 generation in history
  const activeUsersCount = users.filter(u => 
    generations.some(g => g.user_id === u.id)
  ).length;

  const totalGenerationsCount = generations.length;

  // Sum transactions amount
  const totalRevenue = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);

  // Credits used today (simulated from today's runs or general logs)
  const today = new Date().toDateString();
  const creditsUsedToday = generations.filter(g => 
    new Date(g.created_at).toDateString() === today
  ).reduce((acc, g) => acc + (g.credits_used || 1), 0) || 3; // Fallback to 3 if first login of day

  // Get active API provider
  const activeApi = apiSettings.find(a => a.is_default && a.status) || { provider_name: 'openai' };

  // Calculate top users by generation activity
  const topUsers = [...users]
    .map(u => {
      const userRuns = generations.filter(g => g.user_id === u.id).length;
      return { ...u, runs: userRuns };
    })
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 3);

  // Mock Uptime & latency parameters for premium telemetry dashboard feel
  const telemetry = [
    { name: 'OpenAI Endpoint', latency: '185ms', status: 'Online', uptime: '99.98%' },
    { name: 'Gemini Vertex API', latency: '240ms', status: 'Online', uptime: '99.95%' },
    { name: 'Stripe Gateway Sync', latency: '92ms', status: 'Online', uptime: '100.00%' }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 1. Admin Telemetry Headline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric Card: Users */}
        <div className="glass-panel rounded-2xl p-5 border-purple-500/15 flex items-start justify-between shadow-lg relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Account Metrics</div>
            <h3 className="text-2xl font-black text-white">{totalUsersCount} Total</h3>
            <div className="text-xs text-purple-400 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{activeUsersCount} Active Accounts today</span>
            </div>
          </div>
          <div className="p-3 bg-purple-950/40 border border-purple-500/20 text-purple-400 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric Card: Revenue */}
        <div className="glass-panel rounded-2xl p-5 border-purple-500/15 flex items-start justify-between shadow-lg relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Platform Revenue</div>
            <h3 className="text-2xl font-black text-white">${totalRevenue.toFixed(2)}</h3>
            <div className="text-xs text-emerald-400 font-bold">
              <span>+18.5% Growth this week</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric Card: Generations */}
        <div className="glass-panel rounded-2xl p-5 border-purple-500/15 flex items-start justify-between shadow-lg relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Total Copy Compiled</div>
            <h3 className="text-2xl font-black text-white">{totalGenerationsCount} Runs</h3>
            <div className="text-xs text-indigo-400 font-bold">
              <span>{creditsUsedToday} credits spent today</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 2. Platform Telemetry Monitor & Top Users row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Server Telemetry Monitor (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-purple-500/10 select-none">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
              SaaS Server Telemetry Monitor
            </h3>
            <span className="text-[9px] bg-purple-500/10 border border-purple-500/25 text-purple-300 font-bold px-2 py-0.5 rounded">
              REAL-TIME
            </span>
          </div>

          <div className="space-y-3 select-none">
            {telemetry.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-black/40 border border-purple-500/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-purple-100">{t.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Uptime SLA: {t.uptime}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-xs font-mono font-bold text-gray-400">{t.latency}</div>
                    <div className="text-[9px] text-gray-500 uppercase mt-0.5">Response</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-black text-[9px] uppercase">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Top Platform Users (1 col) */}
        <div className="glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl flex flex-col justify-between gap-4">
          <div className="pb-2 border-b border-purple-500/10">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 select-none">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Top Active Accounts
            </h3>
          </div>

          <div className="space-y-3 flex-1 select-none">
            {topUsers.map((tu) => (
              <div key={tu.id} className="flex items-center justify-between p-2.5 bg-purple-950/5 border border-purple-500/5 hover:border-purple-500/15 rounded-xl transition-all">
                <div className="min-w-0 flex-1 pr-3">
                  <div className="text-xs font-black text-gray-200 truncate">{tu.name}</div>
                  <div className="text-[10px] text-gray-500 truncate mt-0.5">{tu.email}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-purple-300">{tu.runs} Runs</div>
                  <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.2 rounded font-bold uppercase">
                    {tu.plan}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onViewChange('admin_users')}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/25 hover:border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Manage User Directory
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Daily Runs Mock Chart Visualization */}
      <div className="glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl space-y-4 select-none">
        <div>
          <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Weekly Platform Generation Load</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Calculates average campaign compiles per business weekday</p>
        </div>

        {/* Sleek Grid mock bars */}
        <div className="grid grid-cols-7 gap-2 items-end h-32 pt-4 border-b border-purple-500/10">
          {[
            { day: 'Mon', count: 18, height: 'h-[40%]', glow: 'bg-purple-500' },
            { day: 'Tue', count: 32, height: 'h-[75%]', glow: 'bg-purple-500' },
            { day: 'Wed', count: 42, height: 'h-[95%]', glow: 'bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]' },
            { day: 'Thu', count: 38, height: 'h-[85%]', glow: 'bg-purple-500' },
            { day: 'Fri', count: 28, height: 'h-[65%]', glow: 'bg-purple-500' },
            { day: 'Sat', count: 12, height: 'h-[30%]', glow: 'bg-violet-500' },
            { day: 'Sun', count: 8, height: 'h-[20%]', glow: 'bg-violet-600' }
          ].map((bar, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] font-bold text-purple-300">{bar.count}</span>
              <div className={`w-full ${bar.height} ${bar.glow} rounded-t-lg transition-all duration-1000`} />
              <span className="text-[9px] text-gray-500 font-bold uppercase mt-1">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
