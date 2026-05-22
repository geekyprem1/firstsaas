import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Clapperboard, 
  ArrowRight, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  Play, 
  Globe, 
  Lock, 
  Database,
  Star,
  Users
} from 'lucide-react';

export const LandingPage = ({ onAuthAction }) => {
  // FAQs accordion state
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Mock Demo Modal Video state
  const [showDemo, setShowDemo] = useState(false);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const FAQS = [
    {
      q: "What is AdViral AI and how does it work?",
      a: "AdViral AI is an advanced generative copywriting suite designed for creators, marketers, and e-commerce agencies. Simply enter your product name, details, and target audience, and our system compiles highly targeted ad copies, scroll-stopping emotional/ADHD hooks, and structured UGC script directions automatically."
    },
    {
      q: "Do I need real API keys to test the platform?",
      a: "No! Out of the box, AdViral AI runs a local database and auth layer in your browser with generous mock credits. If you wish to connect it to live APIs, developers can input OpenAI or Gemini API keys inside the Admin panel integrations page."
    },
    {
      q: "How does the credit consumption wallet system function?",
      a: "Every generative query (Ad Copy, Hooks, or UGC Script) consumes exactly 1 credit. Free tiers start with 50 welcome credits. Upgrading to Pro adds 1,000 monthly credits instantly, and the Enterprise tier grants unlimited AI generation operations."
    },
    {
      q: "Can I simulate Stripe pricing checkouts?",
      a: "Absolutely! Clicking 'Upgrade' in the Billing section opens a high-fidelity Stripe Checkout simulator. You can enter any mock card number to complete a payment, which will immediately update your credit balance and transaction history."
    }
  ];

  return (
    <div className="min-h-screen bg-[#07020d] bg-gradient-to-b from-[#07020d] via-[#090314] to-[#120524] text-gray-200 overflow-x-hidden font-sans relative">
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      
      {/* Absolute floating colorful glowing blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 1. Sticky Header Navbar */}
      <nav className="sticky top-0 z-50 bg-[#090513]/80 backdrop-blur-md border-b border-purple-500/10 h-16 flex items-center justify-between px-6 lg:px-12 select-none">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-white">
            AdViral <span className="text-purple-400 font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-purple-950/50 border border-purple-800/30">AI</span>
          </h1>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-400">
          <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing Plans</a>
          <a href="#faq" className="hover:text-purple-400 transition-colors">FAQs</a>
        </div>

        {/* Auth CTAs */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onAuthAction('login')}
            className="text-xs font-bold text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button 
            onClick={() => onAuthAction('signup')}
            className="flex items-center gap-1.5 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* 2. Hero Branding Section */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 relative z-10 flex flex-col gap-16">
        
        {/* Split Grid for text & high-fidelity art illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Pitch Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 flex flex-col items-center lg:items-start">
            {/* Shimmering Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-950/40 border border-purple-500/20 text-purple-300 rounded-full text-[10px] font-black uppercase tracking-widest select-none shadow-[0_0_15px_rgba(168,85,247,0.05)] animate-pulse">
              <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
              The Ultimate Marketing Suite
            </div>

            {/* Dynamic Typography Headline */}
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Multiply Your Traffic. Go Viral with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400">
                AdViral AI
              </span>
            </h2>

            {/* Pitch Copy */}
            <p className="text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed">
              Unlock high-converting Facebook campaigns, ADHD hooks, TikTok scroll-stoppers, and complete UGC visual scripts in seconds. Built for creator agencies and modern marketing teams.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-4 w-full sm:w-auto">
              <button 
                onClick={() => onAuthAction('signup')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-7 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:-translate-y-0.5"
              >
                Start Generating Free
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setShowDemo(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 bg-white/5 hover:bg-white/10 text-gray-200 border border-purple-500/10 hover:border-purple-500/35 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 text-purple-400 fill-purple-400" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right: Gorgeous AI illustration art image */}
          <div className="lg:col-span-5 flex justify-center relative select-none">
            <div className="relative group w-full max-w-[380px] aspect-square">
              {/* Shimmering backdrop glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 rounded-3xl blur-2xl group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
              
              <div className="w-full h-full glass-panel border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-2 neon-glow-purple group-hover:border-purple-500/35 transition-all duration-300">
                <img 
                  src="/ai_illustration.png" 
                  alt="AdViral AI Illustration" 
                  className="w-full h-full object-cover rounded-2xl opacity-90 group-hover:opacity-100 group-hover:scale-102 transition-all duration-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Center/Full width: Floating Glassmorphic SaaS Browser Preview Mockup */}
        <div className="w-full max-w-5xl mx-auto pt-6 animate-fadeIn select-none">
          <div className="relative group">
            {/* Shimmering backdrop glow */}
            <div className="absolute inset-0 bg-purple-500/5 rounded-3xl blur-3xl group-hover:bg-purple-500/10 transition-all duration-500 pointer-events-none" />
            
            <div className="bg-[#090513]/70 border border-purple-500/15 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md relative z-10 transition-all duration-300 group-hover:border-purple-500/25">
              {/* Browser window handle bar */}
              <div className="h-10 bg-black/50 border-b border-purple-500/10 flex items-center px-4 justify-between">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="bg-black/30 border border-purple-500/5 text-[9px] font-mono text-gray-500 px-10 py-0.5 rounded-md flex items-center gap-1.5">
                  <Globe className="w-2.5 h-2.5" /> adviral.ai/app
                </div>
                <div className="w-6 h-1 bg-transparent" />
              </div>

              {/* Graphic Mockup Dashboard content using generated high fidelity image */}
              <div className="relative overflow-hidden aspect-[16/9] sm:aspect-[21/9]">
                <img 
                  src="/dashboard_preview.png" 
                  alt="AdViral AI Dashboard Preview" 
                  className="w-full h-full object-cover object-top opacity-85 group-hover:opacity-100 transition-opacity duration-500"
                />
                {/* Subtle dark gradient overlay to blend frame with background */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07020d] via-transparent to-transparent opacity-40 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 3. Interactive Features Matrix Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-purple-500/5">
        <div className="text-center space-y-2 select-none mb-14">
          <span className="text-[10px] uppercase tracking-widest font-black text-purple-400">Advanced Engine Suites</span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">Three Powerhouse Generative Editors</h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
            Our optimized semantic compiler constructs copy based on tone styles, platform parameters, and high-converting marketing structures.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Ad generator */}
          <div className="glass-panel border-purple-500/10 hover:border-purple-500/35 rounded-3xl p-6 shadow-xl space-y-4 hover:shadow-[0_0_25px_rgba(168,85,247,0.05)] transition-all group">
            <div className="p-3 bg-purple-950/50 border border-purple-500/20 text-purple-400 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-white">AI Ad Copywriter</h4>
              <p className="text-xs text-gray-400 leading-normal">
                Generates Facebook/TikTok primary body texts, optimized headings list, scroll-stopping hooks, and clear action CTAs.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-500 border-t border-purple-500/5 pt-3 text-left">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Platform-aware formatting</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Witty, bold, & creative tones</li>
            </ul>
          </div>

          {/* Card 2: Viral hooks */}
          <div className="glass-panel border-purple-500/10 hover:border-purple-500/35 rounded-3xl p-6 shadow-xl space-y-4 hover:shadow-[0_0_25px_rgba(168,85,247,0.05)] transition-all group">
            <div className="p-3 bg-amber-950/50 border border-amber-500/20 text-amber-400 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-white">Viral Hook Builder</h4>
              <p className="text-xs text-gray-400 leading-normal">
                Develop curiosity spikes, emotional triggers, FOMO/urgency hooks, and short-form TikTok overlays engineered for high retention.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-500 border-t border-purple-500/5 pt-3 text-left">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Attention-grabbing openings</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> ADHD & curiosity hooks</li>
            </ul>
          </div>

          {/* Card 3: UGC script */}
          <div className="glass-panel border-purple-500/10 hover:border-purple-500/35 rounded-3xl p-6 shadow-xl space-y-4 hover:shadow-[0_0_25px_rgba(168,85,247,0.05)] transition-all group">
            <div className="p-3 bg-blue-950/50 border border-blue-500/20 text-blue-400 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-white">UGC Scripting Studio</h4>
              <p className="text-xs text-gray-400 leading-normal">
                Compiles complete screen storyboards: maps audio, speech dialogues, and visual cues (e.g. split-screens, snapping rubber).
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-500 border-t border-purple-500/5 pt-3 text-left">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-400" /> Step-by-step visual blueprints</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-400" /> Problem-Solution testimonials</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Public Plans & Pricing Card Grid */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-purple-500/5">
        <div className="text-center space-y-2 select-none mb-14">
          <span className="text-[10px] uppercase tracking-widest font-black text-purple-400">Subscription Plans</span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">Flexible Scale Plans</h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
            Choose the package tier matching your monthly campaign runs. Upgrades can be simulated dynamically.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Card 1: Free */}
          <div className="glass-panel border-purple-500/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-[360px] text-left">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest">Free Trial</h4>
                <div className="flex items-baseline mt-2 select-none">
                  <span className="text-3xl font-black text-white">$0</span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-400 font-medium pt-2 border-t border-purple-500/5">
                <li className="flex items-center gap-2 select-none"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> 50 welcome credits</li>
                <li className="flex items-center gap-2 select-none"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Access all AI tool editors</li>
                <li className="flex items-center gap-2 select-none"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Local storage backup logs</li>
              </ul>
            </div>
            <button 
              onClick={() => onAuthAction('signup')}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-purple-500/10"
            >
              Sign Up Free
            </button>
          </div>

          {/* Card 2: Pro */}
          <div className="glass-panel border-purple-500/30 bg-gradient-to-b from-[#180f2b]/40 via-[#0f0722]/40 to-[#070211]/40 rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between h-[360px] text-left shadow-[0_0_30px_rgba(168,85,247,0.06)]">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-purple-600 border border-purple-400 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)] select-none">
              Most Popular
            </span>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest">Pro Creator</h4>
                <div className="flex items-baseline mt-2 select-none">
                  <span className="text-3xl font-black text-white">$49</span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-400 font-medium pt-2 border-t border-purple-500/5">
                <li className="flex items-center gap-2 select-none"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> 1,000 monthly credits</li>
                <li className="flex items-center gap-2 select-none"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Saved Projects project folders</li>
                <li className="flex items-center gap-2 select-none"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Priority service SLA queue</li>
                <li className="flex items-center gap-2 select-none"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Stripe checkout simulator access</li>
              </ul>
            </div>
            <button 
              onClick={() => onAuthAction('signup')}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:-translate-y-0.5"
            >
              Get Pro Access
            </button>
          </div>

          {/* Card 3: Enterprise */}
          <div className="glass-panel border-purple-500/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-[360px] text-left">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest">Enterprise</h4>
                <div className="flex items-baseline mt-2 select-none">
                  <span className="text-3xl font-black text-white">$199</span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-400 font-medium pt-2 border-t border-purple-500/5">
                <li className="flex items-center gap-2 select-none"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Unlimited credits supply</li>
                <li className="flex items-center gap-2 select-none"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Live API keys toggling switcher</li>
                <li className="flex items-center gap-2 select-none"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Dedicated account support 24/7</li>
                <li className="flex items-center gap-2 select-none"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Custom tools cost override nodes</li>
              </ul>
            </div>
            <button 
              onClick={() => onAuthAction('signup')}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-purple-500/10"
            >
              Go Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* 5. public interactive Accordions FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20 relative z-10 border-t border-purple-500/5">
        <div className="text-center space-y-2 select-none mb-12">
          <span className="text-[10px] uppercase tracking-widest font-black text-purple-400">Client Inquiries</span>
          <h3 className="text-2xl font-black text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className="glass-panel border-purple-500/10 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-gray-200 hover:text-white transition-colors cursor-pointer select-none"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-[11px] text-gray-400 leading-relaxed font-semibold border-t border-purple-500/5 select-text animate-slideDown">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Footer branding banner */}
      <footer className="border-t border-purple-500/10 bg-[#090513]/40 py-12 px-6 lg:px-12 select-none relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-extrabold text-white">AdViral AI SaaS MVP</span>
          </div>

          <div className="text-[10px] text-gray-500 font-medium text-center md:text-right">
            &copy; 2026 AdViral AI. Built with premium dark aesthetics for creators.
          </div>
        </div>
      </footer>

      {/* Demo Video Mockup Modal */}
      {showDemo && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-60 animate-fadeIn"
          onClick={() => setShowDemo(false)}
        >
          <div 
            className="max-w-2xl w-full glass-panel border-purple-500/25 bg-[#090513]/90 rounded-3xl p-6 shadow-2xl space-y-4 text-left relative z-70 animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-purple-500/10 select-none">
              <div className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AdViral Copy Generator Demo Run
              </div>
              <button 
                onClick={() => setShowDemo(false)}
                className="text-[10px] text-gray-500 hover:text-white uppercase font-bold cursor-pointer"
              >
                Close demo
              </button>
            </div>

            {/* Simulated generation loading steps */}
            <div className="aspect-video bg-black/40 border border-purple-500/15 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4 font-mono text-[10px] text-purple-300 select-none relative overflow-hidden">
              {/* Pulsing ring inside demo */}
              <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
              <div className="space-y-1">
                <div className="font-bold text-gray-200 animate-pulse">[+] COMPILING NEURAL OUTLINE...</div>
                <div className="text-gray-500 animate-pulse">Running hooks analyzer: 185ms</div>
                <div className="text-gray-500 animate-pulse">Platform TikTok formatting applied successfully</div>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 leading-normal font-semibold select-none">
              AdViral AI generates headlines, short-form ADHD curiosity hooks, and UGC visuals scripts within seconds of entering simple input parameters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
