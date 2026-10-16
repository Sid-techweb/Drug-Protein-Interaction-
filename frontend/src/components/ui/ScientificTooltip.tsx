import React, { useState } from 'react';
import { Info } from 'lucide-react';

export const DICTIONARY: Record<string, string> = {
  'ESM-2': 'A modern AI protein language model (by Meta AI) that converts amino acid sequences into mathematical vectors capturing biological structure and function.',
  'Morgan Fingerprint': 'A circular digital fingerprint representing the 2D/3D chemical sub-structures of a drug molecule.',
  'pKd': 'Negative logarithm of the dissociation constant (-log10 Kd). Measures binding affinity strength—higher values indicate a stronger bond between drug and protein.',
  'Kd': 'Dissociation constant measuring how tightly a drug binds to its target protein. Lower values mean stronger binding.',
  'Lipinski': 'Rule of 5 estimating human oral bioavailability based on molecular weight, hydrophobicity (LogP), and hydrogen bond donors/acceptors.',
  'QUBO': 'Quadratic Unconstrained Binary Optimization—a mathematical format used by quantum processors to select optimal drug combinations.',
  'RDKit': 'An open-source cheminformatics computational toolkit used to analyze and manipulate chemical structures.',
  'SMILES': 'Simplified Molecular Input Line Entry System—a text string format used to encode complete 2D/3D chemical structures (e.g. CC(=O)OC1=CC=CC=C1C(=O)O).',
  'UniProt': 'Universal Protein Resource—a global database providing comprehensive, high-quality protein sequence and functional metadata.',
  'SA Score': 'Synthetic Accessibility Score (1 to 10)—estimates how easy or hard it is to synthesize/manufacture a molecule in a laboratory.',
  'Protein Embedding': 'A high-dimensional vector representation of a protein that allows AI models to process complex biological patterns.',
  'Binding Affinity': 'The thermodynamic strength of attraction between a drug candidate molecule and its target disease protein.',
  'Ising Hamiltonian': 'A physics model representing spin states, mapped from drug combination constraints for quantum annealing execution.',
};

interface ScientificTooltipProps {
  term: string;
  explanation?: string;
  children?: React.ReactNode;
}

export const ScientificTooltip: React.FC<ScientificTooltipProps> = ({
  term,
  explanation,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const text = explanation || DICTIONARY[term] || `Scientific term: ${term}`;

  return (
    <span className="inline-flex items-center gap-1 relative group cursor-help">
      <span className="font-medium text-slate-900 dark:text-slate-100 border-b border-dashed border-sky-400/60 dark:border-sky-400/40 hover:border-sky-500">
        {children || term}
      </span>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Explain ${term}`}
        className="text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors p-0.5 rounded-full hover:bg-sky-50 dark:hover:bg-sky-950/50 inline-flex items-center justify-center"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Tooltip Popover - Uses <span> only to prevent DOM nesting warnings inside <p> */}
      <span
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 dark:bg-slate-900 text-white dark:text-slate-100 text-xs rounded-xl shadow-xl backdrop-blur-md border border-slate-700/80 transition-all duration-200 pointer-events-none z-50 flex flex-col ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
      >
        <span className="font-bold text-sky-400 mb-1 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{term}</span>
        </span>
        <span className="text-slate-300 dark:text-slate-300 leading-relaxed text-[11px] block">{text}</span>
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-900" />
      </span>
    </span>
  );
};
