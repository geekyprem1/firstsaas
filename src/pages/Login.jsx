import { useState } from 'react';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Globe, ArrowRight, CornerUpLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/Toast';

export const Login = ({ activeView, onViewChange }) => {
  const { login, signup, googleLogin, forgotPassword } = useAuth();
  
  // Local state
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // Toast notifications state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setFormLoading(true);

    if (isForgot) {
      const res = await forgotPassword(email);
      setFormLoading(false);
      if (res.success) {
        showToast('Password reset link sent! Please check your inbox.', 'success');
        setIsForgot(false);
      } else {
        showToast(res.error, 'error');
      }
      return;
    }

    if (isSignUp) {
      const res = await signup(name, email, password);
      setFormLoading(false);
      if (res.success) {
        showToast(`Account created successfully! Welcome, ${name}.`, 'success');
        onViewChange('user_dashboard');
      } else {
        showToast(res.error, 'error');
      }
    } else {
      const res = await login(email, password);
      setFormLoading(false);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        if (res.user.role === 'admin') {
          onViewChange('admin_dashboard');
        } else {
          onViewChange('user_dashboard');
        }
      } else {
        showToast(res.error, 'error');
      }
    }
  };

  const handleGoogleAuth = async () => {
    setFormLoading(true);
    const res = await googleLogin();
    setFormLoading(false);
    if (res.success) {
      showToast(`Logged in successfully via Google!`, 'success');
      onViewChange('user_dashboard');
    } else {
      showToast('Google authentication failed.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-black bg-grid-pattern relative flex items-center justify-center p-4 overflow-hidden">
      {/* Radiant Gradient Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-900/10 rounded-full blur-[90px] pointer-events-none" />
      
      {/* Centered Panel */}
      <div className="w-full max-w-md glass-panel rounded-2xl border-purple-500/20 shadow-2xl relative z-10 p-8 neon-glow-purple flex flex-col gap-6">
        
        {/* Branding & Sub-Header */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.35)] mb-4 animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-wide text-white">
            AdViral <span className="text-purple-400">AI</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
            {isForgot 
              ? 'Reset your credentials to reclaim your viral marketing panel.' 
              : isSignUp 
                ? 'Create a creator account and claim 50 free credits instantly.' 
                : 'Log in to write scroll-stopping marketing copy in seconds.'}
          </p>
        </div>



        {/* Main Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {/* Sign Up: Full Name */}
          {isSignUp && !isForgot && (
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-gray-300">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none transition-all focus:ring-1 focus:ring-purple-500/20"
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-gray-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none transition-all focus:ring-1 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Password Input (Omitted in Forgot Password mode) */}
          {!isForgot && (
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-300">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none transition-all focus:ring-1 focus:ring-purple-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={formLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 btn-primary rounded-xl text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {formLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isForgot 
                  ? 'Request Recovery Link' 
                  : isSignUp 
                    ? 'Start Generating Free' 
                    : 'Access Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Auth Sub-Toggles */}
        {isForgot ? (
          <button
            onClick={() => setIsForgot(false)}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
            Return to Login
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-purple-500/10" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold select-none">Or Continue With</span>
              <div className="flex-1 h-[1px] bg-purple-500/10" />
            </div>

            {/* Google OAuth Simulation Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={formLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-purple-500/10 hover:border-purple-500/25 rounded-xl text-sm font-semibold text-gray-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <Globe className="w-4 h-4 text-purple-400" />
              Sign In with Google
            </button>

            {/* Mode Switch text */}
            <div className="text-center text-xs text-gray-400">
              {isSignUp ? 'Already have an account? ' : 'New to AdViral AI? '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-400 hover:text-purple-300 font-bold transition-colors"
              >
                {isSignUp ? 'Log In' : 'Sign Up Free'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render Toast notification */}
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
export default Login;
