import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Search,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { SUPPORT_CONFIG } from '../config/support';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onOpenSupport: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onOpenSupport,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Nexora</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <button
              type="button"
              onClick={onOpenSupport}
              className="hover:text-white transition-colors flex items-center space-x-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Support</span>
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onSignIn}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section (Section 36) */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/20 to-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered Lead Research & Opportunity Discovery</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find the right opportunities. <br />
            Understand what businesses need. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
              Start better conversations.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base text-slate-300 leading-relaxed">
            Nexora analyzes target companies, identifies genuine website and conversion friction, matches your services to real observed needs, and crafts context-aware, respectful outreach.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Get Started with Nexora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-sm transition-all"
            >
              See How It Works
            </a>
          </div>

          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-User Data Isolation (Supabase RLS)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Need-Based Intelligence (No Fake Claims)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Continuous Conversation Memory</span>
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900/50 border-t border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Core Capabilities</span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Built around the opportunity intelligence loop
            </h2>
            <p className="text-xs text-slate-400">
              Never pitch blindly again. Nexora connects observed client friction to your tailored deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">AI Lead Research</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates publicly available store structure, mobile navigation, load speed, and checkout friction.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Service Matching Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Intelligently recommends the smallest appropriate solution rather than pushing an unwanted full redesign.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Conversation Memory</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stores complete conversation context. Answers prospect questions about observations before asking for calls.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Opportunity Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ranks leads by lead quality, need strength, and service match so you focus only on high-yield opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Workflow</span>
            <h2 className="text-3xl font-bold text-white tracking-tight">How Nexora Works</h2>
            <p className="text-xs text-slate-400">A seamless 7-step journey from discovery to won client</p>
          </div>

          <div className="space-y-4">
            {[
              { step: '01', title: 'Connect your business', desc: 'Add your agency profile, specialties, and operating regions.' },
              { step: '02', title: 'Define ideal customers', desc: 'Specify your target industries, company sizes, and buyer roles.' },
              { step: '03', title: 'Discover relevant leads', desc: 'Use natural-language prompts to discover storefronts and tech companies.' },
              { step: '04', title: 'Research their needs', desc: 'Nexora inspects mobile user flow and catalogs observable friction.' },
              { step: '05', title: 'Match the right service', desc: 'Identifies the precise service that solves the observed problem.' },
              { step: '06', title: 'Start personalized conversations', desc: 'Review AI-assisted consultative drafts tailored to the specific findings.' },
              { step: '07', title: 'Context-aware reply suggestions', desc: 'Answer questions directly from research data and close engagements.' },
            ].map((s) => (
              <div
                key={s.step}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-4"
              >
                <span className="font-mono text-base font-bold text-indigo-400 shrink-0">{s.step}</span>
                <div>
                  <h4 className="font-bold text-sm text-white">{s.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-900/40 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Prototype Plans</span>
            <h2 className="text-3xl font-bold text-white tracking-tight">Transparent SaaS Pricing</h2>
            <p className="text-xs text-slate-400">Prototype tiers for early preview users</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-white">Starter</h3>
              <div className="text-3xl font-extrabold text-white">$19 <span className="text-xs text-slate-400 font-normal">/ mo</span></div>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• 30 AI Lead Researches / mo</li>
                <li>• Website Analyzer scans</li>
                <li>• Conversation memory</li>
                <li>• Standard email support</li>
              </ul>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Get Started
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Popular
              </div>
              <h3 className="font-bold text-base text-white">Growth</h3>
              <div className="text-3xl font-extrabold text-white">$49 <span className="text-xs text-slate-400 font-normal">/ mo</span></div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• 150 AI Lead Researches / mo</li>
                <li>• Multi-channel outreach drafts</li>
                <li>• Campaign personalization</li>
                <li>• Priority email support</li>
              </ul>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Get Started
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-white">Scale</h3>
              <div className="text-3xl font-extrabold text-white">$99 <span className="text-xs text-slate-400 font-normal">/ mo</span></div>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• 500 AI Lead Researches / mo</li>
                <li>• Automated multi-lead campaigns</li>
                <li>• Custom ICP fine-tuning</li>
                <li>• Dedicated account support</li>
              </ul>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white">What is Nexora?</h4>
              <p className="text-slate-400 leading-relaxed">
                Nexora is an AI-powered SaaS platform designed for growth consultants, agencies, and freelancers to discover high-intent leads, research their observable needs, match appropriate services, and manage contextual conversations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white">Does Nexora isolate data between different users?</h4>
              <p className="text-slate-400 leading-relaxed">
                Yes. Nexora is a multi-user SaaS powered by Supabase with Row Level Security (RLS). User A will never see User B's leads, conversations, campaigns, or workspace data.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white">How does conversation memory assist in closing deals?</h4>
              <p className="text-slate-400 leading-relaxed">
                Rather than generating disconnected generic replies, Nexora references the entire message thread. If a lead asks about pricing or what specific issues were observed, Nexora answers the question directly before suggesting a conversation stage upgrade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white text-sm">Nexora</span>
            <span>• Independent AI SaaS Platform</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <button type="button" onClick={onOpenSupport} className="hover:text-white">
              Contact Support
            </button>
            <span className="text-slate-600">|</span>
            <span>Support: {SUPPORT_CONFIG.email}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
