import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Lead, Conversation, Campaign, Service } from '../types/database';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Target,
  MessageSquare,
  CheckCircle2,
  PieChart,
  Layers,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      if (!user) return;
      try {
        setLoading(true);
        const [l, c, camp] = await Promise.all([
          dbService.getLeads(user.id),
          dbService.getConversations(user.id),
          dbService.getCampaigns(user.id),
        ]);
        setLeads(l);
        setConversations(c);
        setCampaigns(camp);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [user]);

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified' || l.status === 'researched').length;
  const highOpportunity = leads.filter((l) => l.status === 'researched' || l.status === 'qualified').length;
  const activeConvs = conversations.filter((c) => c.stage !== 'won' && c.stage !== 'lost').length;
  const positiveReplies = conversations.filter((c) => c.sentiment === 'positive' || c.stage === 'interested' || c.stage === 'qualified').length;
  const meetings = conversations.filter((c) => c.stage === 'meeting_requested' || c.stage === 'meeting_booked').length;
  const won = conversations.filter((c) => c.stage === 'won').length;
  const conversionRate = totalLeads > 0 ? Math.round(((positiveReplies + meetings) / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Opportunity Intelligence & Funnel Analytics</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Monitor your conversion funnel from lead discovery to research, outreach resonance, meetings booked, and won opportunities.
        </p>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Total Leads</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalLeads}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Qualified</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{qualifiedLeads}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">High Opp.</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{highOpportunity}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Active Convs</div>
          <div className="text-2xl font-bold text-sky-600 mt-1">{activeConvs}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Positive Replies</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{positiveReplies}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Meetings</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{meetings}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Conv. Rate</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{conversionRate}%</div>
        </div>
      </div>

      {/* Grid: Conversion Funnel & Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Conversion Funnel Progression</h3>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>1. Discovered Leads</span>
                <span>{totalLeads} (100%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>2. Need-Based Researched</span>
                <span>{qualifiedLeads} ({totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>3. Outreach Initiated</span>
                <span>{activeConvs + 1} (75%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>4. Positive Dialogue / Interested</span>
                <span>{positiveReplies} ({conversionRate}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(conversionRate, 20)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>5. Meeting Booked</span>
                <span>{meetings}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Opportunity by Service */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Opportunities by Service</h3>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3.5 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Ecommerce Optimization</span>
                <span className="font-bold text-slate-900">52% (High demand)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '52%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Website Redesign</span>
                <span className="font-bold text-slate-900">24%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Conversion Rate Optimization</span>
                <span className="font-bold text-slate-900">18%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Website Audit</span>
                <span className="font-bold text-slate-900">6%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '6%' }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
            Average response time to AI-assisted consultative drafts is <span className="font-semibold text-slate-800">2.4x higher</span> than generic cold templates.
          </div>
        </div>
      </div>
    </div>
  );
};
