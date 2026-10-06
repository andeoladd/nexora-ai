import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { LeadList, Lead } from '../types/database';
import { ListFilter, Plus, Folder, Users, ArrowRight } from 'lucide-react';

interface LeadListsPageProps {
  onNavigate: (view: string, contextId?: string) => void;
}

export const LeadListsPage: React.FC<LeadListsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [lists, setLists] = useState<LeadList[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function loadLists() {
      if (!user) return;
      const [l, userLeads] = await Promise.all([
        dbService.getLeadLists(user.id),
        dbService.getLeads(user.id),
      ]);
      setLists(l);
      setLeads(userLeads);
    }
    loadLists();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    const newList: LeadList = {
      id: `list_${Date.now()}`,
      user_id: user.id,
      name: name.trim(),
      description: description.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await dbService.createLeadList(user.id, newList);
    setLists([newList, ...lists]);
    setName('');
    setDescription('');
    setShowCreate(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <ListFilter className="w-3.5 h-3.5" />
            <span>Audience Segmentation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lead Lists</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Segment prospects by geography, platform, or observed friction to launch targeted outreach campaigns.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead List</span>
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Create New List</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="List name (e.g., DACH Shopify Stores)"
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Save List
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Default Master List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">All Researched Leads</h3>
              <span className="text-xs text-slate-400">{leads.length} leads total</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">Comprehensive workspace directory of all discovered accounts.</p>
          <button
            type="button"
            onClick={() => onNavigate('leads')}
            className="w-full mt-2 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1"
          >
            <span>View Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {lists.map((l) => (
          <div key={l.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{l.name}</h3>
                <span className="text-xs text-slate-400">Custom Segment</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">{l.description || 'Targeted account cluster.'}</p>
            <button
              type="button"
              onClick={() => onNavigate('leads')}
              className="w-full mt-2 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1"
            >
              <span>Explore Segment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
