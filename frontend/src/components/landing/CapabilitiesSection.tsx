import React from 'react';
import { usePlatformCapabilities } from '../../hooks/usePlatformCapabilities';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';
import { Dna, Sparkles, Zap, Box, Eye, UserCheck, CheckCircle2 } from 'lucide-react';

export const CapabilitiesSection: React.FC = () => {
  const { data: capabilities, isLoading } = usePlatformCapabilities();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dna': return <Dna className="w-6 h-6 text-sky-600 dark:text-sky-400" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'Box': return <Box className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
      case 'Eye': return <Eye className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'UserCheck': return <UserCheck className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
      default: return <Dna className="w-6 h-6 text-sky-600 dark:text-sky-400" />;
    }
  };

  return (
    <section id="features" className="py-24 relative z-10 bg-white/80 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" className="mb-3">ENTERPRISE SAAS CAPABILITIES</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Next-Generation Virtual Screening Features
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            Built specifically for pharmaceutical R&D teams and biotechnology research labs requiring high accuracy, explainability, and speed.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <Card key={idx} className="h-56">
                <Skeleton className="h-8 w-12 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* Capabilities Grid */}
        {capabilities && capabilities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((cap) => (
              <Card key={cap.id} interactive glowColor="cyan" className="p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      {getIcon(cap.icon_name)}
                    </div>
                    <Badge variant={cap.category === 'QUANTUM' ? 'amber' : cap.category === 'AI' ? 'purple' : 'cyan'}>
                      {cap.badge_label}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{cap.title}</h3>
                  <p className="text-xs font-semibold text-purple-600 dark:text-sky-400 mb-3">{cap.subtitle}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{cap.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Production Ready API Contract</span>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
