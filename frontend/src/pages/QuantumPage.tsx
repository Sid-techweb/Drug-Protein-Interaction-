import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useQuantumJobDetails, useQuantumComparison, useOptimizeCandidates } from '../hooks/useQuantum';
import { usePredictionHistory } from '../hooks/usePredictions';
import { usePredictionSession } from '../contexts/PredictionSessionContext';
import { QUBOWeightsConfig } from '../components/quantum/QUBOWeightsConfig';
import { RankComparisonTable } from '../components/quantum/RankComparisonTable';
import { ConvergenceChart } from '../components/quantum/ConvergenceChart';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { ScientificTooltip } from '../components/ui/ScientificTooltip';
import { TechnicalDetailsAccordion } from '../components/ui/TechnicalDetailsAccordion';
import { EmptyStateContainer } from '../components/ui/EmptyStateContainer';
import { QUBOWeights } from '../types';
import { Cpu, Activity, ArrowRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

export const QuantumPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionPredictionIds, sessionQuantumJobId, setSessionQuantumJobId } = usePredictionSession();

  const [weights, setWeights] = useState<QUBOWeights>({
    weight_probability: 1.0,
    weight_affinity: 1.0,
    weight_lipinski: 0.5,
    weight_diversity_penalty: 0.8,
  });

  const { data: predictions } = usePredictionHistory();
  const optimizeMutation = useOptimizeCandidates();

  const currentSessionPredictions = sessionPredictionIds && predictions
    ? predictions.filter((p) => sessionPredictionIds.includes(p.id))
    : [];

  const hasSessionPredictions = currentSessionPredictions.length > 0;
  const activeJobId = sessionQuantumJobId || undefined;
  const { data: activeJob } = useQuantumJobDetails(activeJobId);
  const { data: comparison, isLoading: isCompLoading } = useQuantumComparison(activeJobId);
  const { showToast } = useToast();

  const handleRunOptimization = async () => {
    if (!hasSessionPredictions || !sessionPredictionIds) {
      showToast('No AI predictions available for current session. Please run AI Screening first.', 'error');
      navigate('/predictions');
      return;
    }

    const proteinId = currentSessionPredictions[0].protein_id || 'DEFAULT';
    try {
      const newJob = await optimizeMutation.mutateAsync({
        protein_id: proteinId,
        weights,
        prediction_ids: sessionPredictionIds,
      });

      setSessionQuantumJobId(newJob.id);
      showToast(`Quantum Optimization completed! Ground energy state: ${newJob.qubo_energy.toFixed(4)}`, 'success');
    } catch (err: any) {
      showToast('Quantum optimization failed.', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Streamlined Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-purple-500/30 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple">STEP 4 QUANTUM OPTIMIZATION</Badge>
              <span className="text-xs text-slate-500 font-mono font-medium">(Simulated Quantum Annealing)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Quantum QUBO Candidate Selection
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Formulates <ScientificTooltip term="QUBO" /> matrices mapping binding affinity, <ScientificTooltip term="Lipinski" /> compliance, and chemical diversity penalties.
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 font-mono">
            <Button
              variant="glow"
              size="sm"
              disabled={optimizeMutation.isPending || !hasSessionPredictions}
              onClick={handleRunOptimization}
              icon={optimizeMutation.isPending ? <span className="animate-spin">⏳</span> : <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
            >
              {optimizeMutation.isPending
                ? 'Selecting Candidates...'
                : `Run Quantum Optimizer (${currentSessionPredictions.length})`}
            </Button>
          </div>
        </div>

        {/* QUBO Weights Configurator */}
        <QUBOWeightsConfig weights={weights} onChange={setWeights} />

        {/* Energy Convergence & Telemetry */}
        {activeJob && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ConvergenceChart finalEnergy={activeJob.qubo_energy} />
              </div>

              <Card glowColor="purple" className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quantum Telemetry</span>
                  <Badge variant="emerald">D-Wave Ocean SDK</Badge>
                </div>

                <div className="space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span>Sampler Algorithm:</span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">SimulatedAnnealing</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span>Hamiltonian Energy:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeJob.qubo_energy.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span>Execution Time:</span>
                    <span className="text-sky-600 dark:text-sky-400 font-bold">{activeJob.runtime_ms} ms</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span>Optimal Candidates:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{activeJob.selected_count} / {activeJob.num_candidates}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Before vs After Comparison & Optimized Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Initial AI Rank vs Quantum Optimized Shortlist</span>
            </h3>
            {activeJobId && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Optimization Run ID: {activeJobId.slice(0, 8)}
              </span>
            )}
          </div>

          {!hasSessionPredictions ? (
            <EmptyStateContainer
              icon={<Cpu className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
              title="No AI predictions available"
              description="Run AI Screening to generate candidates for Quantum Optimization."
              actionText="Go to Step 3: AI Screening"
              onAction={() => navigate('/predictions')}
            />
          ) : isCompLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : comparison ? (
            <>
              <RankComparisonTable comparison={comparison} />

              {/* Step 4 Complete Banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 font-mono">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      Step 4 Complete: Quantum Optimization Done!
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400">
                      Optimal drug candidates are selected (AI Recommended). Proceed to Scientist Validation or generate report.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => navigate('/validation')}
                    className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Step 5: Scientist Validation
                  </button>
                  <button
                    onClick={() => navigate('/reports')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
                  >
                    <span>Proceed to Step 6: Scientific Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyStateContainer
              icon={<Cpu className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
              title="Quantum Optimization Ready"
              description={`${currentSessionPredictions.length} candidate predictions ready from your current screening session. Click 'Run Quantum Optimizer' to execute.`}
              actionText="Run Quantum Optimizer"
              onAction={handleRunOptimization}
            />
          )}
        </div>

        {/* Collapsed Technical Details Accordion */}
        <TechnicalDetailsAccordion title="Show Technical Details (QUBO Formulations & Energy Matrices)">
          <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-mono">
            Minimizes objective: H(x) = - w_affinity * Σ pKd_i * x_i - w_prob * Σ prob_i * x_i + w_diversity * Σ TanimotoSim(i, j) * x_i * x_j. Solved using D-Wave Ocean SDK Simulated Annealing Sampler over 1000 spin reads.
          </div>
        </TechnicalDetailsAccordion>

      </div>
    </DashboardLayout>
  );
};
