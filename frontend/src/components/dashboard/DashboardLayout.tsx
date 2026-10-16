import React, { ReactNode } from 'react';
import { Dna, Activity, LogOut, ShieldCheck, Pill, FolderKanban, Sparkles, Cpu, BarChart2, FileText, History, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { PipelineProgressHeader } from './PipelineProgressHeader';
import { CandidateQueueDrawer } from '../drug/CandidateQueueDrawer';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      
      {/* Left Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between p-5 hidden md:flex shrink-0 transition-colors duration-300">
        <div className="space-y-6">
          
          {/* Logo Header */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-purple-600 p-0.5 shadow-lg shadow-purple-500/10 dark:shadow-sky-500/20">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Dna className="w-5 h-5 text-purple-600 dark:text-sky-400 group-hover:rotate-180 transition-transform duration-700" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">HelixQ</h1>
              <p className="text-[10px] text-purple-600 dark:text-sky-400 font-mono font-bold">Quantum AI Drug Discovery</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)] pr-1 font-mono text-xs">
            
            {/* DASHBOARD */}
            <button
              onClick={() => navigate('/')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isCurrent('/')
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="font-semibold text-xs">Mission Control</span>
            </button>

            {/* SECTION 1: WORKFLOW (STEPS 1-6) */}
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1 pt-3">
              Primary Workflow
            </div>

            <button
              onClick={() => navigate('/screening')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isCurrent('/screening')
                  ? 'bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-xs leading-none">1. Disease Target</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/datasets')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isCurrent('/datasets')
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-xs leading-none">2. Drug Library</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/predictions')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isCurrent('/predictions')
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-xs leading-none">3. AI Screening</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/quantum')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isCurrent('/quantum')
                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-xs leading-none">4. Quantum Optimization</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/validation')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isCurrent('/validation')
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-xs leading-none">5. Scientist Validation</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isCurrent('/reports')
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-xs leading-none">6. Scientific Report</span>
              </div>
            </button>

            {/* SECTION 2: RESEARCH WORKSPACE */}
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1 pt-3">
              Research Tools
            </div>

            <button
              onClick={() => navigate('/analytics')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isCurrent('/analytics')
                  ? 'bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="font-semibold text-xs">Analytics Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/drugs')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isCurrent('/drugs')
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-xs">Drug Explorer</span>
            </button>

            <button
              onClick={() => navigate('/history')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isCurrent('/history')
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-xs">Experiment History</span>
            </button>

          </nav>

        </div>

        {/* User Footer Profile */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-900 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.full_name || 'Researcher'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 dark:bg-slate-900 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-300 dark:border-slate-800 text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navigation Bar Header */}
        <header className="h-16 bg-white/80 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">HelixQ /</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
              {isCurrent('/') ? 'Mission Control Dashboard' : isCurrent('/screening') ? '1. Disease Target (Protein Intelligence)' : isCurrent('/datasets') ? '2. Drug Library (Import Datasets)' : isCurrent('/predictions') ? '3. AI Screening' : isCurrent('/quantum') ? '4. Quantum Optimization' : isCurrent('/validation') ? '5. Scientist Validation' : isCurrent('/reports') ? '6. Scientific Report' : isCurrent('/analytics') ? 'Analytics Dashboard' : isCurrent('/drugs') ? 'Drug Explorer' : 'Experiment History'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Commercial Virtual Screening Engine
            </span>
            <ThemeToggle showLabel={true} />
          </div>
        </header>

        {/* Visual Workflow Pipeline Header */}
        <PipelineProgressHeader />

        {/* Dashboard Content */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

      {/* Global Candidate Queue Drawer */}
      <CandidateQueueDrawer />

    </div>
  );
};
