import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const LOADING_PHASES = [
  'Initializing neural creative model...',
  'Analyzing product keywords...',
  'Extracting target audience hooks...',
  'Evaluating competitor angles...',
  'Composing high-converting copy...',
  'Structuring headlines & hooks...',
  'Polishing CTAs and viral variations...',
  'Securing output parameters...'
];

export const Loader = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex(prev => (prev + 1) % LOADING_PHASES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 glass-panel rounded-2xl border-purple-500/20 w-full mx-auto neon-glow-purple my-6 animate-pulse-glow min-h-[460px]">
      <div className="relative mb-6">
        {/* Animated glowing outer rings */}
        <div className="w-20 h-20 rounded-full border-4 border-purple-500/10 border-t-purple-500 border-b-purple-500 animate-spin" />
        <div className="w-16 h-16 rounded-full border-4 border-violet-500/5 border-l-violet-400 border-r-violet-400 animate-spin absolute top-2 left-2 duration-1000" style={{ animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600/20 p-2 rounded-full border border-purple-400/30">
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-purple-200 mb-2">Generating Viral Magic</h3>
      <p className="text-sm text-gray-400 text-center max-w-xs h-10 transition-all duration-300 font-mono">
        {LOADING_PHASES[phaseIndex]}
      </p>

      {/* Futuristic Progress Bar */}
      <div className="w-48 h-1.5 bg-purple-950/40 border border-purple-500/10 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full animate-skeleton w-full" />
      </div>
    </div>
  );
};
export default Loader;
