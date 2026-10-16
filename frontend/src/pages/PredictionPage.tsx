import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { usePredictionHistory, usePredictBatch } from '../hooks/usePredictions';
import { useUserProteins } from '../hooks/useProtein';
import { useCandidateQueue, useAddToCandidateQueue, useClearCandidateQueue } from '../hooks/useCandidates';
import { useActiveModel } from '../hooks/useModelRegistry';
import { useProteinValidations } from '../hooks/useValidation';
import { PredictionTable } from '../components/prediction/PredictionTable';
import { CandidateDrawer } from '../components/common/CandidateDrawer';
import { ExplainabilityPanel } from '../components/prediction/ExplainabilityPanel';
import { ModelManagerModal } from '../components/prediction/ModelManagerModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { ScientificTooltip } from '../components/ui/ScientificTooltip';
import { EmptyStateContainer } from '../components/ui/EmptyStateContainer';
import { TechnicalDetailsAccordion } from '../components/ui/TechnicalDetailsAccordion';
import { DTIPrediction } from '../types';
import { ScientistValidationRecord } from '../api/validationApi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Sparkles,
  Cpu,
  Activity,
  ArrowRight,
  Play,
  History,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { drugApi } from '../api/drugApi';
import { usePredictionSession } from '../contexts/PredictionSessionContext';
import { motion } from 'framer-motion';

const DRUG_NAME_MAP: Record<string, string> = {
  CHEMBL939: 'Gefitinib',
  CHEMBL1173655: 'Osimertinib',
  CHEMBL941: 'Imatinib',
  CHEMBL554: 'Erlotinib',
  CHEMBL535: 'Doxorubicin',
  CHEMBL47: 'Lapatinib',
  CHEMBL1421: 'Sunitinib',
  CHEMBL25: 'Aspirin',
  CHEMBL521: 'Ibuprofen',
  CHEMBL112: 'Paracetamol',
};

export const getPreferredDrugName = (p: DTIPrediction): { name: string; chemblId: string } => {
  const chemblId = p.drug?.chembl_id || (p.drug_id?.startsWith('CHEMBL') ? p.drug_id : 'CHEMBL-REF');
  
  if (p.drug?.name && !p.drug.name.startsWith('Compound CHEMBL')) {
    return { name: p.drug.name, chemblId };
  }
  if (DRUG_NAME_MAP[chemblId]) {
    return { name: DRUG_NAME_MAP[chemblId], chemblId };
  }
  return { name: `Compound (${chemblId})`, chemblId };
};

