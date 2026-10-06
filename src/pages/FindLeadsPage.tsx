import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { aiService } from '../services/ai';
import { Lead } from '../types/database';
import {
  Search,
  Sparkles,
  Filter,
  ArrowRight,
  Building,
  CheckCircle2,
  ExternalLink,
  Layers,
  MapPin,
  Plus,
} from 'lucide-react';

interface FindLeadsPageProps {
  onNavigate: (view: string, contextId?: string) => void;
}

// Curated prototype directory of discoverable candidates across industries
const DISCOVERY_CANDIDATES: Array<Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = [
  {
    company_name: 'Bavarian Roast Co.',
    website: 'https://bavarianroast.de',
    contact_name: 'Lukas Weber',
    contact_email: 'lukas@bavarianroast.de',
    industry: 'Ecommerce & Specialty Coffee',
    country: 'Germany',
    city: 'Munich',
    company_size: '10 - 20 employees',
    business_model: 'Direct to Consumer',
    description: 'Specialty coffee roastery selling subscription beans across Central Europe with heavy mobile traffic.',
    source: 'Nexora Directory',
    status: 'discovered',
    is_demo: true,
  },
  {
    company_name: 'Alpine Optics AG',
    website: 'https://alpineoptics.ch',
    contact_name: 'Elena Rossi',
    contact_email: 'elena@alpineoptics.ch',
    industry: 'Ecommerce & Eyewear',
    country: 'Switzerland',
    city: 'Zurich',
    company_size: '15 - 35 employees',
    business_model: 'Direct to Consumer',
    description: 'Handcrafted titanium glasses and sunglasses; mobile cart abandonment rate elevated due to multi-step lens configurator.',
    source: 'Nexora Directory',
    status: 'discovered',
    is_demo: true,
  },
  {
    company_name: 'Peak Pulse Athletics',
    website: 'https://peakpulsegear.co.uk',
    contact_name: 'Marcus Bell',
    contact_email: 'marcus@peakpulsegear.co.uk',
    industry: 'Sportswear & Apparel',
    country: 'United Kingdom',
    city: 'London',
    company_size: '20 - 50 employees',
    business_model: 'B2C Ecommerce',
    description: 'High-performance running apparel running active Instagram paid traffic to mobile product pages.',
    source: 'Nexora Directory',
    status: 'discovered',
    is_demo: true,
  },
  {
    company_name: 'Kobenhavn Design Studio',
    website: 'https://kobenhavn-lighting.dk',
    contact_name: 'Frederik Holm',
    contact_email: 'frederik@kobenhavn-lighting.dk',
    industry: 'Ecommerce & Home Living',
    country: 'Denmark',
    city: 'Copenhagen',
    company_size: '8 - 18 employees',
    business_model: 'Direct to Consumer',
    description: 'Minimalist Scandinavian architectural lighting. High bounce rate on mobile collection pages.',
    source: 'Nexora Directory',
    status: 'discovered',
    is_demo: true,
  },
  {
    company_name: 'DataStack Cloud Tools',
    website: 'https://datastackhq.io',
    contact_name: 'Nadia Laurent',
    contact_email: 'nadia@datastackhq.io',
    industry: 'B2B Software & SaaS',
    country: 'France',
    city: 'Paris',
    company_size: '15 - 40 employees',
    business_model: 'SaaS',
    description: 'Postgres analytics engine for backend engineers. Landing page value proposition is dense and technical.',
    source: 'Nexora Directory',
    status: 'discovered',
    is_demo: true,
  },
  {
    company_name: 'PureBotanics Apothecary',
    website: 'https://purebotanics.com',
    contact_name: 'Chloe Simmons',
    contact_email: 'chloe@purebotanics.com',
    industry: 'Ecommerce & Organic Cosmetics',
    country: 'United States',
    city: 'Austin',
    company_size: '12 - 30 employees',
    business_model: 'Direct to Consumer',
    description: 'Organic skincare line. Storefront lacks sticky checkout actions on mobile screens.',
    source: 'Nexora Directory',
    status: 'discovered',
    is_demo: true,
  },
];

