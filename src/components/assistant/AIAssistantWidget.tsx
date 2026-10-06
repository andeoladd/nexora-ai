import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, X, Send, Bot, User, ArrowRight, CornerDownLeft } from 'lucide-react';

interface AIAssistantWidgetProps {
  onNavigate: (view: string, contextId?: string) => void;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; actionView?: string }>>([
    {
      sender: 'ai',
      text: `Hello ${user?.display_name || 'there'}! I am your Nexora Opportunity Assistant. Ask me to find leads, explain why an account needs help, or draft replies.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const QUICK_PROMPTS = [
    { label: 'Find ecommerce prospects in Europe', query: 'Find ecommerce prospects in Europe', action: 'find-leads' },
    { label: 'Analyze a prospect website', query: 'Analyze a prospect website', action: 'website-analyzer' },
    { label: 'Show highest opportunity leads', query: 'Show me my highest opportunity leads', action: 'leads' },
    { label: 'What should I do next?', query: 'What should I do next?' },
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input.trim();
    if (!q) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: q }];
    setMessages(newMsgs);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      let reply = '';
      let actionView: string | undefined;

      const lower = q.toLowerCase();
      if (lower.includes('highest opportunity') || lower.includes('high opportunity')) {
        reply = 'Your highest opportunity lead is Nordic Artisans GmbH (Score: 92%). Their mobile catalog takes 3.8s to load and lacks a sticky add-to-cart button. We recommend Ecommerce Optimization.';
        actionView = 'leads';
      } else if (lower.includes('find ecommerce') || lower.includes('find lead') || lower.includes('find')) {
        reply = 'Opening the Natural-Language Discovery engine. You can search for Shopify stores, DTC brands, or filter by country.';
        actionView = 'find-leads';
      } else if (lower.includes('analyze') && (lower.includes('website') || lower.includes('site'))) {
        reply = 'Opening the Website Analyzer. Input any public URL to scan for mobile UX, navigation, and checkout friction.';
        actionView = 'website-analyzer';
      } else if (lower.includes('what should i do next') || lower.includes('next action')) {
        reply = '1. Review Nordic Artisans\' mobile friction evidence and create a personalized outreach draft.\n2. Respond to Sophie Clark at Veloce Athletics regarding mobile filtering.';
      } else if (lower.includes('prospect replied') || lower.includes('what should i say')) {
        reply = 'Always answer their question directly first! If they ask "What did you notice?", cite specific observable friction points before proposing a call.';
        actionView = 'conversations';
      } else {
        reply = `I have reviewed your workspace data. You have researched leads ready for outreach and active conversation threads. What would you like to tackle first?`;
      }

      setMessages([...newMsgs, { sender: 'ai', text: reply, actionView }]);
      setThinking(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 px-4 py-3 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all cursor-pointer border border-indigo-400/30"
        >
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <span className="text-xs font-bold tracking-tight">Nexora AI</span>
        </button>
      )}

      {/* Assistant Modal Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Nexora AI Assistant</h4>
                <p className="text-[10px] text-slate-400">Scoped to your workspace data</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.actionView && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(m.actionView!);
                        setIsOpen(false);
                      }}
                      className="mt-2 text-[11px] font-bold text-indigo-600 hover:underline flex items-center space-x-1"
                    >
                      <span>Go to {m.actionView}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 rounded-2xl p-3 text-xs border border-slate-200 flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing workspace...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2 bg-slate-100/70 border-t border-slate-200 flex flex-wrap gap-1 text-[10px]">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(qp.query)}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors truncate max-w-full"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Nexora AI..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
