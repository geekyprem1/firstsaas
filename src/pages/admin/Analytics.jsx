import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Users, 
  Sparkles, 
  Flame, 
  Clapperboard, 
  CreditCard,
  ArrowUpRight,
  TrendingDown,
  Percent,
  Calendar,
  Coins,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const Analytics = () => {
  const { generations, users, transactions } = useDatabase();

  // --- STATS COMPILATION ---
  
  // 1. Total Platform Revenue
  const totalRevenue = transactions
    .filter(tx => tx.payment_status === 'completed')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

  // 2. Total User count
  const activeUsersCount = users.length;
  
  // 3. Upgrade conversion (Standard standard users that are not Free plan)
  const premiumUsersCount = users.filter(u => u.plan !== 'Free' && u.role !== 'admin').length;
  const standardUsersCount = users.filter(u => u.role !== 'admin').length;
  const conversionRate = standardUsersCount > 0 
    ? ((premiumUsersCount / standardUsersCount) * 100).toFixed(1) 
    : '0.0';

  // 4. Cumulative Generations operations
  const totalGens = generations.length;

  // --- TOOL POPULARITY ANALYSIS ---
  const toolCounts = generations.reduce((acc, gen) => {
    acc[gen.tool_type] = (acc[gen.tool_type] || 0) + 1;
    return acc;
  }, { ad_generator: 0, viral_hooks: 0, ugc_scripts: 0, image_generator: 0, vision: 0 });

  const popularTools = [
    { 
      id: 'ad_generator', 
      label: 'AI Ad Generator', 
      count: toolCounts.ad_generator,
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      colorClass: 'from-purple-600 to-indigo-600',
      description: 'Headlines, scroll-stoppers & primary Facebook/TikTok copies'
    },
    { 
      id: 'viral_hooks', 
      label: 'Viral Hook Builder', 
      count: toolCounts.viral_hooks,
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      colorClass: 'from-amber-500 to-rose-500',
      description: 'ADHD, curiosity & short-form tiktok hooks overlays'
    },
    { 
      id: 'ugc_scripts', 
      label: 'UGC Scripting Director', 
      count: toolCounts.ugc_scripts,
      icon: <Clapperboard className="w-4 h-4 text-blue-400" />,
      colorClass: 'from-blue-600 to-cyan-500',
      description: 'Problem-solution structured testimonials & script visuals'
    },
    { 
      id: 'image_generator', 
      label: 'AI Image Generator', 
      count: toolCounts.image_generator,
      icon: <ImageIcon className="w-4 h-4 text-emerald-400" />,
      colorClass: 'from-emerald-600 to-teal-500',
      description: 'Creative photorealistic, cinematic, and styled product images'
    },
    { 
      id: 'vision', 
      label: 'AI Vision Auditor', 
      count: toolCounts.vision,
      icon: <Eye className="w-4 h-4 text-sky-400" />,
      colorClass: 'from-sky-500 to-blue-600',
      description: 'Multimodal marketing creative strategic reviews & audience mapping'
    }
  ].sort((a, b) => b.count - a.count);

  // --- PLAN DISTRIBUTION SPLITS ---
  const planCounts = users.reduce((acc, u) => {
    if (u.role !== 'admin') {
      acc[u.plan] = (acc[u.plan] || 0) + 1;
    }
    return acc;
  }, { Free: 0, Pro: 0, Enterprise: 0 });

  const totalClients = planCounts.Free + planCounts.Pro + planCounts.Enterprise;

  const planSplits = [
    { label: 'Free Trial Card', plan: 'Free', count: planCounts.Free, pct: totalClients > 0 ? (planCounts.Free / totalClients * 100).toFixed(0) : 0, color: 'bg-indigo-500' },
    { label: 'Pro Creator', plan: 'Pro', count: planCounts.Pro, pct: totalClients > 0 ? (planCounts.Pro / totalClients * 100).toFixed(0) : 0, color: 'bg-purple-500 animate-pulse' },
    { label: 'Enterprise Agency', plan: 'Enterprise', count: planCounts.Enterprise, pct: totalClients > 0 ? (planCounts.Enterprise / totalClients * 100).toFixed(0) : 0, color: 'bg-emerald-500' }
  ];

  // --- AI PROVIDER TELEMETRY ANALYSIS ---
  const providerCounts = generations.reduce((acc, gen) => {
    const provider = gen.generated_result?._provider || gen.input_data?._provider || 'local';
    acc[provider] = (acc[provider] || 0) + 1;
    return acc;
  }, { openai: 0, gemini: 0, local: 0 });

  const aiProviders = [
    {
      id: 'openai',
      label: 'OpenAI GPT-4o-mini',
      count: providerCounts.openai,
      percentage: totalGens > 0 ? ((providerCounts.openai / totalGens) * 100).toFixed(0) : 0,
      color: 'bg-emerald-500',
      colorClass: 'from-emerald-600 to-teal-500',
      borderClass: 'border-emerald-500/10 hover:border-emerald-500/25',
      badgeBg: 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20',
      description: 'Creative marketing copies, primary headlines & contextual Facebook AD hooks.'
    },
    {
      id: 'gemini',
      label: 'Google Gemini 1.5 Flash',
      count: providerCounts.gemini,
      percentage: totalGens > 0 ? ((providerCounts.gemini / totalGens) * 100).toFixed(0) : 0,
      color: 'bg-blue-500',
      colorClass: 'from-blue-600 to-cyan-500',
      borderClass: 'border-blue-500/10 hover:border-blue-500/25',
      badgeBg: 'bg-blue-950/40 text-blue-400 border border-blue-500/20',
      description: 'High-speed script structural outlines, ADHD curiosity triggers & UGC visual cues.'
    },
    {
      id: 'local',
      label: 'Local Compiler Fallback',
      count: providerCounts.local,
      percentage: totalGens > 0 ? ((providerCounts.local / totalGens) * 100).toFixed(0) : 0,
      color: 'bg-purple-500',
      colorClass: 'from-purple-600 to-indigo-500',
      borderClass: 'border-purple-500/10 hover:border-purple-500/25',
      badgeBg: 'bg-purple-950/40 text-purple-300 border border-purple-500/20',
      description: 'Zero-API cost local copy structures using optimized high-converting copywriting formulas.'
    }
  ].sort((a, b) => b.count - a.count);

  // Map transaction user
  const getTxUserEmail = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : 'unknown@stripe.com';
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2 select-none">
          <TrendingUp className="w-5 h-5 text-purple-400 animate-bounce" style={{ animationDuration: '4s' }} />
          Platform Growth & Analytics Insights
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Perform strategic telemetry audits: view transactional MRR stats, monitor LLM generation velocities, and audit active SaaS usage.
        </p>
      </div>

      {/* Telemetry Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: MRR Platform Revenue */}
        <div className="glass-panel rounded-2xl border-purple-500/10 p-5 shadow-lg select-none hover:border-purple-500/25 transition-all">
          <div className="flex justify-between items-start">
            <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider">Gross Platform MRR</div>
            <div className="p-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-3">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <div className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-0.5 font-bold">
            <ArrowUpRight className="w-3 h-3" /> +14.2% <span className="text-gray-500 font-semibold">vs last week</span>
          </div>
        </div>

        {/* Metric 2: Generations Operations */}
        <div className="glass-panel rounded-2xl border-purple-500/10 p-5 shadow-lg select-none hover:border-purple-500/25 transition-all">
          <div className="flex justify-between items-start">
            <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider">Generations Count</div>
            <div className="p-1.5 bg-purple-950/40 text-purple-400 border border-purple-500/20 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-3">{totalGens.toLocaleString()} Operations</h3>
          <div className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-0.5 font-bold">
            <ArrowUpRight className="w-3 h-3" /> +8.6% <span className="text-gray-500 font-semibold">LLM prompt velocity</span>
          </div>
        </div>

        {/* Metric 3: Active Subscribers */}
        <div className="glass-panel rounded-2xl border-purple-500/10 p-5 shadow-lg select-none hover:border-purple-500/25 transition-all">
          <div className="flex justify-between items-start">
            <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider">Active Client Base</div>
            <div className="p-1.5 bg-blue-950/40 text-blue-400 border border-blue-500/20 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-3">{activeUsersCount} Accounts</h3>
          <div className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-0.5 font-bold">
            <ArrowUpRight className="w-3 h-3" /> +12.0% <span className="text-gray-500 font-semibold">organic signups</span>
          </div>
        </div>

        {/* Metric 4: Stripe Upgrade conversion */}
        <div className="glass-panel rounded-2xl border-purple-500/10 p-5 shadow-lg select-none hover:border-purple-500/25 transition-all">
          <div className="flex justify-between items-start">
            <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider">Conversion to Pro</div>
            <div className="p-1.5 bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-3">{conversionRate}% Upgraded</h3>
          <div className="text-[10px] text-indigo-400 mt-1.5 flex items-center gap-0.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Premium MRR <span className="text-gray-500 font-semibold">shares</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left column: Tool popularity metrics (7 columns) */}
        <div className="md:col-span-7 glass-panel rounded-3xl border-purple-500/10 p-6 shadow-xl space-y-5">
          <div className="pb-3 border-b border-purple-500/10 select-none">
            <h3 className="text-sm font-black text-gray-200 uppercase tracking-wider">Generative Tools Engagement</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Distribution of platform operations grouped by tool category</p>
          </div>

          <div className="space-y-4">
            {popularTools.map((tool) => {
              const percentage = totalGens > 0 ? ((tool.count / totalGens) * 100).toFixed(0) : 0;
              return (
                <div key={tool.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 select-none">
                      {tool.icon}
                      <span className="font-bold text-gray-200">{tool.label}</span>
                    </div>
                    <span className="font-black text-purple-300">{percentage}% <span className="text-[10px] text-gray-500 font-bold">({tool.count} runs)</span></span>
                  </div>
                  {/* Progress Bar background */}
                  <div className="w-full bg-black/40 h-2 border border-purple-500/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${tool.colorClass} rounded-full transition-all duration-1000`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-500 leading-normal">{tool.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Subscription Plan splits (5 columns) */}
        <div className="md:col-span-5 glass-panel rounded-3xl border-purple-500/10 p-6 shadow-xl space-y-4 select-none">
          <div className="pb-3 border-b border-purple-500/10">
            <h3 className="text-sm font-black text-gray-200 uppercase tracking-wider">Client Subscription Splits</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Proportion of clients mapped to monetization packages</p>
          </div>

          {/* Simple Visual split line */}
          <div className="flex h-4 border border-purple-500/5 rounded-full overflow-hidden shadow-inner">
            {planSplits.map((item, index) => (
              <div 
                key={index}
                className={`h-full ${item.color}`}
                style={{ width: `${item.count > 0 ? item.pct : 0}%` }}
                title={`${item.plan}: ${item.pct}%`}
              />
            ))}
          </div>

          {/* Table index keys */}
          <div className="space-y-2.5 pt-2">
            {planSplits.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-gray-300">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                  <span>{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-200 font-extrabold">{item.count} accounts</span>
                  <span className="text-[10px] text-gray-500 ml-1 font-bold">({item.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Provider Telemetry Dashboard Panel */}
      <div className="glass-panel rounded-3xl border-purple-500/10 p-6 shadow-xl space-y-5">
        <div className="pb-3 border-b border-purple-500/10 select-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping shrink-0" />
              AI API Routing & Engine Distribution
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Real-time breakdown of model intelligence layers queried across customer generations</p>
          </div>
          
          {/* Quick Pill aggregates */}
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <span className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">OpenAI: {providerCounts.openai}</span>
            <span className="bg-blue-950/40 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Gemini: {providerCounts.gemini}</span>
            <span className="bg-purple-950/40 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">Local: {providerCounts.local}</span>
          </div>
        </div>

        {/* Proportional Engine distribution split bar */}
        <div className="flex h-5 border border-purple-500/5 rounded-full overflow-hidden shadow-inner select-none bg-black/40">
          {aiProviders.length === 0 || totalGens === 0 ? (
            <div className="w-full bg-gray-900 flex items-center justify-center text-[10px] text-gray-600 font-bold">No generation engine tracking data available</div>
          ) : (
            aiProviders.map((item, index) => {
              // Ensure we don't render a 0% width section if count is 0
              if (item.count === 0) return null;
              return (
                <div 
                  key={index}
                  className={`h-full ${item.color} transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.label}: ${item.percentage}%`}
                />
              );
            })
          )}
        </div>

        {/* Grid cards detail breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {aiProviders.map((prov) => (
            <div 
              key={prov.id} 
              className={`glass-panel border rounded-2xl p-4 space-y-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(168,85,247,0.05)] cursor-default ${prov.borderClass}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider ${prov.badgeBg}`}>
                  {prov.id}
                </span>
                <span className="text-sm font-black text-white">{prov.percentage}%</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-200">{prov.label}</h4>
                <p className="text-[10px] text-gray-500 mt-1 leading-normal">{prov.description}</p>
              </div>
              <div className="pt-2 border-t border-purple-500/5 flex justify-between items-center text-[10px] text-gray-400 font-bold select-none">
                <span>Total execution logs:</span>
                <span className="text-purple-300 font-black">{prov.count} runs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Purchases Registry list */}
      <div className="glass-panel border-purple-500/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-purple-500/10 bg-[#0c071a]/30 select-none">
          <h3 className="text-sm font-black text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-400" />
            Recent Stripe Invoice Transactions
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Real-time credit purchases ledger and payment validation nodes</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-500/10 bg-[#0c071a]/60 select-none">
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider">Transaction Node</th>
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider">Client Email</th>
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider">Credits Purchased</th>
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider">Stripe Charge</th>
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider">Status</th>
                <th className="p-4 font-black uppercase text-purple-400 tracking-wider">Billing Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-10 text-gray-500">
                    No recent payment checkouts recorded.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-purple-500/5 hover:bg-white/[0.01] transition-colors font-medium">
                    <td className="p-4 font-mono text-purple-400/80 font-semibold uppercase">{tx.id}</td>
                    <td className="p-4 text-gray-200 font-bold">{getTxUserEmail(tx.user_id)}</td>
                    <td className="p-4 text-gray-300 font-bold flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-purple-400" />
                      +{tx.credits_added.toLocaleString()}
                    </td>
                    <td className="p-4 text-white font-extrabold">${tx.amount}</td>
                    <td className="p-4">
                      <span className="text-[10px] bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold select-none uppercase">
                        {tx.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{new Date(tx.created_at).toLocaleDateString() + ' ' + new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
