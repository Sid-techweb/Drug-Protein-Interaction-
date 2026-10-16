import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-between p-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
        isDark 
          ? 'bg-slate-900 border border-slate-800 text-amber-400 hover:border-slate-700 shadow-inner' 
          : 'bg-slate-100 border border-slate-300 text-purple-600 hover:bg-slate-200 shadow-sm'
      } ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      <div className="flex items-center space-x-1.5 px-1">
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:-rotate-12" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 hover:rotate-90" />
        )}
        {showLabel && (
          <span className="text-xs font-semibold font-mono">
            {isDark ? 'Dark' : 'Light'}
          </span>
        )}
      </div>
    </button>
  );
};
