import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Service, IdealCustomerProfile, Business } from '../types/database';
import { Sparkles, ArrowRight, ArrowLeft, Check, Plus, Trash2, Building, Target, Layers } from 'lucide-react';

interface OnboardingPageProps {
  onComplete: () => void;
}

const PRESET_SERVICES = [
  { name: 'Ecommerce Optimization', desc: 'Optimize mobile checkout flow, catalog navigation, and cart conversions.' },
  { name: 'Website Optimization', desc: 'Improve website speed, responsiveness, and performance metrics.' },
  { name: 'Website Redesign', desc: 'Modernize outdated UI/UX into a high-converting digital storefront.' },
  { name: 'Conversion Rate Optimization (CRO)', desc: 'A/B testing, hero value props, and checkout friction elimination.' },
  { name: 'Website Audit', desc: 'Detailed 30-point evaluation identifying structural and UX issues.' },
  { name: 'Landing Page Design', desc: 'High-converting custom landing pages built for marketing campaigns.' },
  { name: 'SEO & Organic Growth', desc: 'On-page technical SEO, structured data, and search rankings.' },
  { name: 'UX Improvement', desc: 'Refining usability, customer journeys, and accessibility.' },
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Business Profile
  const [businessName, setBusinessName] = useState(`${user?.display_name || 'My'}'s Agency`);
  const [businessWebsite, setBusinessWebsite] = useState('https://myagency.com');
  const [businessIndustry, setBusinessIndustry] = useState('Digital Agency & Web Optimization');
  const [businessLocation, setBusinessLocation] = useState('Remote / Global');
  const [businessDescription, setBusinessDescription] = useState(
    'We help high-potential businesses and ecommerce stores identify conversion friction and scale revenue through modern web optimization.'
  );

  // Step 2: Services
  const [services, setServices] = useState<Array<{ name: string; description: string; price: string }>>([
    { name: 'Ecommerce Optimization', description: 'Streamline mobile purchase funnels and checkout friction.', price: '$2,500' },
    { name: 'Conversion Rate Optimization (CRO)', description: 'Reduce drop-off on high-traffic landing pages.', price: '$1,800/mo' },
    { name: 'Website Redesign', description: 'Comprehensive visual and UX upgrade for aging sites.', price: '$4,200' },
  ]);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServiceDesc, setCustomServiceDesc] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('$1,500');

  // Step 3: Ideal Customer Profile (ICP)
  const [icpIndustry, setIcpIndustry] = useState('Ecommerce, Retail & Consumer Brands');
  const [icpLocation, setIcpLocation] = useState('United Kingdom, Germany, United States');
  const [icpCompanySize, setIcpCompanySize] = useState('5 - 50 employees');
  const [icpBuyerRole, setIcpBuyerRole] = useState('Founder, Head of Ecommerce, Marketing Director');
  const [icpBusinessModel, setIcpBusinessModel] = useState('B2C Ecommerce / D2C');
  const [icpBudget, setIcpBudget] = useState('$2,000 - $10,000');
  const [icpProblems, setIcpProblems] = useState([
    'High bounce rate on smartphone catalog pages',
    'Unclear mobile calls to action leading to cart abandonment',
    'Outdated visual layout hurting brand trust against competitors',
  ]);
  const [newProblem, setNewProblem] = useState('');

  const handleAddService = (name: string, desc: string, price: string = '$2,000') => {
    if (!services.some((s) => s.name === name)) {
      setServices([...services, { name, description: desc, price }]);
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleAddProblem = () => {
    if (newProblem.trim()) {
      setIcpProblems([...icpProblems, newProblem.trim()]);
      setNewProblem('');
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Save Business
      const business: Business = {
        id: `biz_${user.id}`,
        user_id: user.id,
        business_name: businessName,
        website: businessWebsite,
        description: businessDescription,
        industry: businessIndustry,
        target_market: icpLocation,
        location: businessLocation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await dbService.upsertBusiness(user.id, business);

      // 2. Save Services
      for (let i = 0; i < services.length; i++) {
        const s = services[i];
        const newService: Service = {
          id: `srv_${user.id}_${Date.now()}_${i}`,
          user_id: user.id,
          name: s.name,
          description: s.description,
          price: s.price,
          target_customer: `${icpBuyerRole} in ${icpIndustry}`,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await dbService.addService(user.id, newService);
      }

      // 3. Save ICP
      const icp: IdealCustomerProfile = {
        id: `icp_${user.id}`,
        user_id: user.id,
        business_id: business.id,
        industry: icpIndustry,
        company_size: icpCompanySize,
        location: icpLocation,
        buyer_role: icpBuyerRole,
        budget: icpBudget,
        pain_points: icpProblems,
        buying_signals: [
          'Active advertising campaigns on Instagram or Google',
          'Recently added new seasonal product line',
          'Hiring for marketing or digital roles',
        ],
        interests: ['Store optimization', 'Shopify Plus', 'Conversion rate lift'],
        target_markets: [icpIndustry, icpBusinessModel],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await dbService.upsertICP(user.id, icp);

      onComplete();
    } catch (err) {
      console.error('Error saving onboarding data:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Progress Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nexora Workspace Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {step === 1 && 'Tell us about your business'}
            {step === 2 && 'What services do you provide?'}
            {step === 3 && 'Who do you want to reach?'}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {step === 1 && 'Nexora uses your profile to intelligently match your expertise to lead opportunities.'}
            {step === 2 && 'Select the services you offer. Nexora will match leads to the most appropriate solution.'}
            {step === 3 && 'Define your Ideal Customer Profile (ICP) for precision lead discovery.'}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            <div className={`h-2 rounded-full transition-all ${step === 1 ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'}`} />
            <div className={`h-2 rounded-full transition-all ${step === 2 ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'}`} />
            <div className={`h-2 rounded-full transition-all ${step === 3 ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'}`} />
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Business or Agency Name *</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="E.g., North Star Studio"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL *</label>
                  <input
                    type="text"
                    required
                    value={businessWebsite}
                    onChange={(e) => setBusinessWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Industry</label>
                  <input
                    type="text"
                    value={businessIndustry}
                    onChange={(e) => setBusinessIndustry(e.target.value)}
                    placeholder="Web Optimization & CRO"
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Operating Regions</label>
                <input
                  type="text"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  placeholder="Remote / North America & Europe"
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description of What You Do</label>
                <textarea
                  rows={3}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Describe your capabilities and typical deliverables..."
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  <span>Continue to Services</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Popular Suggested Services (Click to Add):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_SERVICES.map((preset) => {
                    const isAdded = services.some((s) => s.name === preset.name);
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleAddService(preset.name, preset.desc)}
                        disabled={isAdded}
                        className={`p-3 text-left rounded-xl border text-xs transition-all ${
                          isAdded
                            ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
                            : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold mb-1">
                          <span>{preset.name}</span>
                          {isAdded && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{preset.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Configured Services List */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Your Configured Services ({services.length})</h4>
                <div className="space-y-2">
                  {services.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs"
                    >
                      <div className="space-y-0.5 max-w-[80%]">
                        <div className="font-semibold text-white flex items-center space-x-2">
                          <span>{s.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300 font-mono">
                            {s.price}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] truncate">{s.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Service Form */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-400 mb-2">Or Add Custom Service:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={customServiceName}
                    onChange={(e) => setCustomServiceName(e.target.value)}
                    placeholder="Service name"
                    className="px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    value={customServiceDesc}
                    onChange={(e) => setCustomServiceDesc(e.target.value)}
                    placeholder="Short description"
                    className="px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customServicePrice}
                      onChange={(e) => setCustomServicePrice(e.target.value)}
                      placeholder="e.g. $1,500"
                      className="w-24 px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customServiceName.trim()) {
                          handleAddService(customServiceName.trim(), customServiceDesc.trim() || 'Custom client offering.', customServicePrice);
                          setCustomServiceName('');
                          setCustomServiceDesc('');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium inline-flex items-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={services.length === 0}
                  onClick={() => setStep(3)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <span>Continue to Target Audience</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Industry *</label>
                  <input
                    type="text"
                    value={icpIndustry}
                    onChange={(e) => setIcpIndustry(e.target.value)}
                    placeholder="Ecommerce & DTC Brands"
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Size</label>
                  <input
                    type="text"
                    value={icpCompanySize}
                    onChange={(e) => setIcpCompanySize(e.target.value)}
                    placeholder="10 - 50 employees"
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Geographic Markets</label>
                  <input
                    type="text"
                    value={icpLocation}
                    onChange={(e) => setIcpLocation(e.target.value)}
                    placeholder="Germany, UK, North America"
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Buyer Role</label>
                  <input
                    type="text"
                    value={icpBuyerRole}
                    onChange={(e) => setIcpBuyerRole(e.target.value)}
                    placeholder="Founder, Head of Ecommerce, CMO"
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Typical Observed Friction / Pain Points</label>
                <div className="space-y-1.5 mb-2">
                  {icpProblems.map((prob, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                      <span>• {prob}</span>
                      <button
                        type="button"
                        onClick={() => setIcpProblems(icpProblems.filter((_, idx) => idx !== i))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newProblem}
                    onChange={(e) => setNewProblem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProblem())}
                    placeholder="Add observed problem (e.g., Mobile navigation friction)..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddProblem}
                    className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium cursor-pointer"
                  >
                    Add Problem
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleFinish}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  {saving ? (
                    <span>Setting up workspace...</span>
                  ) : (
                    <>
                      <span>Complete Setup & Launch Nexora</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
