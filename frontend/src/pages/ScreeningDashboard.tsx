import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ProteinInputPanel } from '../components/dashboard/ProteinInputPanel';
import { ProteinAnalysisCard } from '../components/dashboard/ProteinAnalysisCard';
import { EmbeddingProgressCard } from '../components/dashboard/EmbeddingProgressCard';
import { useCandidateQueue, useClearCandidateQueue } from '../hooks/useCandidates';
import { usePredictionSession } from '../contexts/PredictionSessionContext';
import { Protein } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyStateContainer } from '../components/ui/EmptyStateContainer';
import { ScientificTooltip } from '../components/ui/ScientificTooltip';
import { Dna, CheckCircle2, List, ArrowRight, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

export const ScreeningDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeSessionProtein,
    sessionWorkspaceProteins,
    setActiveSessionProtein,
    addProteinToSessionWorkspace,
    clearSessionWorkspace,
  } = usePredictionSession();

  const { data: queue } = useCandidateQueue();
  const clearQueueMutation = useClearCandidateQueue();
  const { showToast } = useToast();

  const [pendingProtein, setPendingProtein] = useState<Protein | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const activeProtein = activeSessionProtein || (sessionWorkspaceProteins.length > 0 ? sessionWorkspaceProteins[0] : null);

  const handleSelectProtein = (target: Protein) => {
    if (activeProtein && activeProtein.id !== target.id && queue && queue.length > 0) {
      setPendingProtein(target);
      setIsConfirmModalOpen(true);
    } else {
      setActiveSessionProtein(target);
    }
  };

  const handleConfirmChange = async () => {
    try {
      await clearQueueMutation.mutateAsync();
      if (pendingProtein) {
        setActiveSessionProtein(pendingProtein);
        setPendingProtein(null);
      }
      setIsConfirmModalOpen(false);
      showToast('Prediction session reset. Candidate queue cleared for new target protein.', 'info');
    } catch (err) {
      showToast('Failed to clear prediction queue.', 'error');
    }
  };

  const handleClearWorkspaceClick = async () => {
    try {
      await clearQueueMutation.mutateAsync();
    } catch {}
    clearSessionWorkspace();
    showToast('Active workspace cleared. Start a new experiment by searching a UniProt ID.', 'info');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Streamlined Header Summary Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-sky-500/20 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan">STEP 1 TARGET SELECTION</Badge>
              <span className="text-xs text-slate-500 font-mono font-medium">(Active Experiment Workspace)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Select Disease Target Protein
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Query UniProt by accession ID (e.g., <ScientificTooltip term="P00533" />), upload FASTA files, or paste sequences.
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {activeProtein && (
              <Button
                variant="glow"
                size="sm"
                icon={<ArrowRight className="w-4 h-4 text-white" />}
                onClick={() => navigate('/datasets')}
              >
                Proceed to Step 2: Drug Library
              </Button>
            )}
          </div>
        </div>

        {/* 1. Protein Input Panel */}
        <ProteinInputPanel
          onProteinCreated={(protein) => {
            addProteinToSessionWorkspace(protein);
            showToast(`Target protein '${protein.name}' loaded for active experiment session.`, 'success');
          }}
        />

        {/* Saved Protein Targets Workspace (Session Only) */}
        {sessionWorkspaceProteins && sessionWorkspaceProteins.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2 font-mono">
                <List className="w-4 h-4 text-purple-600 dark:text-sky-400" />
                <span>Active Session Target Workspace</span>
              </h4>

              <button
                onClick={handleClearWorkspaceClick}
                className="flex items-center space-x-1.5 px-3 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-mono font-semibold transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Workspace</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sessionWorkspaceProteins.map((p) => {
                const isSelected = activeProtein?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProtein(p)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-sky-500/10 border-purple-400 dark:border-sky-500/50 shadow-md ring-1 ring-purple-400 dark:ring-sky-500/50'
                        : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-sky-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {p.accession_id || 'Pasted'} | {p.length} AA | {p.organism}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Protein Analysis & Embedding Engine */}
        {activeProtein ? (
          <div className="space-y-6">
            <ProteinAnalysisCard protein={activeProtein} />
            <EmbeddingProgressCard proteinId={activeProtein.id} proteinName={activeProtein.name} />

            {/* Step Complete Banner & Immediate Next Action Button */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Step 1 Complete: Target Protein Verified
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400 font-mono">
                    Target '{activeProtein.name}' is ready. Proceed to Step 2 to import candidate drug molecules.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/datasets')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 font-mono"
              >
                <span>Proceed to Step 2: Import Drug Library</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <EmptyStateContainer
            icon={<Dna className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
            title="No target protein loaded"
            description="Search a UniProt accession ID (e.g., P00533 for EGFR) or paste an amino acid sequence above to begin your screening experiment."
            actionText="Search UniProt Target (e.g., EGFR P00533)"
            onAction={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Target Change Modal */}
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setPendingProtein(null);
          }}
          title="Change Target Protein?"
          subtitle="Confirm Prediction Session Reset"
        >
          <div className="space-y-5 font-mono text-xs">
            <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Changing the target protein will reset the current active queue.</p>
                <p className="text-slate-600 dark:text-slate-400">Previous prediction results are saved in experiment history.</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setPendingProtein(null);
                }}
              >
                Cancel
              </Button>

              <Button
                variant="glow"
                size="sm"
                disabled={clearQueueMutation.isPending}
                onClick={handleConfirmChange}
              >
                {clearQueueMutation.isPending ? 'Clearing...' : 'Continue'}
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
};
