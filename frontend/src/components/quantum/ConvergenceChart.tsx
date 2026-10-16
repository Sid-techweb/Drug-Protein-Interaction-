import React from 'react';
import { Activity } from 'lucide-react';

interface ConvergenceChartProps {
  finalEnergy: number;
}

export const ConvergenceChart: React.FC<ConvergenceChartProps> = ({ finalEnergy }) => {
  // Generate simulated annealing energy minimization trajectory steps
  const steps = 12;
  const initialEnergy = Math.max(0.5, absEnergy(finalEnergy) * 3.5);
  
  function absEnergy(e: number) {
    return Math.abs(e) || 1.0;
  }

  const points = Array.from({ length: steps }).map((_, idx) => {
    const progress = idx / (steps - 1);
    const energy = initialEnergy * Math.exp(-progress * 2.5) + finalEnergy;
    const x = 30 + progress * 240;
    // Map energy to y (height=120)
    const y = 20 + ((energy - finalEnergy) / (initialEnergy + 0.01)) * 75;
    return { x, y: Math.min(100, Math.max(15, y)), energy };
  });

  const svgPath = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 transition-colors duration-300">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Quantum Energy Convergence (Simulated Annealing)</span>
        </span>
        <span className="text-purple-600 dark:text-purple-400 font-bold">E_min: {finalEnergy.toFixed(4)}</span>
      </div>

      <div className="relative w-full h-32 flex items-center justify-center">
        <svg width="290" height="110" className="w-full h-full">
          <defs>
            <linearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="30" y1="20" x2="270" y2="20" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3,3" />
          <line x1="30" y1="60" x2="270" y2="60" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3,3" />
          <line x1="30" y1="95" x2="270" y2="95" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3,3" />

          {/* Convergence Line */}
          <path d={svgPath} fill="none" stroke="url(#energyGrad)" strokeWidth="3" strokeLinecap="round" />

          {/* Point Markers */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={idx === points.length - 1 ? "5" : "2.5"}
              fill={idx === points.length - 1 ? "#10b981" : "#a855f7"}
              className="stroke-white dark:stroke-slate-950"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
