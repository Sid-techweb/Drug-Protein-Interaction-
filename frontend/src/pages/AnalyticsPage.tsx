import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAnalyticsDashboard } from '../hooks/useAnalytics';
import { AnalyticsCharts } from '../components/analytics/AnalyticsCharts';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { RefreshCw } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading, refetch } = useAnalyticsDashboard();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Streamlined Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-sky-500/20 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan">PLATFORM TELEMETRY</Badge>
              <span className="text-xs text-slate-500 font-mono font-medium">(Executive Analytics Engine)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Real-Time Virtual Screening Analytics
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-mono">
              Quantitative telemetry for target proteins, drug datasets, AI model inferences, and quantum QUBO solver runs.
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-purple-600 dark:text-sky-400 text-xs font-mono font-semibold rounded-xl border border-slate-200 dark:border-slate-800 transition-colors shrink-0 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Analytics Charts & KPI Grid */}
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : analytics ? (
          <AnalyticsCharts data={analytics} />
        ) : (
          <Card glowColor="cyan" className="p-12 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
            No telemetry data available.
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
};
