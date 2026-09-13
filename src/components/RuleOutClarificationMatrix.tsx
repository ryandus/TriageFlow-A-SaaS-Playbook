import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
  Trash2,
  ArrowRight,
  Filter,
  Check,
  ShieldQuestion,
  RefreshCw
} from 'lucide-react';
import { InvestigatedFact, FactStatus } from '../types';

interface RuleOutClarificationMatrixProps {
  facts: InvestigatedFact[];
  onUpdateFactStatus: (id: string, newStatus: FactStatus) => void;
  onUpdateFactDetails: (id: string, details: string) => void;
  onAddCustomFact: (fact: InvestigatedFact) => void;
  onRemoveFact: (id: string) => void;
  onRefreshTriage: () => void;
  isLoading: boolean;
}

export const RuleOutClarificationMatrix: React.FC<RuleOutClarificationMatrixProps> = ({
  facts,
  onUpdateFactStatus,
  onUpdateFactDetails,
  onAddCustomFact,
  onRemoveFact,
  onRefreshTriage,
  isLoading,
}) => {
  const [newFactLabel, setNewFactLabel] = useState('');
  const [newFactCategory, setNewFactCategory] = useState<InvestigatedFact['category']>('network');
  const [editingDetailsId, setEditingDetailsId] = useState<string | null>(null);
  const [detailsBuffer, setDetailsBuffer] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const ruledOutCount = facts.filter((f) => f.status === 'ruled_out').length;
  const confirmedCount = facts.filter((f) => f.status === 'confirmed_issue').length;
  const untestedCount = facts.filter((f) => f.status === 'untested').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactLabel.trim()) return;

    const newFact: InvestigatedFact = {
      id: `custom-fact-${Date.now()}`,
      label: newFactLabel.trim(),
      status: 'untested',
      category: newFactCategory,
      details: 'Added during active operational investigation.',
    };

    onAddCustomFact(newFact);
    setNewFactLabel('');
  };

  const filteredFacts = facts.filter((f) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'ruled_out') return f.status === 'ruled_out';
    if (filterCategory === 'confirmed') return f.status === 'confirmed_issue';
    if (filterCategory === 'untested') return f.status === 'untested';
    return f.category === filterCategory;
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/30 hover:bg-slate-900/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-inner shadow-slate-900/50 backdrop-blur-sm transition-all duration-200 space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
            <ShieldQuestion className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Root-Cause Elimination
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Investigation Clarification & Rule-Out Matrix
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold border border-slate-700">
                {facts.length} Hypotheses
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Systematically rule out or confirm operational facts as investigation unfolds.
            </p>
          </div>
        </div>

        {/* Fact Counters with active badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap self-start sm:self-center">
          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'ruled_out' ? 'all' : 'ruled_out')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              filterCategory === 'ruled_out'
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 ring-2 ring-emerald-500/20 shadow-sm font-bold'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/15 font-medium'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">{ruledOutCount}</span> Ruled Out
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'confirmed' ? 'all' : 'confirmed')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              filterCategory === 'confirmed'
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-200 ring-2 ring-rose-500/20 shadow-sm font-bold'
                : 'bg-rose-500/10 border-rose-500/25 text-rose-300 hover:bg-rose-500/15 font-medium'
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span className="font-bold">{confirmedCount}</span> Confirmed Defect
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'untested' ? 'all' : 'untested')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              filterCategory === 'untested'
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 ring-2 ring-amber-500/20 shadow-sm font-bold'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/15 font-medium'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="font-bold">{untestedCount}</span> Untested
          </button>
        </div>
      </div>

      {/* Explanatory Rule-Out Callout */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 text-xs text-slate-300 flex items-start gap-3.5 shadow-inner">
        <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-100">Operational Triage Tip: </span>
          When investigating reports, e.g.{' '}
          <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono border border-slate-800">
            client logs show no upload bottlenecks
          </code>
          , marking this <span className="text-emerald-400 font-semibold">RULED OUT</span>{' '}
          immediately isolates the root cause from the client network domain and shifts focus downstream
          to Layer 2/3 Storage Ingestion Service pre-signed token expiration or Layer 4 Downstream Partner API MTLS timeout.
        </div>
      </div>

      {/* Fact Items List */}
      <div className="space-y-2.5">
        {facts.length === 0 ? (
          <div className="text-center py-8 px-5 text-xs border border-dashed border-slate-800/80 rounded-2xl bg-slate-950/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              <ShieldQuestion className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm text-slate-200">No Active Hypotheses in Matrix</div>
              <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                Add real-time investigative observations below, or select any incident preset above to load pre-configured root-cause hypotheses.
              </p>
            </div>
          </div>
        ) : filteredFacts.length === 0 ? (
          <div className="text-center py-8 px-5 text-xs text-slate-400 border border-dashed border-slate-800/80 rounded-2xl bg-slate-950/40 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <p className="text-slate-300 font-medium">No investigation facts match this filter status.</p>
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className="text-blue-400 hover:text-blue-300 text-xs underline font-medium cursor-pointer"
            >
              Reset view to show all hypotheses ({facts.length})
            </button>
          </div>
        ) : (
          filteredFacts.map((fact) => {
            const isEditing = editingDetailsId === fact.id;

            return (
              <div
                key={fact.id}
                className={`p-3 rounded-lg border transition-all ${
                  fact.status === 'ruled_out'
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                    : fact.status === 'confirmed_issue'
                    ? 'bg-rose-950/20 border-rose-800/40 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300 shadow-inner shadow-slate-950/50 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Fact Label & Category */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold ${
                          fact.status === 'ruled_out'
                            ? 'line-through text-slate-400 decoration-emerald-500/80 decoration-2'
                            : fact.status === 'confirmed_issue'
                            ? 'text-rose-200 font-bold'
                            : 'text-slate-200'
                        }`}
                      >
                        {fact.label}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                        {fact.category}
                      </span>
                    </div>

                    {/* Details or evidence notes */}
                    {isEditing ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={detailsBuffer}
                          onChange={(e) => setDetailsBuffer(e.target.value)}
                          placeholder="Evidence notes (e.g., Datadog trace confirmed 200 OK)..."
                          className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 flex-1 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateFactDetails(fact.id, detailsBuffer);
                            setEditingDetailsId(null);
                          }}
                          className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDetailsId(null)}
                          className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingDetailsId(fact.id);
                          setDetailsBuffer(fact.details || '');
                        }}
                        className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-300 flex items-center gap-1 group"
                        title="Click to edit investigation notes"
                      >
                        <span>Evidence: {fact.details || 'Click to add investigative observation...'}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      id={`fact-btn-ruledout-${fact.id}`}
                      type="button"
                      onClick={() => onUpdateFactStatus(fact.id, 'ruled_out')}
                      className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 border transition-all ${
                        fact.status === 'ruled_out'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-slate-900 hover:bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                      }`}
                      title="Rule out as non-contributor"
                    >
                      <Check className="w-3 h-3" />
                      <span>Ruled Out</span>
                    </button>

                    <button
                      id={`fact-btn-confirmed-${fact.id}`}
                      type="button"
                      onClick={() => onUpdateFactStatus(fact.id, 'confirmed_issue')}
                      className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 border transition-all ${
                        fact.status === 'confirmed_issue'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                          : 'bg-slate-900 hover:bg-rose-950/40 text-rose-400 border-rose-900/50'
                      }`}
                      title="Mark as confirmed failure cause"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Defect</span>
                    </button>

                    <button
                      id={`fact-btn-untested-${fact.id}`}
                      type="button"
                      onClick={() => onUpdateFactStatus(fact.id, 'untested')}
                      className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 border transition-all ${
                        fact.status === 'untested'
                          ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="Mark as pending investigation"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Pending</span>
                    </button>

                    <button
                      id={`fact-btn-remove-${fact.id}`}
                      type="button"
                      onClick={() => onRemoveFact(fact.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Remove hypothesis from active incident"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Fact Form & Re-Synthesize CTA */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <input
            id="new-investigated-fact-input"
            type="text"
            value={newFactLabel}
            onChange={(e) => setNewFactLabel(e.target.value)}
            placeholder='Add custom observation (e.g., "Customer confirmed their SSL cert renewed")...'
            className="flex-1 text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <select
            id="new-investigated-fact-cat"
            value={newFactCategory}
            onChange={(e) => setNewFactCategory(e.target.value as any)}
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="network">Network</option>
            <option value="credentials">Credentials</option>
            <option value="payload">Payload</option>
            <option value="upstream">Upstream</option>
            <option value="queue">Queue</option>
          </select>
          <button
            id="add-custom-fact-btn"
            type="submit"
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg shrink-0 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        <button
          id="refresh-triage-with-facts-btn"
          type="button"
          onClick={onRefreshTriage}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-lg shrink-0 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Update Triage With Facts</span>
        </button>
      </div>
    </div>
  );
};
