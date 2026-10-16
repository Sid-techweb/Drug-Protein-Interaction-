import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
    info: <Info className="w-5 h-5 text-sky-500 dark:text-sky-400" />,
  };

  const borderColors = {
    success: 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-slate-100',
    error: 'border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-slate-100',
    info: 'border-sky-300 dark:border-sky-500/40 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100',
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-xl shadow-xl dark:shadow-2xl transition-colors duration-300 ${borderColors[type]}`}
    >
      <div className="flex items-center space-x-3">
        {icons[type]}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors ml-4"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
