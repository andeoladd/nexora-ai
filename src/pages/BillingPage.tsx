import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Subscription, Usage } from '../types/database';
import {
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';

export const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'scale'>('growth');
  const [upgradedSuccess, setUpgradedSuccess] = useState(false);

  useEffect(() => {
    async function loadBilling() {
      if (!user) return;
      const sub = await dbService.getSubscription(user.id);
      const use = await dbService.getUsage(user.id);
      if (sub) {
        setSubscription(sub);
        setSelectedPlan(sub.plan);
      }
      setUsage(use);
    }
    loadBilling();
  }, [user]);

  const handleSelectPlan = async (plan: 'starter' | 'growth' | 'scale') => {
    if (!user) return;
    setSelectedPlan(plan);
    const updated: Subscription = {
      id: subscription?.id || `sub_${user.id}`,
      user_id: user.id,
      plan,
      status: 'active',
      renewal_date: new Date(Date.now() + 30 * 86400000).toISOString(),
      created_at: subscription?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await dbService.updateSubscription(user.id, updated);
    setSubscription(updated);
    setUpgradedSuccess(true);
    setTimeout(() => setUpgradedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Subscription & Prototype Pricing</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Billing & Plans</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Manage your Nexora tier and track AI lead research credits. (Prototype plans shown; prepared for direct Stripe checkout integration).
        </p>
      </div>

      {upgradedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Plan successfully updated to {selectedPlan.toUpperCase()}! Your credit balance has been refreshed.</span>
        </div>
      )}

      {/* Current Subscription Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Plan</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-0.5 capitalize">
            {subscription?.plan || 'Growth'} Plan
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Status: <span className="font-semibold text-emerald-600">Active</span> • Renewal Date:{' '}
            <span className="font-semibold text-slate-700">
              {subscription?.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : 'Next Month'}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <div className="text-xs font-bold text-slate-800">42 / 100</div>
            <div className="text-[10px] text-slate-500">Lead Research Credits Used</div>
          </div>
          <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '42%' }} />
          </div>
        </div>
      </div>

      {/* Plan Tiers Grid (Section 29) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Starter Plan */}
        <div
          className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all ${
            selectedPlan === 'starter'
              ? 'border-indigo-600 ring-2 ring-indigo-600/10'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Starter</h3>
              <p className="text-xs text-slate-500 mt-1">For solo specialists & freelancers</p>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              $19 <span className="text-xs font-normal text-slate-500">/ month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>30 AI Lead Researches / month</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Website Analyzer access</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contextual conversation memory</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Email support</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => handleSelectPlan('starter')}
            className={`w-full mt-6 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedPlan === 'starter'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {selectedPlan === 'starter' ? 'Current Plan' : 'Select Starter'}
          </button>
        </div>

        {/* Growth Plan (Popular) */}
        <div
          className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all relative ${
            selectedPlan === 'growth'
              ? 'border-indigo-600 ring-2 ring-indigo-600/20'
              : 'border-indigo-200 hover:border-indigo-300'
          }`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
            Most Popular
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Growth</h3>
              <p className="text-xs text-slate-500 mt-1">For growing agencies & consultancies</p>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              $49 <span className="text-xs font-normal text-slate-500">/ month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>150 AI Lead Researches / month</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Unlimited Website Analyzer scans</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Multi-channel outreach drafts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Full conversation context memory</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Priority email support</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => handleSelectPlan('growth')}
            className={`w-full mt-6 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedPlan === 'growth'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            {selectedPlan === 'growth' ? 'Current Plan' : 'Select Growth'}
          </button>
        </div>

        {/* Scale Plan */}
        <div
          className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all ${
            selectedPlan === 'scale'
              ? 'border-indigo-600 ring-2 ring-indigo-600/10'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Scale</h3>
              <p className="text-xs text-slate-500 mt-1">For high-volume business development</p>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              $99 <span className="text-xs font-normal text-slate-500">/ month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>500 AI Lead Researches / month</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Automated campaign personalization</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Custom ICP model fine-tuning</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dedicated account manager support</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => handleSelectPlan('scale')}
            className={`w-full mt-6 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedPlan === 'scale'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {selectedPlan === 'scale' ? 'Current Plan' : 'Select Scale'}
          </button>
        </div>
      </div>

      {/* Prototype Pricing Disclaimer (Section 29) */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start space-x-2.5">
        <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <span>
          <strong>Prototype Pricing Notice:</strong> Payments are not charged during this preview phase. Future releases will connect with Stripe customer portals for live subscriptions and invoicing.
        </span>
      </div>
    </div>
  );
};
