import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RankComparisonData } from '../../types';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface RankComparisonTableProps {
  comparison: RankComparisonData;
}

export const RankComparisonTable: React.FC<RankComparisonTableProps> = ({ comparison }) => {
  return (
    <Card className="p-6 space-y-6">
      
      {/* Comparison Telemetry Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Total AI Candidates
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{comparison.total_candidates}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Selected Shortlist
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{comparison.selected_candidates}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Avg Rank Shift
          </span>
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">±{comparison.avg_rank_shift}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Quantum Optimization Gain
          </span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">+{comparison.quantum_optimization_gain_pct}%</span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">
              <th className="py-3 px-4 rounded-l-xl">Optimized Quantum Rank</th>
              <th className="py-3 px-4">Compound Name</th>
              <th className="py-3 px-4">Initial AI Rank</th>
              <th className="py-3 px-4">Rank Boost (Δ Rank)</th>
              <th className="py-3 px-4">AI Score</th>
              <th className="py-3 px-4">Quantum Score</th>
              <th className="py-3 px-4 rounded-r-xl">Quantum Shortlist</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-xs font-mono">
            {comparison.results.map((res) => {
              const delta = res.rank_delta;
              return (
                <tr key={res.id} className="hover:bg-purple-50/50 dark:hover:bg-slate-900/60 transition-colors">
                  
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/40 inline-flex items-center justify-center text-purple-700 dark:text-purple-300 mr-2">
                      #{res.optimized_rank}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {res.drug?.name && !res.drug.name.startsWith('Compound CHEMBL')
                        ? res.drug.name
                        : res.drug?.chembl_id
                        ? `Compound (${res.drug.chembl_id})`
                        : res.drug?.name || `Compound ${res.drug_id}`}
                    </div>
                    {res.drug?.chembl_id && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        ChEMBL: {res.drug.chembl_id}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    #{res.initial_ai_rank}
                  </td>

                  <td className="py-3 px-4">
                    {delta > 0 ? (
                      <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +{delta}
                      </span>
                    ) : delta < 0 ? (
                      <span className="inline-flex items-center text-rose-600 dark:text-rose-400 font-bold">
                        <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> {delta}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-slate-500 dark:text-slate-400 font-bold">
                        <Minus className="w-3.5 h-3.5 mr-0.5" /> 0
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-purple-600 dark:text-sky-400 font-bold">
                    {(res.ai_score * 100).toFixed(1)}%
                  </td>

                  <td className="py-3 px-4 text-purple-600 dark:text-purple-400 font-bold">
                    {res.quantum_score.toFixed(4)}
                  </td>

                  <td className="py-3 px-4">
                    <Badge variant={res.is_selected ? 'emerald' : 'rose'}>
                      {res.is_selected ? 'SELECTED' : 'REJECTED'}
                    </Badge>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </Card>
  );
};