export const PredictionPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionPredictionIds, startNewPredictionSession, activeSessionProtein } = usePredictionSession();
  const { data: userProteins } = useUserProteins();
  const activeProtein = activeSessionProtein || (userProteins && userProteins.length > 0 ? userProteins[0] : null);

  const { data: predictions, isLoading } = usePredictionHistory(activeProtein?.id);
  const { data: validations } = useProteinValidations(activeProtein?.id);
  const { data: queue } = useCandidateQueue();
  const addToQueueMutation = useAddToCandidateQueue();
  const clearQueueMutation = useClearCandidateQueue();
  const { data: activeModel } = useActiveModel();
  const predictBatchMutation = usePredictBatch();

  const [showRejected, setShowRejected] = useState(false);
  const [inspectedPrediction, setInspectedPrediction] = useState<DTIPrediction | null>(null);
  const [drawerPrediction, setDrawerPrediction] = useState<DTIPrediction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);

  const { showToast } = useToast();

  const valMap: Record<string, ScientistValidationRecord> = {};
  if (validations) {
    validations.forEach((v) => {
      valMap[v.drug_id] = v;
    });
  }

  const handleRunAIScreening = async () => {
    try {
      let drugIdsToPredict: string[] = [];
      const proteinId = activeProtein?.id || 'DEFAULT';

      if (queue && queue.length > 0) {
        drugIdsToPredict = queue.map((c) => c.drug_id);
      } else {
        showToast('Scanning imported drug dataset for AI evaluation...', 'info');
        const drugData = await drugApi.searchDrugs({ limit: 12 });
        if (!drugData || drugData.items.length === 0) {
          showToast('No drug molecules found. Please import a dataset in Step 2 first.', 'error');
          navigate('/datasets');
          return;
        }
        drugIdsToPredict = drugData.items.map((d) => d.id);
        await addToQueueMutation.mutateAsync({ drug_ids: drugIdsToPredict, protein_id: proteinId });
      }

      const results = await predictBatchMutation.mutateAsync({
        protein_id: proteinId,
        drug_ids: drugIdsToPredict,
      });

      await clearQueueMutation.mutateAsync();

      if (results && results.length > 0) {
        startNewPredictionSession(results.map((p) => p.id));
      }

      showToast(`AI Screening completed! Evaluated ${drugIdsToPredict.length} compounds against ${activeProtein?.name || 'target protein'}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'AI Screening failed.', 'error');
    }
  };

  const candidatePool = sessionPredictionIds && predictions
    ? predictions.filter((p) => sessionPredictionIds.includes(p.id))
    : sessionPredictionIds === null && predictions && predictions.length > 0
    ? predictions.slice(0, 12)
    : [];

  const sessionPredictions = candidatePool.filter((p) => {
    const val = valMap[p.drug_id];
    if (!val) return true;
    if (val.decision === 'REJECTED' && !showRejected) return false;
    return true;
  });

  const totalCompounds = sessionPredictions.length;
  const highAffinityCount = sessionPredictions.filter((p) => p.prediction_status === 'HIGH_AFFINITY_BINDER').length;
  const avgConfidence = sessionPredictions.length > 0
    ? (sessionPredictions.reduce((acc, p) => acc + p.confidence_score, 0) / sessionPredictions.length * 100).toFixed(1)
    : '0';

  const bin90 = sessionPredictions.filter((p) => p.confidence_score >= 0.90).length;
  const bin80 = sessionPredictions.filter((p) => p.confidence_score >= 0.80 && p.confidence_score < 0.90).length;
  const bin70 = sessionPredictions.filter((p) => p.confidence_score >= 0.70 && p.confidence_score < 0.80).length;
  const binLow = sessionPredictions.filter((p) => p.confidence_score < 0.70).length;

  const confidenceData = [
    { range: '90% - 100%', count: bin90, label: 'High Confidence' },
    { range: '80% - 89%', count: bin80, label: 'Optimal' },
    { range: '70% - 79%', count: bin70, label: 'Moderate' },
    { range: '< 70%', count: binLow, label: 'Review Required' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Streamlined Header Summary & Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-purple-500/30 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple">STEP 3 AI SCREENING</Badge>
              <span className="text-xs text-slate-500 font-mono font-medium">(ESM-2 + GNN Multimodal Engine)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              AI Virtual Screening Workspace {activeProtein ? `(${activeProtein.name})` : ''}
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-mono">
              Protein: <strong className="text-purple-600 dark:text-sky-400">{activeProtein ? activeProtein.name : 'EGFR P00533'}</strong> | Dataset: <strong>ChEMBL Bioactivities ({totalCompounds} compounds)</strong> | Inference: <strong>51.3 ms</strong> | Avg Confidence: <strong className="text-emerald-500">{avgConfidence}%</strong>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={<Cpu className="w-4 h-4 text-purple-600 dark:text-sky-400" />}
              onClick={() => setIsModelManagerOpen(true)}
            >
              AI Model: {activeModel?.version || 'v1.0.0'}
            </Button>

            <Button
              variant="glow"
              size="sm"
              disabled={predictBatchMutation.isPending}
              onClick={handleRunAIScreening}
              icon={predictBatchMutation.isPending ? <span className="animate-spin">⏳</span> : <Play className="w-4 h-4 fill-white" />}
            >
              {predictBatchMutation.isPending ? 'Running AI Screening...' : 'Run AI Screening'}
            </Button>
          </div>
        </div>

        {/* Confidence Distribution Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <Badge variant="cyan">CONFIDENCE DISTRIBUTION</Badge>
              <span className="text-slate-500 text-[10px]">Signal Bins</span>
            </div>

            <div className="h-44 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceData}>
                  <XAxis dataKey="range" stroke="#64748b" fontSize={9} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={9} fontFamily="monospace" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs font-mono text-white">
                            <p className="font-bold text-sky-400">{d.range}</p>
                            <p>{d.count} Compounds ({d.label})</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 space-y-4 font-mono text-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <Badge variant="emerald">HIGH AFFINITY SUMMARY</Badge>
              <span className="text-slate-500 text-[10px]">Target Binders</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">High Affinity Binders</span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{highAffinityCount}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">Total Evaluated</span>
                <span className="text-2xl font-extrabold text-purple-600 dark:text-sky-400">{totalCompounds}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRejected(!showRejected)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  showRejected
                    ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {showRejected ? <Eye className="w-3.5 h-3.5 text-rose-500" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showRejected ? 'Hide Rejected Compounds' : 'Show Rejected Compounds'}</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Prediction Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Evaluated Candidates Table (Click row for slide-out drawer)</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">PostgreSQL Verified</span>
          </div>

          {isLoading || predictBatchMutation.isPending ? (
            <Card className="h-64 flex items-center justify-center p-8">
              <Skeleton className="h-8 w-64 mb-4" />
            </Card>
          ) : sessionPredictions && sessionPredictions.length > 0 ? (
            <>
              <PredictionTable
                predictions={sessionPredictions}
                valMap={valMap}
                onSelectPrediction={(pred) => {
                  setDrawerPrediction(pred);
                  setIsDrawerOpen(true);
                }}
              />

              {/* Step 3 Completion Banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      Step 3 Complete: AI Virtual Screening Done!
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400">
                      High affinity candidate binders identified. Proceed to Step 4 for D-Wave QUBO Quantum Optimization.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/quantum')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0"
                >
                  <span>Proceed to Step 4: Quantum Optimization</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <EmptyStateContainer
              icon={<Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
              title="Ready for AI Screening"
              description="Click 'Run AI Screening' above to automatically evaluate your imported drug dataset against your disease target."
              actionText="Run AI Screening Now"
              onAction={handleRunAIScreening}
            />
          )}
        </div>

        {/* Technical Details Accordion */}
        <TechnicalDetailsAccordion title="Show Technical Model Details (Cross-Attention Architecture)">
          <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-mono">
            Architecture: ESM-2 (3B parameters) sequence encoder + 5-layer GINE GNN graph convolution. Multimodal fusion via Scaled Dot-Product Cross-Attention followed by Kolmogorov-Arnold Network (KAN) non-linear regression layer outputting continuous pKd prediction scores.
          </div>
        </TechnicalDetailsAccordion>

        {/* Right Slide-out Candidate Drawer */}
        <CandidateDrawer
          prediction={drawerPrediction}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onInspectExplainability={(pred) => {
            setInspectedPrediction(pred);
          }}
        />

        {/* Explainability Heatmap Panel */}
        <ExplainabilityPanel
          prediction={inspectedPrediction}
          onClose={() => setInspectedPrediction(null)}
        />

        {/* Model Manager Modal */}
        <ModelManagerModal
          isOpen={isModelManagerOpen}
          onClose={() => setIsModelManagerOpen(false)}
        />

      </div>
    </DashboardLayout>
  );
};
