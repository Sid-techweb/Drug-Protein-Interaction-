import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { QuantumJob } from '../../types';
import { Cpu } from 'lucide-react';

interface QuantumJobCardProps {
  job: QuantumJob;
  onSelect: (job: QuantumJob) => void;
  isSelected?: boolean;
}

export const QuantumJobCard: React.FC<QuantumJobCardProps> = ({ job, onSelect, isSelected = false }) => {
  return (
    <Card
      interactive
      glowColor={isSelected ? 'purple' : 'cyan'}
      onClick={() => onSelect(job)}
      className={`p-5 space-y-3 ${isSelected ? 'border-purple-400 dark:border-purple-500/60 bg-purple-50 dark:bg-purple-950/20' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quantum Optimization Run</h4>
        </div>
        <Badge variant="purple">{job.solver_type}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Ground Energy</span>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{job.qubo_energy.toFixed(4)}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Runtime</span>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{job.runtime_ms} ms</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Selected</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{job.selected_count} / {job.num_candidates}</span>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
        <span>ID: {job.id.slice(0, 8)}...</span>
        <span>{new Date(job.created_at).toLocaleTimeString()}</span>
      </div>
    </Card>
  );
};
