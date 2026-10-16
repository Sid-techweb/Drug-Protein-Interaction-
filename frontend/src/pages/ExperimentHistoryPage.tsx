import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useWorkflowRuns } from '../hooks/useWorkflow';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ExplanationCard } from '../components/ui/ExplanationCard';
import { WhyCard } from '../components/ui/WhyCard';
import { EmptyStateContainer } from '../components/ui/EmptyStateContainer';
import { History, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExperimentHistoryPage: React.FC = () => {
  const { data: runs, isLoading } = useWorkflowRuns();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Friendly Explanation Card */}
        <ExplanationCard
          title="Past Experiments"
          badge="Experiment History"
          description="This page displays all your past virtual screening campaign executions, showing candidate selection ratios, protein target details, and execution times."
          analogy="Think of Past Experiments as your virtual lab logbook, keeping an immutable record of every drug discovery experiment run."
          nextStep="Inspect any past run below or click 'Inspect Candidate Predictions' to view individual candidate binding affinities."
          icon={<History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        />

        {/* Why Card */}
        <WhyCard
          question="Why keep an Audit History of Experiments?"
          answer="Maintaining experiment history ensures full scientific reproducibility, allowing bio-researchers to trace exact parameters, target proteins, and quantum weights used in past campaigns."
        />

        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-sky-500/20 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan">EXPERIMENT HISTORY</Badge>
              <span className="text-xs text-slate-500 font-mono font-medium">(Audit Trail)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Virtual Screening Past Experiments Log
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Historical virtual screening campaigns, compound count tracking, and pipeline stage telemetry.
            </div>
          </div>
        </div>

        {/* Experiment History List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((idx) => (
                <Skeleton key={idx} className="h-32 w-full" />
              ))}
            </div>
          ) : runs && runs.length > 0 ? (
            <div className="space-y-4">
              {runs.map((run) => (
                <Card key={run.id} glowColor="purple" className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{run.name}</h4>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Run ID: {run.id} | Timestamp: {new Date(run.created_at).toLocaleString()}
                      </p>
                    </div>

                    <Badge variant={run.status === 'COMPLETED' ? 'emerald' : 'amber'}>
                      {run.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Target Protein</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">{run.protein?.name || run.protein_id}</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Total Screened</span>
                      <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{run.total_compounds} Drugs</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Selected Shortlist</span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{run.selected_compounds} Shortlisted</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Pipeline Latency</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{run.execution_time_ms} ms</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => navigate('/predictions')}
                      className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 inline-flex items-center space-x-1 font-mono"
                    >
                      <span>Inspect Candidate Predictions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyStateContainer
              icon={<History className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
              title="No past experiments found"
              description="Launch an automated screening run in the 1-Click Pipeline workspace to record your first experiment in the audit log."
              actionText="Run 1-Click Pipeline"
              onAction={() => navigate('/workflow')}
            />
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};
