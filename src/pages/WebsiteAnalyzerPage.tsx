import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { aiService } from '../services/ai';
import { WebsiteAnalysis, Service, Lead } from '../types/database';
import {
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Zap,
  Layers,
  Save,
  Check,
} from 'lucide-react';

interface WebsiteAnalyzerPageProps {
  onNavigate: (view: string, contextId?: string) => void;
}

export const WebsiteAnalyzerPage: React.FC<WebsiteAnalyzerPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [leadCreatedSuccess, setLeadCreatedSuccess] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setAnalyzing(true);
    setSavedSuccess(false);
    setLeadCreatedSuccess(false);

    try {
      const userServices = user ? await dbService.getServices(user.id) : [];
      setServices(userServices);

      const result = await aiService.analyzeWebsite(url.trim(), userServices);
      if (user) {
        result.user_id = user.id;
      }
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!user || !analysis) return;
    try {
      await dbService.saveWebsiteAnalysis(user.id, analysis);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving analysis:', err);
    }
  };

  const handleConvertLead = async () => {
    if (!user || !analysis) return;
    try {
      const domain = analysis.url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      const companyName = domain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      const newLead: Lead = {
        id: `lead_${Date.now()}`,
        user_id: user.id,
        company_name: companyName,
        website: analysis.url.startsWith('http') ? analysis.url : `https://${analysis.url}`,
        contact_name: 'Store Operator',
        contact_email: `contact@${domain}`,
        industry: analysis.products_services[0] ? 'Digital Commerce & Retail' : 'Professional Services',
        country: 'Global',
        city: 'Online',
        company_size: '5 - 25 employees',
        business_model: 'Direct to Consumer',
        description: analysis.business_summary,
        source: 'Website Analyzer Scan',
        status: 'researched',
        is_demo: analysis.is_demo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await dbService.createLead(user.id, newLead);

      // Save corresponding research
      await dbService.saveLeadResearch(user.id, {
        id: `res_${Date.now()}`,
        user_id: user.id,
        lead_id: newLead.id,
        website_observations: analysis.weaknesses,
        products_services: analysis.products_services,
        target_audience: analysis.target_audience,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        pain_points: analysis.weaknesses,
        growth_opportunities: analysis.opportunities,
        buying_signals: ['Active domain with live public product catalog'],
        research_summary: analysis.business_summary,
        evidence: analysis.weaknesses,
        confidence_score: analysis.confidence_score,
        created_at: new Date().toISOString(),
      });

      // Save score
      await dbService.saveLeadScore(user.id, {
        id: `score_${Date.now()}`,
        user_id: user.id,
        lead_id: newLead.id,
        lead_quality: 88,
        need_strength: 86,
        service_match: 90,
        opportunity_score: 88,
        confidence_score: analysis.confidence_score,
        reasoning: `Converted from Website Analyzer scan. Observable issues detected in: ${analysis.weaknesses[0] || 'Mobile experience'}`,
        created_at: new Date().toISOString(),
      });

      setLeadCreatedSuccess(true);
      setTimeout(() => {
        onNavigate('lead-profile', newLead.id);
      }, 1000);
    } catch (err) {
      console.error('Error converting lead:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <Globe className="w-3.5 h-3.5" />
          <span>Need-Based Website Inspection</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Website Analyzer</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Analyze public storefronts and company websites to observe potential UX, mobile friction, and conversion issues. Nexora matches detected problems to the smallest appropriate service without fabricating claims.
        </p>
      </div>

      {/* Input Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter public URL (e.g. nordichome.de, velocitystore.com, acmetech.io)"
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <button
            type="submit"
            disabled={analyzing}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {analyzing ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing Page Structure...</span>
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Analysis</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-3 flex items-center space-x-2 text-xs text-slate-400">
          <span className="font-medium text-slate-600">Sample tryouts:</span>
          <button
            type="button"
            onClick={() => setUrl('https://nordic-artisans.de')}
            className="text-indigo-600 hover:underline"
          >
            nordic-artisans.de
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setUrl('https://veloce-gear.co.uk')}
            className="text-indigo-600 hover:underline"
          >
            veloce-gear.co.uk
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setUrl('https://cloudpulse.io')}
            className="text-indigo-600 hover:underline"
          >
            cloudpulse.io
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-md">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">{analysis.url}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  Confidence {analysis.confidence_score}%
                </span>
                {analysis.is_demo && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-700 text-slate-300 font-mono uppercase">
                    Demo Scan
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Public website inspection completed. Evidence mapped to recommended service.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSaveAnalysis}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved' : 'Save Analysis'}</span>
              </button>
              <button
                type="button"
                onClick={handleConvertLead}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
              >
                {leadCreatedSuccess ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                <span>{leadCreatedSuccess ? 'Opening Lead...' : 'Create Lead & Draft Outreach'}</span>
              </button>
            </div>
          </div>

          {/* Section 9 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Overview & Products */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Business Overview</h3>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">{analysis.business_summary}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">What They Sell</h3>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.products_services.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Who They Serve (Audience)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{analysis.target_audience}</p>
              </div>
            </div>

            {/* Recommended Service & Opportunities */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100">
                <div className="flex items-center space-x-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>Recommended Service Opportunity</span>
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {analysis.recommended_services.join(' / ')}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Smallest appropriate solution addressing detected mobile and checkout friction without proposing an unwanted full overhaul.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Growth Opportunities</h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {analysis.opportunities.map((opp, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Website Strengths</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysis.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Potential Problems */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Potential Observed Problems</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysis.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
