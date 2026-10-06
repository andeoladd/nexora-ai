import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Profile, Business, Service, Settings, CampaignChannel } from '../types/database';
import { SUPPORT_CONFIG } from '../config/support';
import {
  Settings as SettingsIcon,
  User,
  Building,
  Layers,
  Sparkles,
  Bell,
  Lock,
  HelpCircle,
  Database,
  Plus,
  Trash2,
  Check,
  Copy,
} from 'lucide-react';

interface SettingsPageProps {
  onOpenSupport: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenSupport }) => {
  const { user, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'profile' | 'business' | 'services' | 'ai' | 'notifications' | 'security' | 'database' | 'support'
  >('profile');

  // Profile state
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Business state
  const [business, setBusiness] = useState<Business | null>(null);
  const [businessSaved, setBusinessSaved] = useState(false);

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('$2,000');

  // AI & App Settings state
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // SQL Copy state
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    async function loadSettingsData() {
      if (!user) return;
      const [prof, biz, sList, sett] = await Promise.all([
        dbService.getProfile(user.id),
        dbService.getBusiness(user.id),
        dbService.getServices(user.id),
        dbService.getSettings(user.id),
      ]);

      if (prof) setDisplayName(prof.display_name);
      if (biz) setBusiness(biz);
      setServices(sList);
      if (sett) setSettings(sett);
    }
    loadSettingsData();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await dbService.upsertProfile(user.id, {
      id: `prof_${user.id}`,
      user_id: user.id,
      display_name: displayName,
      timezone: 'UTC',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !business) return;
    await dbService.upsertBusiness(user.id, business);
    setBusinessSaved(true);
    setTimeout(() => setBusinessSaved(false), 2500);
  };

  const handleAddService = async () => {
    if (!user || !newServiceName.trim()) return;
    const created = await dbService.addService(user.id, {
      id: `srv_${Date.now()}`,
      user_id: user.id,
      name: newServiceName.trim(),
      description: newServiceDesc.trim() || 'Professional optimization service.',
      price: newServicePrice,
      target_customer: business?.target_market,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setServices([created, ...services]);
    setNewServiceName('');
    setNewServiceDesc('');
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!user) return;
    await dbService.deleteService(user.id, serviceId);
    setServices(services.filter((s) => s.id !== serviceId));
  };

  const handleToggleService = async (service: Service) => {
    if (!user) return;
    const updated = await dbService.updateService(user.id, service.id, { active: !service.active });
    if (updated) {
      setServices(services.map((s) => (s.id === service.id ? updated : s)));
    }
  };

  const handleSaveAISettings = async () => {
    if (!user || !settings) return;
    await dbService.upsertSettings(user.id, settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    const res = await updatePassword(newPassword);
    if (res.error) {
      setPasswordError(res.error);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Workspace Configuration</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Manage your business profile, service offerings, AI preferences, security, and contact support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar Tabs */}
        <div className="md:col-span-3 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'business'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Business Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'services'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Services & Pricing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI & Outreach Tone</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Passwords</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'support'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Contact Support</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'database'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database & RLS Schema</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-9 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <h3 className="font-bold text-base text-slate-900">Your Account Profile</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-1">Email is tied to your authentication credentials.</p>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Profile
                </button>
                {profileSaved && <span className="text-xs text-emerald-600 font-medium">Profile saved ✓</span>}
              </div>
            </form>
          )}

          {activeTab === 'business' && business && (
            <form onSubmit={handleSaveBusiness} className="space-y-4 max-w-lg">
              <h3 className="font-bold text-base text-slate-900">Business Profile</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={business.business_name}
                  onChange={(e) => setBusiness({ ...business, business_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="text"
                  value={business.website}
                  onChange={(e) => setBusiness({ ...business, website: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={business.industry}
                  onChange={(e) => setBusiness({ ...business, industry: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={business.description}
                  onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Business Details
                </button>
                {businessSaved && <span className="text-xs text-emerald-600 font-medium">Business details saved ✓</span>}
              </div>
            </form>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-slate-900">Configured Services & Pricing</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nexora uses your configured services and pricing when answering prospect questions and matching opportunities.
                </p>
              </div>

              <div className="space-y-2">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 max-w-[75%]">
                      <div className="font-semibold text-slate-900 flex items-center space-x-2">
                        <span>{s.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-sm">
                          {s.price}
                        </span>
                        {!s.active && <span className="text-[10px] text-slate-400 italic">(Disabled)</span>}
                      </div>
                      <p className="text-slate-500 text-[11px] truncate">{s.description}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleService(s)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                          s.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {s.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(s.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Service */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                <span className="text-xs font-bold text-slate-800">Add New Service</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="Service Name"
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    placeholder="Brief description"
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      placeholder="e.g. $1,800"
                      className="w-24 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && settings && (
            <div className="space-y-4 max-w-lg">
              <h3 className="font-bold text-base text-slate-900">AI Preferences & Tone</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tone of Voice</label>
                <select
                  value={settings.AI_preferences.tone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      AI_preferences: { ...settings.AI_preferences, tone: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value="consultative">Consultative & Helpful (Recommended)</option>
                  <option value="direct">Direct & Concise</option>
                  <option value="conversational">Warm & Conversational</option>
                  <option value="formal">Formal & Corporate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Outreach Strategy</label>
                <select
                  value={settings.AI_preferences.preferred_outreach_style}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      AI_preferences: { ...settings.AI_preferences, preferred_outreach_style: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value="problem_focused">Problem-Focused (Highlight observed friction)</option>
                  <option value="value_first">Value-First (Lead with outcome & peer examples)</option>
                  <option value="quick_observation">Short Note (Quick 2-sentence visual prompt)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSaveAISettings}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save AI Preferences
                </button>
                {settingsSaved && <span className="text-xs text-emerald-600 font-medium">Preferences saved ✓</span>}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <h3 className="font-bold text-base text-slate-900">Update Password</h3>

              {passwordError && (
                <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (Min 6 chars)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                Update Password
              </button>
              {passwordSuccess && <span className="text-xs text-emerald-600 font-medium ml-3">Password updated!</span>}
            </form>
          )}

          {activeTab === 'support' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="font-bold text-base text-slate-900">Nexora Support Center</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every Nexora user has access to dedicated product support. You can submit an inquiry directly through the form or email our support desk.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div>
                  Official Support Desk: <span className="font-bold text-indigo-600">{SUPPORT_CONFIG.email}</span>
                </div>
                <div className="text-slate-500">{SUPPORT_CONFIG.responseTimeHint}</div>
              </div>

              <button
                type="button"
                onClick={onOpenSupport}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Open Support Request Form</span>
              </button>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Database & RLS Schema</h3>
                  <p className="text-xs text-slate-500">
                    PostgreSQL script with strict Row Level Security (RLS) policies for all 20+ tables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`-- Complete Nexora Supabase Migration located in /supabase/migrations/20250101_init_nexora.sql`);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center space-x-1"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed">
                <div>-- Migration file: /supabase/migrations/20250101_init_nexora.sql</div>
                <div>-- Tables: profiles, businesses, services, website_analyses, ideal_customer_profiles, leads, lead_research, lead_scores, lead_service_matches, campaigns, conversations, conversation_messages, settings, usage, subscriptions, support_tickets.</div>
                <div>-- Strict RLS: auth.uid() = user_id on SELECT, INSERT, UPDATE, DELETE</div>
                <div className="mt-2 text-indigo-400">ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;</div>
                <div className="text-slate-400">CREATE POLICY "Users can manage own leads" ON public.leads FOR ALL USING (auth.uid() = user_id);</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
