import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useUserReports, useGenerateReport } from '../hooks/useReports';
import { usePredictionHistory } from '../hooks/usePredictions';
import { ReportViewerModal } from '../components/reports/ReportViewerModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyStateContainer } from '../components/ui/EmptyStateContainer';
import { ScientificReport } from '../types';
import { FileText, Sparkles, FileSpreadsheet, Code, Plus, Download } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { exportApi } from '../api/exportApi';
import { useNavigate } from 'react-router-dom';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reportTitle, setReportTitle] = useState('EGFR Drug Candidate Screening Report');
  const [selectedReport, setSelectedReport] = useState<ScientificReport | null>(null);

  const { data: reports, isLoading } = useUserReports();
  const { data: predictions } = usePredictionHistory();
  const generateMutation = useGenerateReport();
  const { showToast } = useToast();

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!predictions || predictions.length === 0) {
      showToast('No AI prediction data available to assemble report. Run predictions first.', 'error');
      return;
    }

    const proteinId = predictions[0].protein_id;
    try {
      const rep = await generateMutation.mutateAsync({
        title: reportTitle,
        protein_id: proteinId,
      });
      setSelectedReport(rep);
      showToast(`Scientific Report '${rep.title}' generated successfully!`, 'success');
    } catch (err: any) {
      showToast('Report generation failed.', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Streamlined Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-purple-500/30 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple">STEP 6 SCIENTIFIC REPORT</Badge>
              <span className="text-xs text-slate-500 font-mono font-medium">(Publication-Grade Manuscript Reports)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Scientific Reports & Multi-Format Exports
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Export completed virtual screening experiments into executive PDF manuscripts, CSV spreadsheets, and machine-readable JSON payloads.
            </div>
          </div>
        </div>

        {/* Generate Report Form */}
        <Card glowColor="purple" className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 font-mono">
            <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Assemble New Scientific Report</span>
          </h3>

          <form onSubmit={handleGenerateReport} className="flex flex-col sm:flex-row gap-4 items-end font-mono text-xs">
            <div className="flex-1">
              <Input
                label="Report Title"
                placeholder="e.g. EGFR Kinase Inhibitor Virtual Screening Campaign"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                required
              />
            </div>

            <button
              type="button"
              onClick={() => navigate('/validation')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all shrink-0"
            >
              Scientist Sign-off (Step 5)
            </button>

            <Button
              type="submit"
              variant="glow"
              disabled={generateMutation.isPending}
              icon={generateMutation.isPending ? <span className="animate-spin">⏳</span> : <Sparkles className="w-4 h-4" />}
            >
              {generateMutation.isPending ? 'Generating Report...' : 'Create Scientific Report'}
            </Button>
          </form>
        </Card>

        {/* Reports History List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-sky-400" />
            <span>Generated Scientific Manuscript Reports</span>
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((idx) => (
                <Skeleton key={idx} className="h-20 w-full" />
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((rep) => (
                <Card
                  key={rep.id}
                  interactive
                  glowColor="purple"
                  onClick={() => setSelectedReport(rep)}
                  className="p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">{rep.title}</h4>
                    <Badge variant="purple">Scientific Report</Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-mono">{rep.summary_text}</p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono">
                    <span className="text-slate-500">{new Date(rep.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await exportApi.downloadPdf(rep.id);
                            showToast('Exporting PDF document...', 'info');
                          } catch (err: any) {
                            showToast(err.message || 'PDF export failed', 'error');
                          }
                        }}
                        className="text-purple-600 dark:text-purple-400 hover:underline flex items-center space-x-1 px-2 py-1 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF Report</span>
                      </button>

                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await exportApi.downloadCsv(rep.id);
                            showToast('Exporting CSV dataset...', 'info');
                          } catch (err: any) {
                            showToast(err.message || 'CSV export failed', 'error');
                          }
                        }}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        <span>CSV Data</span>
                      </button>

                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await exportApi.downloadJson(rep.id);
                            showToast('Exporting JSON payload...', 'info');
                          } catch (err: any) {
                            showToast(err.message || 'JSON export failed', 'error');
                          }
                        }}
                        className="text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1 px-2 py-1 bg-sky-50 dark:bg-sky-950/40 rounded-lg border border-sky-200 dark:border-sky-800"
                      >
                        <Code className="w-3 h-3" />
                        <span>JSON</span>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyStateContainer
              icon={<FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
              title="No scientific reports generated yet"
              description="Assemble your first scientific report above to download full PDF, CSV, and JSON results."
            />
          )}
        </div>

        {/* Report Viewer Modal */}
        <ReportViewerModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />

      </div>
    </DashboardLayout>
  );
};
