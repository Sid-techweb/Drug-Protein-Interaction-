import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Protein } from '../../types';
import { CheckCircle2, Copy, Check, BarChart2, ChevronDown } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ProteinAnalysisCardProps {
  protein: Protein;
}

export const ProteinAnalysisCard: React.FC<ProteinAnalysisCardProps> = ({ protein }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const meta = protein.metadata_rel;

  const handleCopySequence = () => {
    navigator.clipboard.writeText(protein.sequence);
    setCopied(true);
    showToast('Amino acid sequence copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card glowColor="purple" className="p-5 overflow-hidden transition-all">
      
      {/* Compact Summary Header (Always Visible) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-base">🧬</span>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-sky-400 uppercase tracking-wider">
              Target Selected
            </span>
            <Badge variant="emerald" className="px-2.5 py-0.5 text-[10px]">
              <CheckCircle2 className="w-3 h-3 mr-1" /> VALIDATED (IUPAC OK)
            </Badge>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
            {protein.name}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
            {protein.accession_id && (
              <span>UniProt: <strong className="text-purple-600 dark:text-sky-400">{protein.accession_id}</strong></span>
            )}
            <span>Organism: <strong className="text-slate-800 dark:text-slate-200">{protein.organism || 'N/A'}</strong></span>
            <span>Sequence Length: <strong className="text-emerald-600 dark:text-emerald-400">{protein.length} AA</strong></span>
            {protein.gene_name && (
              <span>Gene: <strong className="text-slate-700 dark:text-slate-300">{protein.gene_name}</strong></span>
            )}
          </div>
        </div>

        {/* Accordion Toggle Button */}
        <div className="shrink-0 self-start md:self-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold rounded-xl transition-all shadow-sm"
          >
            <span>{isExpanded ? 'Hide Protein Details' : 'View Protein Details'}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronDown className="w-4 h-4 text-purple-600 dark:text-sky-400" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Collapsible Content Area */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-800 space-y-6">
              
              {/* UniProt Function Description */}
              {protein.function_description && (
                <div className="bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                  <span className="font-bold text-purple-600 dark:text-sky-400">UniProt Function: </span>
                  {protein.function_description}
                </div>
              )}

              {/* Key Physicochemical Property Badges & Values */}
              {meta && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                      Sequence Length
                    </span>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{protein.length}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Residues</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                      Mol Weight (MW)
                    </span>
                    <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">
                      {(meta.molecular_weight / 1000).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">kDa</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                      Isoelectric Point (pI)
                    </span>
                    <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                      {meta.isoelectric_point}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">pH units</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                      Hydrophobic Residues
                    </span>
                    <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                      {meta.hydrophobic_pct}%
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">A,V,I,L,M,F,W,P</span>
                  </div>
                </div>
              )}

              {/* Physicochemical Composition Bars */}
              {meta && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
                    <BarChart2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Amino Acid Classification Breakdown</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    {/* Hydrophobic */}
                    <div>
                      <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-mono">
                        <span>Hydrophobic (A, V, I, L, M, F, W, P)</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{meta.hydrophobic_pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-500 rounded-full"
                          style={{ width: `${meta.hydrophobic_pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Polar */}
                    <div>
                      <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-mono">
                        <span>Polar (S, T, Y, N, Q, C)</span>
                        <span className="text-sky-600 dark:text-sky-400 font-bold">{meta.polar_pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 dark:bg-sky-400 transition-all duration-500 rounded-full"
                          style={{ width: `${meta.polar_pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Basic */}
                    <div>
                      <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-mono">
                        <span>Basic / Positively Charged (K, R, H)</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{meta.basic_pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500 rounded-full"
                          style={{ width: `${meta.basic_pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Acidic */}
                    <div>
                      <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-mono">
                        <span>Acidic / Negatively Charged (D, E)</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{meta.acidic_pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 dark:bg-rose-400 transition-all duration-500 rounded-full"
                          style={{ width: `${meta.acidic_pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sequence Preview Box */}
              <div className="space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Amino Acid Sequence Preview
                  </span>
                  <button
                    onClick={handleCopySequence}
                    className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium text-purple-700 dark:text-sky-400 bg-purple-50 dark:bg-sky-500/10 hover:bg-purple-100 dark:hover:bg-sky-500/20 border border-purple-200 dark:border-sky-500/30 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Sequence'}</span>
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-h-32 overflow-y-auto text-xs text-purple-900 dark:text-sky-300 leading-relaxed tracking-widest break-all select-all">
                  {protein.sequence}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </Card>
  );
};
