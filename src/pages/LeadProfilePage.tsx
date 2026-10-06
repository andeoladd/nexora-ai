import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { aiService, GeneratedOutreach } from '../services/ai';
import {
  Lead,
  LeadResearch,
  LeadScore,
  LeadServiceMatch,
  Service,
  CampaignChannel,
  Conversation,
} from '../types/database';
import {
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  Copy,
  Check,
  Zap,
  Building,
  MapPin,
  Send,
  Layers,
  Flame,
} from 'lucide-react';

interface LeadProfilePageProps {
  leadId: string;
  onNavigate: (view: string, contextId?: string) => void;
}

export const LeadProfilePage: React.FC<LeadProfilePageProps> = ({ leadId, onNavigate }) => {
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [research, setResearch] = useState<LeadResearch | null>(null);
  const [score, setScore] = useState<LeadScore | null>(null);
  const [matches, setMatches] = useState<LeadServiceMatch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Outreach Generator state
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<CampaignChannel>('email');
  const [outreachStyle, setOutreachStyle] = useState<'problem_focused' | 'value_first' | 'quick_observation'>('problem_focused');
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedOutreach | null>(null);
  const [draftSubject, setDraftSubject] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSavedSuccess, setDraftSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadLeadData() {
      if (!user || !leadId) return;
      try {
        setLoading(true);
        const [l, r, s, m, serv] = await Promise.all([
          dbService.getLeadById(user.id, leadId),
          dbService.getLeadResearch(user.id, leadId),
          dbService.getLeadScores(user.id, leadId),
          dbService.getLeadServiceMatches(user.id, leadId),
          dbService.getServices(user.id),
        ]);

        setLead(l);
        setResearch(r);
        setScore(s);
        setMatches(m);
        setServices(serv);
      } catch (err) {
        console.error('Error loading lead profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeadData();
  }, [user, leadId]);

  const handleOpenOutreachModal = () => {
    if (!lead || !research) return;
    const matchService = matches[0]?.service_name || 'Ecommerce Optimization';
    const draft = aiService.generateOutreachDraft({
      lead,
      research,
      serviceName: matchService,
      channel: selectedChannel,
      style: outreachStyle,
    });
    setGeneratedDraft(draft);
    setDraftSubject(draft.subject);
    setDraftMessage(draft.message);
    setShowOutreachModal(true);
  };

  const handleRegenerateDraft = (channel: CampaignChannel, style: typeof outreachStyle) => {
    if (!lead || !research) return;
    setSelectedChannel(channel);
    setOutreachStyle(style);
    const matchService = matches[0]?.service_name || 'Ecommerce Optimization';
    const draft = aiService.generateOutreachDraft({
      lead,
      research,
      serviceName: matchService,
      channel,
      style,
    });
    setGeneratedDraft(draft);
    setDraftSubject(draft.subject);
    setDraftMessage(draft.message);
  };

  const handleCopyMessage = () => {
    const fullText = draftSubject ? `Subject: ${draftSubject}\n\n${draftMessage}` : draftMessage;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveDraft = async () => {
    if (!user || !lead) return;
    setSavingDraft(true);
    try {
      await dbService.saveOutreachDraft(user.id, {
        id: `draft_${Date.now()}`,
        user_id: user.id,
        lead_id: lead.id,
        channel: selectedChannel,
        subject: draftSubject || undefined,
        message: draftMessage,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setDraftSavedSuccess(true);
      setTimeout(() => setDraftSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Error saving draft:', err);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleStartConversation = async () => {
    if (!user || !lead) return;
    try {
      const existingConvs = await dbService.getConversations(user.id);
      let targetConv = existingConvs.find((c) => c.lead_id === lead.id);

      if (!targetConv) {
        targetConv = {
          id: `conv_${Date.now()}`,
          user_id: user.id,
          lead_id: lead.id,
          stage: 'contacted',
          recommended_service: matches[0]?.service_name || 'Ecommerce Optimization',
          prospect_need: research?.pain_points[0] || 'Mobile storefront navigation and checkout optimization.',
          important_context: `Initial outreach created for ${lead.company_name} targeting ${lead.contact_name}.`,
          next_action: 'Await response or follow up with marked-up screenshot.',
          sentiment: 'neutral',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await dbService.createConversation(user.id, targetConv);

        // Add the outreach message as the first user message
        if (draftMessage) {
          await dbService.addConversationMessage(user.id, {
            id: `msg_${Date.now()}`,
            user_id: user.id,
            conversation_id: targetConv.id,
            sender_type: 'user',
            message: draftMessage,
            channel: selectedChannel,
            created_at: new Date().toISOString(),
          });
        }
      }

      onNavigate('conversations', targetConv.id);
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading lead research and opportunity scores...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-16 text-center text-slate-500">
        <p>Lead not found.</p>
        <button
          onClick={() => onNavigate('leads')}
          className="mt-3 text-xs text-indigo-600 hover:underline font-semibold"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top back navigation & primary actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('leads')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Leads</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleOpenOutreachModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Personalized Outreach</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{lead.company_name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                {lead.industry}
              </span>
              {lead.is_demo && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-600 font-mono uppercase tracking-wider">
                  Demo Data
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{lead.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{lead.city}, {lead.country}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{lead.company_size} • {lead.business_model}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{lead.contact_name} ({lead.contact_email})</span>
              </span>
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-indigo-600 hover:underline font-medium"
              >
                <span>{lead.website}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Score Capsule */}
          <div className="p-4 rounded-xl bg-slate-900 text-white shrink-0 sm:min-w-[200px] text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Opportunity Score</div>
            <div className="text-3xl font-extrabold text-white mt-0.5">{score?.opportunity_score || 90}%</div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">High Relevance Fit</div>
          </div>
        </div>
      </div>

      {/* Intelligence & Scoring Metrics (Section 12) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Lead Quality</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{score?.lead_quality || 91}%</div>
          <span className="text-[10px] text-indigo-600 font-medium">ICP Match</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Need Strength</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{score?.need_strength || 88}%</div>
          <span className="text-[10px] text-amber-600 font-medium">High Friction</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Service Match</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{score?.service_match || 94}%</div>
          <span className="text-[10px] text-emerald-600 font-medium">Specific Solution</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Opportunity Score</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{score?.opportunity_score || 91}%</div>
          <span className="text-[10px] text-purple-600 font-medium">Overall Rank</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Confidence Score</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{score?.confidence_score || 92}%</div>
          <span className="text-[10px] text-slate-500 font-medium">Observed Signals</span>
        </div>
      </div>

      {/* Core Intelligence Breakdown (Section 12 & 13) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Evidence, Reasoning & Observations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Why This Lead May Need Help & Observable Evidence */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Why This Lead May Need Help</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {research?.research_summary || 'Observable friction points detected in the storefront user journey.'}
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Observable Evidence</h4>
              <div className="space-y-2">
                {research?.evidence.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Website Observations & Weaknesses */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Website Observations & Friction Points</h3>
            <div className="space-y-2">
              {research?.website_observations.map((obs, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-slate-800">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{obs}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Growth Opportunities</h4>
              <div className="space-y-2">
                {research?.growth_opportunities.map((opp, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-800">
                    <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Recommended Opportunity & Matching */}
        <div className="space-y-6">
          {/* Recommended Opportunity (Smallest Appropriate Service) */}
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-xs space-y-4">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Opportunity</span>
            </div>

            <div>
              <div className="text-xl font-bold text-slate-900">
                {matches[0]?.service_name || 'Ecommerce Optimization'}
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                {matches[0]?.match_score || 94}% Service Match
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Why (Reasoning)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {matches[0]?.reasoning || score?.reasoning || 'Matches observed mobile friction directly without pushing an unwanted full redesign.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Buying Signals</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {research?.buying_signals.map((sig, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleOpenOutreachModal}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Draft Personalized Outreach</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Outreach Generator Modal (Section 14 & 15) */}
      {showOutreachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Personalized Outreach Draft</h3>
                <p className="text-xs text-slate-300">
                  AI-assisted draft based on {lead.company_name}'s specific research for your review and approval
                </p>
              </div>
              <button
                onClick={() => setShowOutreachModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Channel and Style Selectors */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-1.5">
                  {(['email', 'linkedin', 'instagram', 'whatsapp', 'general_dm'] as CampaignChannel[]).map((chan) => (
                    <button
                      key={chan}
                      type="button"
                      onClick={() => handleRegenerateDraft(chan, outreachStyle)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                        selectedChannel === chan
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {chan === 'general_dm' ? 'DM' : chan.charAt(0).toUpperCase() + chan.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleRegenerateDraft(selectedChannel, 'problem_focused')}
                    className={`px-2 py-1 text-[11px] rounded-lg font-medium ${
                      outreachStyle === 'problem_focused'
                        ? 'bg-indigo-100 text-indigo-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Problem Focused
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRegenerateDraft(selectedChannel, 'value_first')}
                    className={`px-2 py-1 text-[11px] rounded-lg font-medium ${
                      outreachStyle === 'value_first'
                        ? 'bg-indigo-100 text-indigo-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Value First
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRegenerateDraft(selectedChannel, 'quick_observation')}
                    className={`px-2 py-1 text-[11px] rounded-lg font-medium ${
                      outreachStyle === 'quick_observation'
                        ? 'bg-indigo-100 text-indigo-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Short Note
                  </button>
                </div>
              </div>

              {/* Subject (for email) */}
              {selectedChannel === 'email' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={draftSubject}
                    onChange={(e) => setDraftSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              )}

              {/* Message Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Content (Editable)
                </label>
                <textarea
                  rows={8}
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  className="w-full p-3.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono text-slate-800 leading-relaxed resize-none"
                />
              </div>

              {/* AI Guardrail note */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  Nexora generates respectful, context-aware drafts free from generic spam or fake urgency. You retain complete control to review, edit, or customize before sending.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Message'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    {draftSavedSuccess ? 'Draft Saved ✓' : 'Save as Draft'}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowOutreachModal(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleStartConversation}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open Conversation Thread</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
