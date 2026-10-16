import React from 'react';
import { Card } from './Card';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  glowColor?: 'purple' | 'cyan' | 'blue' | 'emerald';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  glowColor = 'purple',
  onClick
}) => {
  return (
    <Card
      glowColor={glowColor}
      className={`p-4 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight"
        >
          {value}
        </motion.span>
        {trend && (
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mt-1">
          {subtitle}
        </span>
      )}
    </Card>
  );
};
