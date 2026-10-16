import React from 'react';
import { Sparkles, HelpCircle, ArrowRight, Lightbulb } from 'lucide-react';

interface ExplanationCardProps {
  title?: string;
  badge?: string;
  description: string;
  analogy?: string;
  nextStep?: string;
  icon?: React.ReactNode;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  title = "Welcome!",
  badge = "Step Guide",
  description,
  analogy,
  nextStep,
  icon
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-sky-900/10 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-sky-950/40 border border-purple-200/80 dark:border-purple-500/30 rounded-2xl p-5 mb-6 shadow-sm relative overflow-hidden backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40">
              {icon || <Sparkles className="w-3.5 h-3.5 text-purple-500" />}
              {badge}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            {description}
          </div>

          {analogy && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-950 dark:text-purple-200 mt-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-800 dark:text-amber-300">Simple Analogy: </span>
                <span>{analogy}</span>
              </div>
            </div>
          )}
        </div>

        {nextStep && (
          <div className="md:self-center shrink-0 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm text-xs space-y-1 text-slate-700 dark:text-slate-300 max-w-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 text-[11px] uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <ArrowRight className="w-3.5 h-3.5" />
              What to do next
            </div>
            <div className="text-[12px] text-slate-600 dark:text-slate-400 leading-snug">{nextStep}</div>
          </div>
        )}
      </div>

      {/* Subtle Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};
