import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      bar: 'bg-emerald-500',
      glow: 'shadow-emerald-500/10'
    },
    error: {
      bg: 'bg-rose-950/40 border-rose-500/30 text-rose-300',
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
      bar: 'bg-rose-500',
      glow: 'shadow-rose-500/10'
    },
    warning: {
      bg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      bar: 'bg-amber-500',
      glow: 'shadow-amber-500/10'
    },
    info: {
      bg: 'bg-purple-950/40 border-purple-500/30 text-purple-300',
      icon: <Info className="w-5 h-5 text-purple-400" />,
      bar: 'bg-purple-500',
      glow: 'shadow-purple-500/10'
    }
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div className={`fixed bottom-5 right-5 z-[9999] flex flex-col gap-1 w-80 backdrop-blur-md border rounded-xl overflow-hidden shadow-2xl p-4 transition-all duration-300 transform translate-y-0 scale-100 ${config.bg} ${config.glow}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0">{config.icon}</div>
        <div className="flex-1 text-sm font-medium leading-5">{message}</div>
        <button
          onClick={onClose}
          className="shrink-0 p-0.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Animated time progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <div 
          className={`h-full ${config.bar} transition-all linear`}
          style={{ 
            animation: `toast-progress ${duration}ms linear forwards` 
          }}
        />
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
export default Toast;
