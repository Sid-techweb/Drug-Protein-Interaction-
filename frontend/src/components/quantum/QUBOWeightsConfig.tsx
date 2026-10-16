import React from 'react';
import { Card } from '../ui/Card';
import { QUBOWeights } from '../../types';
import { Sliders } from 'lucide-react';

interface QUBOWeightsConfigProps {
  weights: QUBOWeights;
  onChange: (weights: QUBOWeights) => void;
}

export const QUBOWeightsConfig: React.FC<QUBOWeightsConfigProps> = ({ weights, onChange }) => {
  const updateWeight = (key: keyof QUBOWeights, val: number) => {
    onChange({
      ...weights,
      [key]: val,
    });
  };

  return (
    <Card glowColor="purple" className="p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">QUBO Objective Weight Matrix</h4>
        </div>
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Multi-Objective Hamiltonian</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        
        {/* Weight 1: Interaction Probability */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>Probability (w_prob):</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">{weights.weight_probability.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="3.0"
            step="0.1"
            value={weights.weight_probability}
            onChange={(e) => updateWeight('weight_probability', parseFloat(e.target.value))}
            className="w-full accent-purple-600 dark:accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Weight 2: Binding Affinity */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>Affinity pKd (w_aff):</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{weights.weight_affinity.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="3.0"
            step="0.1"
            value={weights.weight_affinity}
            onChange={(e) => updateWeight('weight_affinity', parseFloat(e.target.value))}
            className="w-full accent-sky-600 dark:accent-sky-500 cursor-pointer"
          />
        </div>

        {/* Weight 3: Lipinski Compliance */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>Lipinski (w_lip):</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{weights.weight_lipinski.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="3.0"
            step="0.1"
            value={weights.weight_lipinski}
            onChange={(e) => updateWeight('weight_lipinski', parseFloat(e.target.value))}
            className="w-full accent-emerald-600 dark:accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Weight 4: Diversity Penalty */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>Diversity (w_div):</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{weights.weight_diversity_penalty.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="3.0"
            step="0.1"
            value={weights.weight_diversity_penalty}
            onChange={(e) => updateWeight('weight_diversity_penalty', parseFloat(e.target.value))}
            className="w-full accent-amber-600 dark:accent-amber-500 cursor-pointer"
          />
        </div>

      </div>
    </Card>
  );
};