export const FindLeadsPage: React.FC<FindLeadsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedNeed, setSelectedNeed] = useState<string>('all');
  const [addingId, setAddingId] = useState<string | null>(null);

  // Natural language query interpretation
  const filteredCandidates = DISCOVERY_CANDIDATES.filter((candidate) => {
    const q = query.toLowerCase().trim();
    const matchesSearch =
      !q ||
      candidate.company_name.toLowerCase().includes(q) ||
      candidate.description.toLowerCase().includes(q) ||
      candidate.industry.toLowerCase().includes(q) ||
      candidate.country.toLowerCase().includes(q) ||
      candidate.business_model.toLowerCase().includes(q);

    const matchesCountry = selectedCountry === 'all' || candidate.country === selectedCountry;
    const matchesIndustry = selectedIndustry === 'all' || candidate.industry.includes(selectedIndustry);

    return matchesSearch && matchesCountry && matchesIndustry;
  });

  const handleResearchAndAdd = async (candidate: (typeof DISCOVERY_CANDIDATES)[0], idx: number) => {
    if (!user) return;
    setAddingId(`cand_${idx}`);
    try {
      const newLead: Lead = {
        id: `lead_${Date.now()}_${idx}`,
        user_id: user.id,
        ...candidate,
        status: 'researched',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await dbService.createLead(user.id, newLead);

      const userServices = await dbService.getServices(user.id);
      const { research, score, matches } = await aiService.researchLead(newLead, userServices);

      await dbService.saveLeadResearch(user.id, research);
      await dbService.saveLeadScore(user.id, score);
      if (matches[0]) {
        await dbService.saveLeadServiceMatch(user.id, matches[0]);
      }

      onNavigate('lead-profile', newLead.id);
    } catch (err) {
      console.error('Error adding lead:', err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Natural-Language Opportunity Discovery</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Find Leads</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Search candidates using natural conversational prompts or structured filters. Every candidate is evaluated based on observable public evidence before matching services.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Natural Language Prompt Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try: "Shopify stores in Germany that may need website optimization" or "apparel brands in UK"'
            className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
          />
        </div>

        {/* Query Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick prompts:</span>
          <button
            type="button"
            onClick={() => setQuery('Shopify stores in Germany that may need website optimization')}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium cursor-pointer"
          >
            "Shopify stores in Germany that may need website optimization"
          </button>
          <button
            type="button"
            onClick={() => setQuery('Small ecommerce businesses in the UK with potential conversion problems')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium cursor-pointer"
          >
            "Small ecommerce businesses in the UK"
          </button>
          <button
            type="button"
            onClick={() => setQuery('SaaS companies that may need landing page redesign')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium cursor-pointer"
          >
            "SaaS companies that may need landing page redesign"
          </button>
        </div>

        {/* Structured Filters */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by:</span>
          </div>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Countries</option>
            <option value="Germany">Germany</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Switzerland">Switzerland</option>
            <option value="Denmark">Denmark</option>
            <option value="France">France</option>
            <option value="United States">United States</option>
          </select>

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Industries</option>
            <option value="Ecommerce">Ecommerce & Consumer</option>
            <option value="Sportswear">Sportswear & Apparel</option>
            <option value="Home Living">Home Living</option>
            <option value="Software">B2B SaaS</option>
          </select>

          <span className="ml-auto text-xs text-slate-400 font-medium">
            Showing {filteredCandidates.length} discoverable opportunities
          </span>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-3">
        {filteredCandidates.map((candidate, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2.5">
                <h3 className="text-base font-bold text-slate-900">{candidate.company_name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                  {candidate.industry}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-mono">
                  {candidate.country}
                </span>
                {candidate.is_demo && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-600 font-mono uppercase tracking-wider">
                    Demo Data
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{candidate.description}</p>

              <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate.city}, {candidate.country}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate.company_size}</span>
                </span>
                <span className="text-indigo-600 font-medium">{candidate.website}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
              <button
                type="button"
                disabled={addingId === `cand_${idx}`}
                onClick={() => handleResearchAndAdd(candidate, idx)}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {addingId === `cand_${idx}` ? (
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Researching Lead...</span>
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Research & Add Opportunity</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
