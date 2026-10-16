import React, { useState } from 'react';
import { useTechStack } from '../../hooks/useTechStack';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { TechStackItem } from '../../types';
import { Code2, Server, BrainCircuit, Zap, Box, Database, ExternalLink, ShieldCheck } from 'lucide-react';

export const TechStackSection: React.FC = () => {
  const { data: techItems, isLoading } = useTechStack();
  const [selectedTech, setSelectedTech] = useState<TechStackItem | null>(null);

  const getTechIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2': return <Code2 className="w-6 h-6 text-sky-600 dark:text-sky-400" />;
      case 'Server': return <Server className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'BrainCircuit': return <BrainCircuit className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'Box': return <Box className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
      case 'Database': return <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      default: return <Code2 className="w-6 h-6 text-sky-600 dark:text-sky-400" />;
    }
  };

  return (
    <section id="technology" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="blue" className="mb-3">INTERACTIVE TECHNOLOGY SPECIFICATIONS</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Enterprise Modular Tech Architecture
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            Click any technology card to view architectural roles, deep framework specifications, and integration contracts.
          </p>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <Card key={idx} className="h-48">
                <Skeleton className="h-8 w-12 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-12 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* Interactive Cards */}
        {techItems && techItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techItems.map((tech) => (
              <Card
                key={tech.id}
                interactive
                glowColor="blue"
                onClick={() => setSelectedTech(tech)}
                className="p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      {getTechIcon(tech.icon_name)}
                    </div>
                    <Badge variant="cyan">{tech.category}</Badge>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{tech.name}</h3>
                  <p className="text-xs font-mono text-purple-600 dark:text-purple-400 mb-3">{tech.version}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{tech.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-purple-600 dark:text-sky-400 font-semibold group-hover:text-purple-700 dark:group-hover:text-sky-300">
                  <span>Inspect Tech Specs</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Detailed Modal Window */}
        {selectedTech && (
          <Modal
            isOpen={!!selectedTech}
            onClose={() => setSelectedTech(null)}
            title={selectedTech.name}
            subtitle={`${selectedTech.category} Layer | ${selectedTech.version}`}
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Architecture Role
                </h4>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedTech.architecture_role}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Technical Specifications & Framework Features
                </h4>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 font-mono text-xs">
                  {Object.entries(selectedTech.modal_specs).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-200 dark:border-slate-900 last:border-0">
                      <span className="text-purple-600 dark:text-sky-400 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-slate-800 dark:text-slate-200 mt-0.5 sm:mt-0 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-300 dark:border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Strictly modular enterprise architecture with zero static shortcut bindings.</span>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </section>
  );
};
