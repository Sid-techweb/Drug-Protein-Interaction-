import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code, Database, Terminal } from 'lucide-react';

interface TechnicalDetailsAccordionProps {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const TechnicalDetailsAccordion: React.FC<TechnicalDetailsAccordionProps> = ({
  title = "Show Technical Details (Vectors, Formulas & Matrices)",
  children,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mt-4 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-mono">
          <span>{isOpen ? 'Hide' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs space-y-3 font-mono text-slate-800 dark:text-slate-300 overflow-x-auto">
          {children}
        </div>
      )}
    </div>
  );
};
