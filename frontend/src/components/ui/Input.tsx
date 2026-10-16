import React, { InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-slate-400 dark:text-slate-500">{icon}</span>}
        <input
          className={twMerge(
            clsx(
              'w-full bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 dark:focus:border-sky-500 focus:ring-1 focus:ring-purple-500 dark:focus:ring-sky-500 transition-all duration-200 shadow-sm dark:shadow-none',
              icon && 'pl-10',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500',
              className
            )
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</span>}
    </div>
  );
};
