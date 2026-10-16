import React, { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
  glowColor?: 'cyan' | 'purple' | 'blue' | 'emerald';
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  glowColor = 'cyan',
  className,
  ...props
}) => {
  const baseStyles = 'bg-white dark:bg-slate-950/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 shadow-md dark:shadow-none text-slate-900 dark:text-slate-100';
  
  const interactiveStyles = interactive
    ? 'hover:border-purple-500/40 dark:hover:border-sky-500/40 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-sky-500/10 hover:-translate-y-1 group cursor-pointer'
    : '';

  const glowStyles = {
    cyan: 'before:absolute before:-top-24 before:-right-24 before:w-48 before:h-48 before:bg-sky-500/10 before:rounded-full before:blur-3xl',
    purple: 'before:absolute before:-top-24 before:-right-24 before:w-48 before:h-48 before:bg-purple-500/10 before:rounded-full before:blur-3xl',
    blue: 'before:absolute before:-top-24 before:-right-24 before:w-48 before:h-48 before:bg-blue-500/10 before:rounded-full before:blur-3xl',
    emerald: 'before:absolute before:-top-24 before:-right-24 before:w-48 before:h-48 before:bg-emerald-500/10 before:rounded-full before:blur-3xl',
  };

  return (
    <div
      className={twMerge(clsx(baseStyles, glowStyles[glowColor], interactiveStyles, className))}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};
