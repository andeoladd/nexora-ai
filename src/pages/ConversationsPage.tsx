import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { aiService, ConversationReplySuggestion, ConversationSummaryResult } from '../services/ai';
import {
  Conversation,
  ConversationMessage,
  Lead,
  LeadResearch,
  Service,
  ConversationStage,
} from '../types/database';
import {
  MessageSquare,
  Sparkles,
  Send,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
  DollarSign,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface ConversationsPageProps {
  initialConversationId?: string;
  onNavigate: (view: string, contextId?: string) => void;
}

export const ConversationsPage: React.FC<ConversationsPageProps> = ({
  initialConversationId,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [leadsMap, setLeadsMap] = useState<Record<string, Lead>>({});
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [currentResearch, setCurrentResearch] = useState<LeadResearch | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Message composition
  const [userReplyText, setUserReplyText] = useState('');
  const [sending, setSending] = useState(false);

  // Simulator for prospect incoming response
  const [incomingProspectText, setIncomingProspectText] = useState('');
  const [simulatingIncoming, setSimulatingIncoming] = useState(false);

  // AI suggestions & summary
  const [aiSuggestion, setAiSuggestion] = useState<ConversationReplySuggestion | null>(null);
  const [aiSummary, setAiSummary] = useState<ConversationSummaryResult | null>(null);

  useEffect(() => {
    async function loadConversations() {
      if (!user) return;
      try {
        setLoading(true);
        const [convList, leadList, userServices] = await Promise.all([
          dbService.getConversations(user.id),
          dbService.getLeads(user.id),
          dbService.getServices(user.id),
        ]);

        setConversations(convList);
        setServices(userServices);

        const map: Record<string, Lead> = {};
        leadList.forEach((l) => {
          map[l.id] = l;
        });
        setLeadsMap(map);

        if (!activeConvId && convList.length > 0) {
          setActiveConvId(convList[0].id);
        } else if (initialConversationId) {
          setActiveConvId(initialConversationId);
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, [user, initialConversationId]);

  // Load active conversation details & messages
  useEffect(() => {
    async function loadActiveConversationDetails() {
      if (!user || !activeConvId) return;
      try {
        const msgs = await dbService.getConversationMessages(user.id, activeConvId);
        setMessages(msgs);

        const conv = conversations.find((c) => c.id === activeConvId);
        if (conv) {
          const lead = leadsMap[conv.lead_id];
          setCurrentLead(lead || null);

          if (lead) {
            const res = await dbService.getLeadResearch(user.id, lead.id);
            setCurrentResearch(res);

            // Generate conversation summary
            const summary = aiService.generateConversationSummary(conv, msgs);
            setAiSummary(summary);

            // If the last message was from the prospect, automatically calculate AI reply suggestion!
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg && lastMsg.sender_type === 'prospect') {
              const matchedService = services.find((s) => s.name === conv.recommended_service);
              const suggestion = aiService.generateContextualReply({
                conversation: conv,
                messages: msgs,
                newProspectMessage: lastMsg.message,
                leadResearch: res,
                userPricing: matchedService?.price,
              });
              setAiSuggestion(suggestion);
              setUserReplyText(suggestion.suggestedReply);
            } else {
              setAiSuggestion(null);
            }
          }
        }
      } catch (err) {
        console.error('Error loading active conversation messages:', err);
      }
    }
    loadActiveConversationDetails();
  }, [user, activeConvId, conversations, leadsMap, services]);

  const handleSendUserMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeConvId || !userReplyText.trim()) return;

    setSending(true);
    try {
      const newMsg: ConversationMessage = {
        id: `msg_${Date.now()}`,
        user_id: user.id,
        conversation_id: activeConvId,
        sender_type: 'user',
        channel: 'email',
        message: userReplyText.trim(),
        created_at: new Date().toISOString(),
      };

      await dbService.addConversationMessage(user.id, newMsg);
      const updatedMsgs = [...messages, newMsg];
      setMessages(updatedMsgs);
      setUserReplyText('');
      setAiSuggestion(null);

      // Refresh summary
      const conv = conversations.find((c) => c.id === activeConvId);
      if (conv) {
        setAiSummary(aiService.generateConversationSummary(conv, updatedMsgs));
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // Simulate prospect replying (allows testing Section 17 & 48 contextual memory)
  const handleSimulateProspectReply = async (textToSimulate?: string) => {
    if (!user || !activeConvId) return;
    const msg = textToSimulate || incomingProspectText.trim();
    if (!msg) return;

    setSimulatingIncoming(true);
    try {
      const prospectMsg: ConversationMessage = {
        id: `msg_${Date.now()}`,
        user_id: user.id,
        conversation_id: activeConvId,
        sender_type: 'prospect',
        channel: 'email',
        message: msg,
        created_at: new Date().toISOString(),
      };

      await dbService.addConversationMessage(user.id, prospectMsg);
      const updatedMsgs = [...messages, prospectMsg];
      setMessages(updatedMsgs);
      setIncomingProspectText('');

      const conv = conversations.find((c) => c.id === activeConvId);
      if (conv) {
        // Run contextual intelligence
        const matchedService = services.find((s) => s.name === conv.recommended_service);
        const suggestion = aiService.generateContextualReply({
          conversation: conv,
          messages: updatedMsgs,
          newProspectMessage: msg,
          leadResearch: currentResearch,
          userPricing: matchedService?.price,
        });

        // Update stage in database if recommended
        if (suggestion.recommendedStage !== conv.stage) {
          await dbService.updateConversationStage(user.id, activeConvId, suggestion.recommendedStage, {
            next_action: suggestion.nextAction,
          });
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConvId ? { ...c, stage: suggestion.recommendedStage, next_action: suggestion.nextAction } : c
            )
          );
        }

        setAiSuggestion(suggestion);
        setUserReplyText(suggestion.suggestedReply);
        setAiSummary(aiService.generateConversationSummary(conv, updatedMsgs));
      }
    } catch (err) {
      console.error('Error simulating reply:', err);
    } finally {
      setSimulatingIncoming(false);
    }
  };

  const handleUpdateStage = async (stage: ConversationStage) => {
    if (!user || !activeConvId) return;
    await dbService.updateConversationStage(user.id, activeConvId, stage);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, stage } : c))
    );
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Context-Aware Conversation Memory</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Conversations</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Nexora remembers the full history of every exchange. When a prospect asks questions about observations or pricing, Nexora answers directly from research evidence before proposing next steps.
        </p>
      </div>

      {/* Main 3-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* Left (3 cols): Conversations List */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Threads ({conversations.length})
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[580px]">
            {conversations.map((conv) => {
              const lead = leadsMap[conv.lead_id];
              const isSelected = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="truncate">{lead?.company_name || 'Prospect'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                      {conv.stage}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{lead?.contact_name || 'Contact'}</div>
                  <div className="text-[10px] text-indigo-600 font-medium mt-1 truncate">
                    {conv.recommended_service}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center (6 cols): Thread View & Composition */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 flex flex-col shadow-xs overflow-hidden">
          {/* Thread Header */}
          {activeConv && currentLead ? (
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-slate-900">{currentLead.company_name}</h3>
                  <span className="text-xs text-slate-500">({currentLead.contact_name})</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Target Service: <span className="font-semibold text-slate-700">{activeConv.recommended_service}</span>
                </p>
              </div>

              {/* Stage selector */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400 font-medium">Stage:</span>
                <select
                  value={activeConv.stage}
                  onChange={(e) => handleUpdateStage(e.target.value as ConversationStage)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="replied">Replied</option>
                  <option value="interested">Interested</option>
                  <option value="qualified">Qualified</option>
                  <option value="meeting_requested">Meeting Requested</option>
                  <option value="meeting_booked">Meeting Booked</option>
                  <option value="proposal">Proposal</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="not_interested">Not Interested</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-4 text-xs text-slate-400">Select a conversation</div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3.5 max-h-[400px]">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No messages yet. Send your initial outreach draft below.
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.sender_type === 'user';
                return (
                  <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1 opacity-75 font-medium">
                        <span>{isUser ? user?.display_name || 'You' : currentLead?.contact_name || 'Prospect'}</span>
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="whitespace-pre-wrap">{m.message}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Simulator Bar (For User to Test Contextual Replies) */}
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simulate Prospect Response:</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleSimulateProspectReply('What exactly did you notice with our mobile store?')}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-[10px] text-slate-700 font-medium"
                >
                  "What did you notice?"
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateProspectReply('How much does this typically cost?')}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-[10px] text-slate-700 font-medium"
                >
                  "How much does it cost?"
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateProspectReply('Sure, send over the screenshots.')}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-[10px] text-slate-700 font-medium"
                >
                  "Send it over"
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateProspectReply('Not interested right now, thanks.')}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-[10px] text-slate-700 font-medium"
                >
                  "Not interested"
                </button>
              </div>
            </div>
          </div>

          {/* User Reply Form */}
          <form onSubmit={handleSendUserMessage} className="p-4 border-t border-slate-200 bg-white">
            <div className="relative">
              <textarea
                rows={3}
                value={userReplyText}
                onChange={(e) => setUserReplyText(e.target.value)}
                placeholder="Type your reply or review the contextual AI recommendation..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none font-mono text-slate-800"
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                AI drafts are contextual recommendations for your review before sending.
              </span>
              <button
                type="submit"
                disabled={sending || !userReplyText.trim()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reply</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right (3 cols): Context & Conversation Intelligence Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Classification & Contextual Suggestion Banner */}
          {aiSuggestion && (
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Prospect Intent</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold uppercase">
                  {aiSuggestion.classification.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {aiSuggestion.classificationReason}
              </p>
              <div className="pt-1 text-[11px] text-indigo-900 font-semibold">
                Recommended Action: <span className="font-normal text-slate-700">{aiSuggestion.nextAction}</span>
              </div>
            </div>
          )}

          {/* Conversation Summary (Section 49) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Conversation Summary</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700 block text-[11px]">Prospect Need:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  {aiSummary?.prospectNeed || 'Understood mobile friction issues on product pages.'}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block text-[11px]">Recommended Service:</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                  {aiSummary?.recommendedService || activeConv?.recommended_service}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block text-[11px]">Questions Asked by Prospect:</span>
                <ul className="mt-1 space-y-1 text-slate-600">
                  {aiSummary?.questionsAsked.map((q, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-indigo-500">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block text-[11px]">Next Best Action:</span>
                <p className="text-slate-700 font-medium mt-0.5">
                  {aiSummary?.nextBestAction || 'Answer question directly without overselling.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
