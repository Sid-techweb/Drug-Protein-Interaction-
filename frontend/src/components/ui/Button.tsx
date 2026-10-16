import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5 shadow-lg',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 hover:from-sky-400 hover:via-blue-500 hover:to-purple-500 text-white shadow-sky-500/20 hover:shadow-sky-500/35 border border-sky-400/30',
    glow: 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] border border-purple-400/40',
    secondary: 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-200 dark:border-slate-700/60 backdrop-blur-md shadow-sm dark:shadow-none',
    outline: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-purple-600 dark:text-sky-400 border border-purple-300 dark:border-sky-500/40 hover:border-purple-500 dark:hover:border-sky-400',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
