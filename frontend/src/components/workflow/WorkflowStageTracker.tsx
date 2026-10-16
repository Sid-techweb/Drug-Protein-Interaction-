import React from 'react';
import { WorkflowRun } from '../../types';
import { CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';

interface WorkflowStageTrackerProps {
  run: WorkflowRun;
}

export const WorkflowStageTracker: React.FC<WorkflowStageTrackerProps> = ({ run }) => {
  const stageNames = [
    "Target Protein Selection",
    "ChEMBL Dataset Import",
    "RDKit Descriptor Processing",
    "Multimodal AI Prediction",
    "Quantum QUBO Optimization",
    "Final Candidate Shortlist"
  ];

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Workflow Run: {run.name}</span>
          </h4>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            ID: {run.id} | Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{run.status}</span>
          </p>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-slate-500 dark:text-slate-400 block">Total Pipeline Latency</span>
          <span className="text-purple-600 dark:text-sky-400 font-bold">{run.execution_time_ms} ms</span>
        </div>
      </div>

      {/* 6 Stage Track */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {stageNames.map((name, idx) => {
          const stageNum = idx + 1;
          const isDone = stageNum <= run.current_stage || run.status === 'COMPLETED';
          const isCurrent = stageNum === run.current_stage && run.status === 'EXECUTING';

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                isDone
                  ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-500/40 text-purple-900 dark:text-purple-200'
                  : isCurrent
                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-500/60 text-sky-900 dark:text-sky-300 animate-pulse'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-[11px]">Stage 0{stageNum}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-purple-600 dark:text-sky-400 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                )}
              </div>
              <p className="font-bold leading-tight line-clamp-2">{name}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
};
