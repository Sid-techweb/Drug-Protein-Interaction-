import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useWorkflowRuns, useExecuteWorkflow } from '../hooks/useWorkflow';
import { WorkflowStageTracker } from '../components/workflow/WorkflowStageTracker';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { ExplanationCard } from '../components/ui/ExplanationCard';
import { WhyCard } from '../components/ui/WhyCard';
import { ScientificTooltip } from '../components/ui/ScientificTooltip';
import { EmptyStateContainer } from '../components/ui/EmptyStateContainer';
import { Play, Activity, Layers, CheckCircle2, Sparkles, FileText, ArrowRight, Award } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

export const WorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('EGFR Virtual Screening Campaign');
  const [proteinId] = useState('DEFAULT');
  const [targetQuery, setTargetQuery] = useState('P00533');
  const [maxCompounds, setMaxCompounds] = useState(30);

  const [lastCompletedRun, setLastCompletedRun] = useState<string | null>(null);

  const { data: runs, isLoading } = useWorkflowRuns();
  const executeMutation = useExecuteWorkflow();
  const { showToast } = useToast();

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const run = await executeMutation.mutateAsync({
        name,
        protein_id: proteinId,
        target_query: targetQuery,
        max_compounds: maxCompounds,
      });
      setLastCompletedRun(run.id);
      showToast(`1-Click End-to-End Workflow '${run.name}' completed successfully!`, 'success');
    } catch (err: any) {
      showToast('Workflow execution failed.', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Friendly Explanation Card */}
        <ExplanationCard
          title="1-Click Automated Screening Pipeline"
          badge="Automated Workflow"
          description="The 1-Click Pipeline automatically runs all 6 virtual screening steps sequentially from target protein loading to AI prediction, quantum optimization, and scientific report generation."
          analogy="Think of the 1-Click Pipeline like an automated assembly line that tests thousands of candidate keys against your lock without requiring manual intervention."
          nextStep="Enter a campaign name and target protein (e.g., P00533 for EGFR), then click 'Run 1-Click Automated Pipeline'."
          icon={<Play className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
        />

        {/* Why Card */}
        <WhyCard
          question="Why use the 1-Click Automated Pipeline?"
          answer="Instead of manually stepping through each page, the 1-Click Pipeline orchestrates live REST lookups, structure validation, AI neural forward passes, and quantum simulated annealing in a single unified execution."
        />

        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-sky-500/20 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple">1-CLICK AUTOMATED PIPELINE</Badge>
              <span className="text-xs text-slate-500 font-mono font-medium">(End-to-End Orchestration)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Automated Virtual Drug Screening Campaign
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Sequentially executes protein fetching, <ScientificTooltip term="UniProt" /> parsing, dataset import, <ScientificTooltip term="ESM-2" /> embeddings, AI binding predictions, and <ScientificTooltip term="QUBO" /> quantum optimization.
            </div>
          </div>
        </div>

        {/* 1-Click Launch Form */}
        <Card glowColor="purple" className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Launch 1-Click Automated Pipeline</span>
          </h3>

          <form onSubmit={handleExecute} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Campaign Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Target Protein (Accession / Gene)"
              value={targetQuery}
              onChange={(e) => setTargetQuery(e.target.value)}
              required
            />

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Candidates to Screen
              </label>
              <input
                type="number"
                min={10}
                max={200}
                value={maxCompounds}
                onChange={(e) => setMaxCompounds(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-2.5 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-purple-500 dark:focus:border-sky-500"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                variant="glow"
                className="w-full justify-center"
                disabled={executeMutation.isPending}
                icon={executeMutation.isPending ? <span className="animate-spin">⏳</span> : <Play className="w-4 h-4" />}
              >
                {executeMutation.isPending ? 'Running 1-Click Pipeline...' : 'Run 1-Click Automated Pipeline'}
              </Button>
            </div>
          </form>

          {/* Progress State Indicators during mutation */}
          {executeMutation.isPending && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-purple-900 dark:text-purple-200 font-bold">
                <span className="animate-spin">⏳</span>
                <span>Automated Pipeline in Progress...</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-purple-700 dark:text-purple-300 font-mono">
                <div className="flex items-center space-x-1"><span>✓</span><span>Loading target protein...</span></div>
                <div className="flex items-center space-x-1"><span>✓</span><span>Parsing amino acids...</span></div>
                <div className="flex items-center space-x-1"><span>✓</span><span>Preparing AI representation...</span></div>
                <div className="flex items-center space-x-1"><span>✓</span><span>Analyzing drug molecules...</span></div>
                <div className="flex items-center space-x-1"><span>✓</span><span>Running AI predictions...</span></div>
                <div className="flex items-center space-x-1"><span>✓</span><span>Selecting best candidates...</span></div>
              </div>
            </div>
          )}
        </Card>

        {/* Final Journey Summary Banner (Requirement #9) */}
        {lastCompletedRun && (
          <div className="bg-gradient-to-r from-emerald-900/20 via-teal-900/10 to-purple-900/20 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shrink-0">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🎉 Congratulations!</span>
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    HelixQ successfully completed the virtual drug screening pipeline.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <Button
                  variant="glow"
                  size="sm"
                  icon={<FileText className="w-4 h-4" />}
                  onClick={() => navigate('/reports')}
                >
                  Download Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/predictions')}
                >
                  Review AI Candidates
                </Button>
              </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-emerald-500/30 text-xs font-semibold text-emerald-950 dark:text-emerald-200">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Target Prepared</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Drugs Imported</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>AI Predictions</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Quantum Optimization</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Report Generated</span>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Runs Tracker */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-600 dark:text-sky-400" />
            <span>Active & Historic Pipeline Executions</span>
          </h3>

          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : runs && runs.length > 0 ? (
            <div className="space-y-4">
              {runs.map((run) => (
                <WorkflowStageTracker key={run.id} run={run} />
              ))}
            </div>
          ) : (
            <EmptyStateContainer
              icon={<Layers className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
              title="No automated pipelines executed yet"
              description="Fill in campaign details above and click 'Run 1-Click Automated Pipeline' to launch all 6 screening stages automatically."
            />
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};
