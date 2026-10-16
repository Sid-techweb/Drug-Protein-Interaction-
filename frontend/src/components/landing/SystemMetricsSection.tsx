import React from 'react';
import { useSystemMetrics } from '../../hooks/useSystemMetrics';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';
import { Activity, Database, Cpu, Zap, Award } from 'lucide-react';

export const SystemMetricsSection: React.FC = () => {
  const { data: metrics, isLoading, isError, refetch } = useSystemMetrics();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CAPACITY':
        return <Database className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'TELEMETRY':
        return <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'PERFORMANCE':
        return <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'ACCURACY':
        return <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <section id="metrics" className="py-16 relative z-10 border-y border-slate-200 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <Badge variant="cyan" className="mb-2">API-DRIVEN SYSTEM TELEMETRY</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Live Platform System Metrics & Capacity
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 md:mt-0 font-mono flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>FastAPI PostgreSQL Telemetry Stream</span>
          </p>
        </div>

        {/* Loading State Skeleton Cards */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((idx) => (
              <Card key={idx} className="h-32 flex flex-col justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-16" />
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/20 text-center py-8">
            <p className="text-sm text-rose-800 dark:text-rose-300 font-medium mb-3">
              Unable to connect to FastAPI PostgreSQL telemetry endpoint.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-semibold bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 rounded-xl hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors"
            >
              Retry Database Fetch
            </button>
          </Card>
        )}

        {/* Live Metrics Grid */}
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {metrics.map((m) => (
              <Card key={m.id} interactive glowColor="cyan" className="p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {getCategoryIcon(m.category)}
                  </div>
                  <Badge variant={m.status === 'ONLINE' || m.status === 'OPTIMAL' || m.status === 'VERIFIED' ? 'emerald' : 'cyan'}>
                    {m.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono mb-0.5">
                    {m.value_display}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{m.label}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
