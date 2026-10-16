import React from 'react';
import { useWorkflowStages } from '../../hooks/useWorkflowStages';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';
import {
  Dna,
  BrainCircuit,
  Database,
  Cpu,
  Zap,
  Box,
  Eye,
  UserCheck,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const { data: stages, isLoading } = useWorkflowStages();

  const getStageIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dna': return <Dna className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'BrainCircuit': return <BrainCircuit className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'Database': return <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Box': return <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'Eye': return <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'RefreshCw': return <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default: return <Dna className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
    }
  };

  return (
    <section id="workflow" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="purple" className="mb-3">END-TO-END DISCOVERY PIPELINE</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            9-Stage Quantum AI Virtual Screening Workflow
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            From raw UniProt amino acid sequence input to active learning feedback loops — HelixQ orchestrates deep learning, quantum annealing, and human validation seamlessly.
          </p>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
              <Card key={idx} className="h-44">
                <Skeleton className="h-4 w-20 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-12 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* Dynamic Workflow Grid */}
        {stages && stages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {stages.map((s) => (
              <Card key={s.id} interactive glowColor="purple" className="flex flex-col justify-between p-6">
                <div>
                  {/* Top Badge & Number */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-3 py-1 rounded-full border border-purple-300 dark:border-purple-500/30">
                      {s.badge}
                    </span>
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      {getStageIcon(s.icon_name)}
                    </div>
                  </div>

                  {/* Stage Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{s.title}</h3>
                  <p className="text-xs font-semibold text-purple-600 dark:text-sky-400 mb-3">{s.subtitle}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.description}</p>
                </div>

                {/* Tech Tag */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{s.tech_stack_tag}</span>
                  <ArrowRight className="w-4 h-4 text-purple-500 dark:text-purple-400/60 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
