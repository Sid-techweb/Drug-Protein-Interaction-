import React from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface WhyCardProps {
  question: string;
  answer: string;
  className?: string;
}

export const WhyCard: React.FC<WhyCardProps> = ({
  question,
  answer,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/20 border border-sky-200/80 dark:border-sky-800/40 rounded-xl p-4 my-3 text-xs shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sky-900 dark:text-sky-300 text-xs sm:text-sm flex items-center gap-1.5">
            <span>{question}</span>
          </h4>
          <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-[12px]">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};
