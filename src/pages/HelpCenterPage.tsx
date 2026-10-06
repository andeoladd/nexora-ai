import React, { useState } from 'react';
import { SUPPORT_CONFIG } from '../config/support';
import {
  HelpCircle,
  Search,
  BookOpen,
  Mail,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface HelpCenterPageProps {
  onOpenSupport: () => void;
}

const FAQS = [
  {
    category: 'Getting Started',
    q: 'What is Nexora and how does it work?',
    a: 'Nexora is an AI-powered lead research, opportunity discovery, service matching, and outreach assistant for businesses and freelancers. It analyzes public business websites, identifies specific friction points or growth opportunities, matches them to your configured services, and drafts natural, non-spammy outreach.',
  },
  {
    category: 'Leads & Research',
    q: 'How does lead research work without fabricating information?',
    a: 'Nexora evaluates observable public website evidence—such as mobile viewport layouts, checkout steps, catalog load speed, and call-to-action placement. It never claims something was detected if it was not observed, and clearly marks demo scans as demo data.',
  },
  {
    category: 'Conversations & Memory',
    q: 'Does Nexora remember what was previously discussed in a conversation?',
    a: 'Yes! Nexora stores the full conversation history. When a prospect asks "What exactly did you notice?" or "How much does it cost?", Nexora answers their question directly first from researched evidence or your pricing configuration before proposing next steps.',
  },
  {
    category: 'Multi-User & Isolation',
    q: 'Can multiple users use Nexora without seeing each other\'s data?',
    a: 'Yes! Nexora is a true multi-tenant SaaS. User A only sees User A\'s leads, conversations, campaigns, and settings. User B only sees User B\'s data. Strict Supabase Row Level Security (RLS) policies enforce this at the database level.',
  },
  {
    category: 'Support',
    q: 'How do I contact support if I have questions?',
    a: `Every user has access to our support desk. You can submit an inquiry through the Contact Support modal or email us directly at ${SUPPORT_CONFIG.email}.`,
  },
];

export const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ onOpenSupport }) => {
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter(
    (f) =>
      !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center py-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Knowledge Base & Support</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">How can we help you?</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Search guides, learn about conversation memory, or contact our support team.
        </p>

        {/* Search Bar */}
        <div className="mt-6 max-w-lg mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides (e.g. lead research, multi-user, pricing)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Support Box */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold mb-1">
            <Mail className="w-4 h-4" />
            <span>Dedicated User Support</span>
          </div>
          <h3 className="font-bold text-lg">Need more help?</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Our support desk is always accessible at <span className="text-white font-medium underline">{SUPPORT_CONFIG.email}</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSupport}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer shrink-0"
        >
          Open Support Form
        </button>
      </div>

      {/* FAQs List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-base text-slate-900 mb-2">Frequently Answered Topics</h3>

        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left py-2 flex items-center justify-between text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {isOpen && (
                <p className="text-xs text-slate-600 leading-relaxed pt-1 pb-2">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
