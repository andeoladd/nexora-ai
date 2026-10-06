import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Lead, LeadScore, Conversation, Service } from '../types/database';
import {
  Sparkles,
  TrendingUp,
  Users,
  MessageSquare,
  Award,
  ArrowRight,
  Target,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Flame,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string, contextId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      try {
        setLoading(true);
        const [userLeads, userConvs, userServices] = await Promise.all([
          dbService.getLeads(user.id),
          dbService.getConversations(user.id),
          dbService.getServices(user.id),
        ]);
        setLeads(userLeads);
        setConversations(userConvs);
        setServices(userServices);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  // Derived metrics
  const totalLeads = leads.length;
  const highOpportunityLeads = leads.filter(
    (l) => l.status === 'researched' || l.status === 'qualified'
  );
  const activeConversations = conversations.filter(
    (c) => c.stage !== 'won' && c.stage !== 'lost' && c.stage !== 'not_interested'
  );
  const positiveReplies = conversations.filter(
    (c) => c.sentiment === 'positive' || c.stage === 'interested' || c.stage === 'qualified'
  ).length;
  const meetingsBooked = conversations.filter(
    (c) => c.stage === 'meeting_requested' || c.stage === 'meeting_booked'
  ).length;
  const conversionRate =
    totalLeads > 0 ? Math.round(((positiveReplies + meetingsBooked) / totalLeads) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 border border-slate-800 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Opportunity Intelligence Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.display_name || 'Founder'}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Nexora is monitoring your target markets, identifying potential business friction, and matching high-converting services to qualified opportunities.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('find-leads')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Discover New Leads</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('website-analyzer')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Analyze a Website</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (Section 24) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Leads</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalLeads}</div>
          <span className="text-[11px] text-emerald-600 font-medium">In your pipeline</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">High Opportunity</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{highOpportunityLeads.length}</div>
          <span className="text-[11px] text-amber-600 font-medium">Score 85%+</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Active Convs</span>
            <MessageSquare className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeConversations.length}</div>
          <span className="text-[11px] text-sky-600 font-medium">In discussion</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Positive Replies</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{positiveReplies}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Interested</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Meetings</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{meetingsBooked}</div>
          <span className="text-[11px] text-indigo-600 font-medium">Calls requested</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Conversion</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{conversionRate}%</div>
          <span className="text-[11px] text-purple-600 font-medium">Lead to reply</span>
        </div>
      </div>

      {/* Recommended Actions (Section 24 & UX Principle "What should the user do next?") */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Recommended Next Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            onClick={() => onNavigate('leads')}
            className="bg-white p-3.5 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Review Researched Leads
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Nordic Artisans has verified mobile checkout friction. Review the evidence and create outreach.
            </p>
          </div>

          <div
            onClick={() => onNavigate('conversations')}
            className="bg-white p-3.5 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Answer Prospect Inquiries
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Sophie Clark asked what you noticed on mobile filtering. Generate an evidence-backed contextual reply.
            </p>
          </div>

          <div
            onClick={() => onNavigate('website-analyzer')}
            className="bg-white p-3.5 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Audit a Prospect URL
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Input any prospect website to scan for mobile, UX, navigation, and conversion friction.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Highest Opportunity & Opportunity By Service */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Highest Opportunity Leads (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Highest Opportunity Leads</h2>
              <p className="text-xs text-slate-500">Leads with verified friction and high service match</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('leads')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
            >
              <span>View all ({totalLeads})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {leads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-900">{lead.company_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                      {lead.industry}
                    </span>
                    {lead.is_demo && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-600 font-medium uppercase tracking-wider">
                        Demo Data
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{lead.description}</p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span>{lead.city}, {lead.country}</span>
                    <span>•</span>
                    <span>{lead.business_model}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-600">92% Match</div>
                    <div className="text-[10px] text-slate-400">Ecommerce Optimization</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('lead-profile', lead.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    View Research
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunity By Service Breakdown (Right 1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Opportunity by Service</h2>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500">Distribution of detected client needs</p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700">Ecommerce Optimization</span>
                <span className="text-slate-900 font-bold">52% (High demand)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '52%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700">Website Redesign</span>
                <span className="text-slate-900 font-bold">24%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700">Conversion Rate Optimization</span>
                <span className="text-slate-900 font-bold">18%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700">Website Audit</span>
                <span className="text-slate-900 font-bold">6%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '6%' }} />
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Insight:</span> Most researched leads already have active traffic but lose sales on mobile checkouts. Targeting small friction points yields a higher reply rate than offering full redesigns.
          </div>
        </div>
      </div>
    </div>
  );
};
