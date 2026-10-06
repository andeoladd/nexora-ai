import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Lead, LeadStatus } from '../types/database';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Building,
  MapPin,
  Sparkles,
  Plus,
} from 'lucide-react';

interface LeadsPageProps {
  onNavigate: (view: string, contextId?: string) => void;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      if (!user) return;
      try {
        setLoading(true);
        const l = await dbService.getLeads(user.id);
        setLeads(l);
      } catch (err) {
        console.error('Error loading leads:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, [user]);

  const filtered = leads.filter((lead) => {
    const q = query.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lead.company_name.toLowerCase().includes(q) ||
      lead.industry.toLowerCase().includes(q) ||
      lead.country.toLowerCase().includes(q) ||
      lead.contact_name.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Target Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Leads</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage your researched accounts and opportunities. Every lead contains specific observations and recommended service matches.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('find-leads')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Find & Research More Leads</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, contact, or country..."
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Stages</option>
            <option value="discovered">Discovered</option>
            <option value="researched">Researched</option>
            <option value="contacted">Contacted</option>
            <option value="replied">Replied</option>
            <option value="qualified">Qualified</option>
            <option value="won">Won</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading leads...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No leads match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Discover new prospects using the natural-language search engine.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('find-leads')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Discover Opportunities
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-base font-bold text-slate-900">{lead.company_name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                    {lead.industry}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                    {lead.status}
                  </span>
                  {lead.is_demo && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-600 font-mono uppercase tracking-wider">
                      Demo Data
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-1">{lead.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.city}, {lead.country}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.company_size} • {lead.business_model}</span>
                  </span>
                  <span>Contact: <span className="font-medium text-slate-700">{lead.contact_name}</span></span>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('lead-profile', lead.id)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View Research & Outreach</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
