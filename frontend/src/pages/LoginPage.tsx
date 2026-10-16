import React from 'react';
import { ScientificBackground } from '../components/landing/ScientificBackground';
import { LoginForm } from '../components/auth/LoginForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const LoginPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-300">
      <ScientificBackground />

      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/80 dark:bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-md transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>
        <ThemeToggle showLabel={true} />
      </div>

      <div className="relative z-10 w-full flex justify-center pt-12 sm:pt-0">
        <LoginForm />
      </div>
    </div>
  );
};
