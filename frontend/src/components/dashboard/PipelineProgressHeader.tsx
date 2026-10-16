import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Target, Database, Pill, Sparkles, Cpu, FileText, ChevronRight, ShieldCheck } from 'lucide-react';

interface Step {
  id: number;
  key: string;
  route: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const PIPELINE_STEPS: Step[] = [
  {
    id: 1,
    key: 'screening',
    route: '/screening',
    title: 'STEP 1',
    subtitle: 'Disease Target',
    icon: <Target className="w-4 h-4" />
  },
  {
    id: 2,
    key: 'datasets',
    route: '/datasets',
    title: 'STEP 2',
    subtitle: 'Drug Library',
    icon: <Database className="w-4 h-4" />
  },
  {
    id: 3,
    key: 'predictions',
    route: '/predictions',
    title: 'STEP 3',
    subtitle: 'AI Screening',
    icon: <Sparkles className="w-4 h-4" />
  },
  {
    id: 4,
    key: 'quantum',
    route: '/quantum',
    title: 'STEP 4',
    subtitle: 'Quantum Optimization',
    icon: <Cpu className="w-4 h-4" />
  },
  {
    id: 5,
    key: 'reports',
    route: '/reports',
    title: 'STEP 5',
    subtitle: 'Scientific Report',
    icon: <FileText className="w-4 h-4" />
  }
];

export const PipelineProgressHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Find active step index based on current path
  const currentStepIndex = PIPELINE_STEPS.findIndex(step => location.pathname === step.route);

  // If on another route (like /workflow, /history, /analytics), default to 0 or leave neutral
  const activeStepId = currentStepIndex !== -1 ? PIPELINE_STEPS[currentStepIndex].id : 0;

  return (
    <div className="w-full bg-white dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 shadow-sm backdrop-blur-md mb-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PIPELINE_STEPS.map((step, idx) => {
            const isActive = activeStepId === step.id;
            const isCompleted = activeStepId > step.id || (activeStepId === 0 && location.pathname === '/reports');
            const isPending = activeStepId < step.id && !isCompleted;

            return (
              <React.Fragment key={step.id}>
                {/* Step Item Button */}
                <button
                  onClick={() => navigate(step.route)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all duration-200 shrink-0 text-left cursor-pointer group ${
                    isActive
                      ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-500/50 shadow-sm font-semibold scale-[1.02]'
                      : isCompleted
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100/80'
                      : 'bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {/* Step Status Icon / Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                        : isCompleted
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </div>

                  {/* Step Label */}
                  <div className="flex flex-col">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider leading-none ${
                        isActive
                          ? 'text-purple-700 dark:text-purple-300'
                          : isCompleted
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span
                      className={`text-xs font-medium whitespace-nowrap mt-0.5 ${
                        isActive
                          ? 'text-slate-900 dark:text-white font-bold'
                          : isCompleted
                          ? 'text-emerald-950 dark:text-emerald-200'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {step.subtitle}
                    </span>
                  </div>
                </button>

                {/* Arrow Connector between steps */}
                {idx < PIPELINE_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0 hidden lg:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
