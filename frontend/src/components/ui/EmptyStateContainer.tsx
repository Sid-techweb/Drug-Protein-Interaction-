import React from 'react';
import { Button } from './Button';
import { Sparkles, FolderPlus, Search, ArrowRight, Dna, Database } from 'lucide-react';

interface EmptyStateContainerProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyStateContainer: React.FC<EmptyStateContainerProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm my-6">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center mb-4 shadow-inner">
        {icon || <Search className="w-7 h-7" />}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <Button onClick={onAction} variant="primary" size="md">
            <span>{actionText}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}

        {secondaryActionText && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="outline" size="md">
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};
