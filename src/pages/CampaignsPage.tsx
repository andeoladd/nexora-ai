import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { aiService } from '../services/ai';
import {
  Campaign,
  CampaignLead,
  Lead,
  Service,
  CampaignChannel,
  CampaignStatus,
} from '../types/database';
import {
  Sparkles,
  Layers,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Edit3,
  Check,
} from 'lucide-react';

interface CampaignsPageProps {
  onNavigate: (view: string, contextId?: string) => void;
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Campaign modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetService, setTargetService] = useState('Ecommerce Optimization');
  const [channel, setChannel] = useState<CampaignChannel>('email');
  const [creating, setCreating] = useState(false);

  // Campaign Leads inspection modal
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [campaignLeads, setCampaignLeads] = useState<CampaignLead[]>([]);
  const [viewingLeadsModal, setViewingLeadsModal] = useState(false);

  useEffect(() => {
    async function loadCampaigns() {
      if (!user) return;
      try {
        setLoading(true);
        const [cList, lList, sList] = await Promise.all([
          dbService.getCampaigns(user.id),
          dbService.getLeads(user.id),
          dbService.getServices(user.id),
        ]);
        setCampaigns(cList);
        setLeads(lList);
        setServices(sList);
      } catch (err) {
        console.error('Error loading campaigns:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCampaigns();
  }, [user]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setCreating(true);
    try {
      const newCamp: Campaign = {
        id: `camp_${Date.now()}`,
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || undefined,
        channel,
        status: 'draft',
        target_service: targetService,
        lead_count: leads.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await dbService.createCampaign(user.id, newCamp);

      // Populate campaign leads with personalized drafts based on each lead's research!
      for (const l of leads) {
        const research = await dbService.getLeadResearch(user.id, l.id);
        let customMsg = '';
        if (research) {
          const draft = aiService.generateOutreachDraft({
            lead: l,
            research,
            serviceName: targetService,
            channel,
            style: 'problem_focused',
          });
          customMsg = draft.message;
        }

        await dbService.addLeadToCampaign(user.id, {
          id: `cl_${Date.now()}_${l.id}`,
          user_id: user.id,
          campaign_id: newCamp.id,
          lead_id: l.id,
          status: 'drafted',
          custom_message: customMsg,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      setCampaigns([newCamp, ...campaigns]);
      setShowCreateModal(false);
      setName('');
      setDescription('');
    } catch (err) {
      console.error('Error creating campaign:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (campaignId: string, currentStatus: CampaignStatus) => {
    if (!user) return;
    const nextStatus: CampaignStatus =
      currentStatus === 'active' ? 'paused' : 'active';
    await dbService.updateCampaignStatus(user.id, campaignId, nextStatus);
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: nextStatus } : c))
    );
  };

  const handleOpenLeads = async (camp: Campaign) => {
    if (!user) return;
    setActiveCampaign(camp);
    const cls = await dbService.getCampaignLeads(user.id, camp.id);
    setCampaignLeads(cls);
    setViewingLeadsModal(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Channel Outreach Campaigns</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Organize outreach by service and channel. Nexora personalizes each draft based on verified research findings, ensuring prospects receive relevant insights rather than generic templates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No campaigns created yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
            Create your first outreach campaign to generate personalized messages for all researched leads simultaneously.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold uppercase">
                    {camp.channel}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase ${
                      camp.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : camp.status === 'paused'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{camp.name}</h3>
                {camp.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {camp.description}
                  </p>
                )}

                <div className="pt-2 text-xs text-slate-600">
                  Target Service: <span className="font-semibold text-slate-800">{camp.target_service}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleOpenLeads(camp)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                >
                  <span>Review Drafts ({camp.lead_count || leads.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(camp.id, camp.status)}
                  className={`p-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors ${
                    camp.status === 'active'
                      ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {camp.status === 'active' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Launch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Create Campaign</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Spring 2026 Mobile CRO Push"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Service</label>
                  <select
                    value={targetService}
                    onChange={(e) => setTargetService(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    <option value="Ecommerce Optimization">Ecommerce Optimization</option>
                    <option value="Website Redesign">Website Redesign</option>
                    <option value="Conversion Rate Optimization">Conversion Rate Optimization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as CampaignChannel)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="email">Email</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram DM</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="general_dm">General DM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Objective / Notes</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Help ecommerce brands streamline checkout flow..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {creating ? 'Generating Drafts...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Leads Drafts Modal */}
      {viewingLeadsModal && activeCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{activeCampaign.name} — Personalized Drafts</h3>
                <p className="text-xs text-slate-300">Review research-backed drafts before initiating outreach</p>
              </div>
              <button onClick={() => setViewingLeadsModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {campaignLeads.map((cl) => {
                const leadObj = leads.find((l) => l.id === cl.lead_id);
                return (
                  <div key={cl.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{leadObj?.company_name || 'Lead'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                        {cl.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-white p-3 rounded-lg border border-slate-100">
                      {cl.custom_message || 'Research-based draft generating...'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingLeadsModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
