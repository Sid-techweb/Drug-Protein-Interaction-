import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useSearchDrugs } from '../hooks/useDrugs';
import { useCandidateQueue } from '../hooks/useCandidates';
import { usePredictionSession } from '../contexts/PredictionSessionContext';
import { DrugCard } from '../components/drug/DrugCard';
import { DrugDetailsModal } from '../components/drug/DrugDetailsModal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ScientificTooltip } from '../components/ui/ScientificTooltip';
import { EmptyStateContainer } from '../components/ui/EmptyStateContainer';
import { Drug } from '../types';
import { Search, Filter, ChevronLeft, ChevronRight, Pill, ArrowRight, LayoutGrid, List, Eye, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DrugLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeSessionDataset } = usePredictionSession();

  const [searchTerm, setSearchTerm] = useState('');
  const [lipinskiOnly, setLipinskiOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(0);
  const limit = 12;

  const [inspectedDrug, setInspectedDrug] = useState<Drug | null>(null);

  // Filter query ONLY by active dataset to prevent dataset mixing
  const { data: drugData, isLoading } = useSearchDrugs({
    search: searchTerm,
    dataset_id: activeSessionDataset?.id,
    lipinski_only: lipinskiOnly,
    limit,
    offset: page * limit,
  });

  const { data: candidateQueue } = useCandidateQueue();
  const queuedDrugIds = new Set(candidateQueue?.map((c) => c.drug_id) || []);

  const totalPages = drugData ? Math.ceil(drugData.total / limit) : 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-sky-500/20 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="emerald">ACTIVE DATASET EXPLORER</Badge>
              <span className="text-xs text-slate-500 font-mono font-medium">(Single Experiment Focus)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
              <span>Drug Library Explorer</span>
              {activeSessionDataset && (
                <span className="text-xs font-mono text-purple-600 dark:text-sky-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-lg">
                  [{activeSessionDataset.name}]
                </span>
              )}
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Inspect 2D <ScientificTooltip term="SMILES" /> structures, evaluate <ScientificTooltip term="Lipinski" /> compliance, and queue specific compounds from the active dataset.
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 font-mono">
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Dataset Molecules</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {drugData?.total || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Search, Filter & View Mode Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm font-mono text-xs">
          <div className="w-full sm:w-96">
            <Input
              placeholder="Search candidate name, ChEMBL ID, or SMILES..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              icon={<Search className="w-4 h-4 text-purple-600 dark:text-sky-400" />}
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setLipinskiOnly(!lipinskiOnly);
                setPage(0);
              }}
              className={`px-3.5 py-2 rounded-xl border font-semibold flex items-center space-x-2 transition-colors ${
                lipinskiOnly
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 font-bold'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Lipinski Only</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Compound Content View */}
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : drugData && drugData.items.length > 0 ? (
          <>
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {drugData.items.map((drug) => (
                  <DrugCard
                    key={drug.id}
                    drug={drug}
                    onInspect={(d) => setInspectedDrug(d)}
                    isQueued={queuedDrugIds.has(drug.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden font-mono text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/60">
                        <th className="py-3 px-4">Drug Name</th>
                        <th className="py-3 px-4">ChEMBL ID</th>
                        <th className="py-3 px-4">MW (g/mol)</th>
                        <th className="py-3 px-4">LogP</th>
                        <th className="py-3 px-4">HBD / HBA</th>
                        <th className="py-3 px-4">Lipinski</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      {drugData.items.map((d) => {
                        const isPass = d.logp <= 5 && d.molecular_weight <= 500 && d.hbd <= 5 && d.hba <= 10;
                        return (
                          <tr key={d.id} className="hover:bg-purple-50/50 dark:hover:bg-slate-900/80 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              {d.name && !d.name.startsWith('Compound CHEMBL') ? d.name : d.chembl_id || 'Compound'}
                            </td>
                            <td className="py-3.5 px-4 text-purple-600 dark:text-sky-400">
                              {d.chembl_id || d.id.slice(0, 8)}
                            </td>
                            <td className="py-3.5 px-4">
                              {d.molecular_weight}
                            </td>
                            <td className="py-3.5 px-4">
                              {d.logp}
                            </td>
                            <td className="py-3.5 px-4">
                              {d.hbd} / {d.hba}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant={isPass ? 'emerald' : 'amber'}>
                                {isPass ? 'Pass' : 'Review'}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                icon={<Eye className="w-3.5 h-3.5 text-purple-600 dark:text-sky-400" />}
                                onClick={() => setInspectedDrug(d)}
                              >
                                Inspect
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">
                Showing {page * limit + 1} - {Math.min((page + 1) * limit, drugData.total)} of {drugData.total} compounds
              </span>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Step 3 Direct Link */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 font-mono">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Active Dataset Ready for AI Screening!
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400">
                    Ready to evaluate your dataset? Proceed to Step 3 AI Screening to score binding affinity.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/predictions')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0"
              >
                <span>Proceed to Step 3: AI Screening</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <EmptyStateContainer
            icon={<Pill className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
            title="No active drug dataset loaded"
            description="Import a ChEMBL dataset or upload a CSV/SDF file to populate candidate molecules for your active screening experiment."
            actionText="Import Active Dataset"
            onAction={() => navigate('/datasets')}
          />
        )}

        {/* Drug Details Modal */}
        <DrugDetailsModal
          drug={inspectedDrug}
          onClose={() => setInspectedDrug(null)}
        />

      </div>
    </DashboardLayout>
  );
};
