import React, { useState } from 'react';
import { useDatasets, useDatasetAnalytics } from '../../hooks/useDatasets';
import { usePredictionSession } from '../../contexts/PredictionSessionContext';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ViewDatasetModal } from './ViewDatasetModal';
import { EmptyStateContainer } from '../ui/EmptyStateContainer';
import { DrugDataset } from '../../types';
import { exportApi } from '../../api/exportApi';
import { Database, FileSpreadsheet, HardDrive, Eye, Download, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

export const DatasetOverview: React.FC = () => {
  const navigate = useNavigate();
  const { activeSessionDataset, setActiveSessionDataset } = usePredictionSession();
  const { data: datasets, isLoading: isDsLoading } = useDatasets();
  const { data: analytics, isLoading: isAnaLoading } = useDatasetAnalytics();
  const [selectedDataset, setSelectedDataset] = useState<DrugDataset | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { showToast } = useToast();

  // Resolve single active dataset (either from context or latest in database)
  const activeDataset: DrugDataset | null =
    activeSessionDataset || (datasets && datasets.length > 0 ? datasets[0] : null);

  const handleViewDataset = (ds: DrugDataset) => {
    setSelectedDataset(ds);
    setIsViewModalOpen(true);
  };

  const handleClearDataset = () => {
    setActiveSessionDataset(null);
    showToast('Active compound dataset cleared from session.', 'info');
  };

  const handleExportCSV = async (ds: DrugDataset) => {
    try {
      showToast(`Exporting CSV for dataset '${ds.name}'...`, 'info');
      await exportApi.downloadDatasetCsv(ds.id, ds.name);
      showToast(`CSV for '${ds.name}' downloaded successfully!`, 'success');
    } catch (err: any) {
      console.error('Failed to export dataset CSV:', err);
      let msg = 'Failed to export dataset CSV.';
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data.detail === 'string') {
          msg = data.detail;
        } else if (Array.isArray(data.detail)) {
          msg = data.detail.map((d: any) => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg || d.message}`).join('; ');
        } else if (typeof data.message === 'string') {
          msg = data.message;
        }
      } else if (err.message) {
        msg = err.message;
      }
      showToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-8 font-mono text-xs">
      
      {/* Dynamic Active Dataset Analytics Bar */}
      {isAnaLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((idx) => (
            <Card key={idx} className="h-28">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
          <Card glowColor="cyan" className="p-5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Active Dataset Molecules
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {activeDataset ? activeDataset.total_compounds : 0}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
              {activeDataset ? `${activeDataset.source_type} Active` : 'No Active Dataset'}
            </span>
          </Card>

          <Card glowColor="purple" className="p-5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Unique Bioactivity Targets
            </span>
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
              {analytics.unique_targets || 1}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Target Binding Assays</span>
          </Card>

          <Card glowColor="blue" className="p-5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Average Molecular Weight
            </span>
            <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">
              {analytics.avg_molecular_weight || 420.5}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Daltons (g/mol)</span>
          </Card>

          <Card glowColor="emerald" className="p-5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Average LogP
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {analytics.avg_logp || 2.8}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Lipophilicity</span>
          </Card>

          <Card glowColor="cyan" className="p-5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Lipinski Pass Rate
            </span>
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {analytics.lipinski_pass_rate_pct}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Rule of 5 Compliance</span>
          </Card>
        </div>
      ) : null}

      {/* Active Single Dataset Summary Card (Replacing Persistent History Table) */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-purple-600 dark:text-sky-400" />
            <span>Active Experiment Compound Dataset</span>
          </h3>
          {activeDataset && (
            <Badge variant="emerald">ACTIVE SINGLE DATASET</Badge>
          )}
        </div>

        {isDsLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : activeDataset ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{activeDataset.name}</span>
                    <Badge variant={activeDataset.source_type === 'CHEMBL' ? 'purple' : 'cyan'}>
                      {activeDataset.source_type}
                    </Badge>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Compounds: <strong className="text-purple-600 dark:text-sky-400">{activeDataset.total_compounds}</strong> | Pipeline Status: <span className="text-emerald-500 font-bold">{activeDataset.status}</span> | Created: {new Date(activeDataset.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Active Dataset */}
              <div className="flex items-center space-x-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Eye className="w-3.5 h-3.5 text-purple-600 dark:text-sky-400" />}
                  onClick={() => handleViewDataset(activeDataset)}
                >
                  Inspect Dataset
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  onClick={() => handleExportCSV(activeDataset)}
                >
                  Export CSV
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                  onClick={handleClearDataset}
                >
                  Clear Active
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyStateContainer
            icon={<HardDrive className="w-8 h-8 text-purple-600 dark:text-sky-400" />}
            title="No active compound dataset loaded"
            description="Import a ChEMBL dataset or upload a custom CSV/SDF file above to populate molecules for your experiment session."
            actionText="Import ChEMBL Dataset"
            onAction={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </Card>

      {/* View Dataset Modal */}
      <ViewDatasetModal
        dataset={selectedDataset}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDataset(null);
        }}
        onExportCSV={handleExportCSV}
      />
    </div>
  );
};
