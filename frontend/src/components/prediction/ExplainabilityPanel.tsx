import React from 'react';
import { Modal } from '../ui/Modal';
import { Skeleton } from '../ui/Skeleton';
import { DTIPrediction } from '../../types';
import { useExplainability } from '../../hooks/useExplainability';
import { Dna, Activity, Sparkles } from 'lucide-react';

interface ExplainabilityPanelProps {
  prediction: DTIPrediction | null;
  onClose: () => void;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ prediction, onClose }) => {
  const { data: explainability, isLoading } = useExplainability(prediction?.id);

  if (!prediction) return null;

  return (
    <Modal
      isOpen={!!prediction}
      onClose={onClose}
      title="Explainable AI (XAI) Attribution Panel"
      subtitle={`Cross-Attention Matrix Analysis for Prediction ID: ${prediction.id.slice(0, 8)}...`}
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : explainability ? (
        <div className="space-y-6">
          
          {/* Decision Summary */}
          <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-500/30 text-xs font-mono space-y-2">
            <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-bold">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Multimodal Neural Network Decision Summary</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{explainability.decision_summary}</p>
          </div>

          {/* Attention Heatmap Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-600 dark:text-sky-400" />
                <span>Residue-to-Atom Scaled Dot-Product Attention Heatmap</span>
              </h4>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">8x8 Cross-Attention Layer</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <div className="grid grid-cols-9 gap-1.5 min-w-[320px] font-mono text-[10px]">
                {/* Empty corner */}
                <div className="p-1"></div>
                {/* Header Atom Labels */}
                {explainability.top_drug_atoms.map((a, colIdx) => (
                  <div key={colIdx} className="p-1.5 text-center font-bold text-purple-700 dark:text-sky-400 bg-slate-200 dark:bg-slate-900 rounded">
                    {a.element}{a.atom_index}
                  </div>
                ))}

                {/* Rows with Residue Labels */}
                {explainability.top_protein_residues.map((r, rowIdx) => (
                  <React.Fragment key={rowIdx}>
                    <div className="p-1.5 font-bold text-purple-600 dark:text-purple-400 bg-slate-200 dark:bg-slate-900 rounded flex items-center justify-center">
                      {r.residue_name}{r.residue_index}
                    </div>
                    {explainability.top_drug_atoms.map((a, colIdx) => {
                      const score = explainability.attention_matrix_summary.matrix[rowIdx]?.[colIdx] || 0;
                      const opacity = Math.min(1.0, score * 6.0);
                      return (
                        <div
                          key={colIdx}
                          className="p-2 rounded text-center font-mono font-bold text-slate-900 dark:text-white transition-transform hover:scale-110 cursor-pointer"
                          style={{
                            backgroundColor: `rgba(168, 85, 247, ${opacity})`,
                            border: '1px solid rgba(168, 85, 247, 0.3)'
                          }}
                          title={`Residue ${r.residue_name}${r.residue_index} ↔ Atom ${a.element}${a.atom_index}: Attention ${score}`}
                        >
                          {score.toFixed(2)}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Top Protein Residues & Drug Atom Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Protein Binding Pocket Residues */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h5 className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center space-x-1.5">
                <Dna className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>High-Attention Protein Pocket Residues</span>
              </h5>
              <div className="space-y-1.5 font-mono text-xs">
                {explainability.top_protein_residues.map((r) => (
                  <div key={r.residue_index} className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900 last:border-0">
                    <span className="text-slate-700 dark:text-slate-300">Residue {r.residue_name} ({r.residue_index})</span>
                    <span className={`font-bold ${r.is_binding_pocket ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {(r.attention_score * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drug Pharmacophore Atoms */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h5 className="text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-purple-600 dark:text-sky-400" />
                <span>Pharmacophore Atom Importance</span>
              </h5>
              <div className="space-y-1.5 font-mono text-xs">
                {explainability.top_drug_atoms.map((a) => (
                  <div key={a.atom_index} className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900 last:border-0">
                    <span className="text-slate-700 dark:text-slate-300">Atom {a.element} (#{a.atom_index})</span>
                    <span className={`font-bold ${a.is_pharmacophore ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {(a.importance_score * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : null}
    </Modal>
  );
};
