import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ScientificReport } from '../../types';
import { exportApi } from '../../api/exportApi';
import { FileText, FileSpreadsheet, Code, Sparkles } from 'lucide-react';

import { useToast } from '../../contexts/ToastContext';

interface ReportViewerModalProps {
  report: ScientificReport | null;
  onClose: () => void;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ report, onClose }) => {
  const { showToast } = useToast();
  if (!report) return null;

  const data = report.report_data_json;
  const protein = data?.protein || {};
  const candidates = data?.top_candidates || [];

  return (
    <Modal
      isOpen={!!report}
      onClose={onClose}
      title={report.title}
      subtitle={`Generated Timestamp: ${new Date(report.created_at).toLocaleString()}`}
    >
      <div className="space-y-6">
        
        {/* Export Download Triggers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Multi-Format Scientific Export:</span>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="glow"
              icon={<FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
              onClick={async () => {
                try {
                  await exportApi.downloadPdf(report.id);
                  showToast('Exporting PDF / Markdown report document...', 'info');
                } catch (err: any) {
                  showToast(err.message || 'PDF export failed', 'error');
                }
              }}
            >
              Export PDF / Markdown
            </Button>

            <Button
              size="sm"
              variant="secondary"
              icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              onClick={async () => {
                try {
                  await exportApi.downloadCsv(report.id);
                  showToast('Exporting CSV candidate dataset...', 'info');
                } catch (err: any) {
                  showToast(err.message || 'CSV export failed', 'error');
                }
              }}
            >
              Export CSV
            </Button>

            <Button
              size="sm"
              variant="outline"
              icon={<Code className="w-3.5 h-3.5 text-purple-600 dark:text-sky-400" />}
              onClick={async () => {
                try {
                  await exportApi.downloadJson(report.id);
                  showToast('Exporting JSON report payload...', 'info');
                } catch (err: any) {
                  showToast(err.message || 'JSON export failed', 'error');
                }
              }}
            >
              Export JSON
            </Button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-500/30 text-xs font-mono space-y-2">
          <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-bold">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Virtual Screening Executive Summary</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{report.summary_text}</p>
        </div>

        {/* Target Protein Metadata */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">Target Protein Specification</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-slate-300">
            <div><span className="text-slate-500 block">Name:</span>{protein.name}</div>
            <div><span className="text-slate-500 block">UniProt:</span>{protein.accession_id || 'N/A'}</div>
            <div><span className="text-slate-500 block">Organism:</span>{protein.organism}</div>
            <div><span className="text-slate-500 block">Length:</span>{protein.length} AA</div>
          </div>
        </div>

        {/* Top Candidate Shortlist */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Selected Molecule Shortlist</h4>
          <div className="max-h-56 overflow-y-auto space-y-2 font-mono text-xs">
            {candidates.map((c: any) => (
              <div key={c.rank} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    #{c.rank} {c.name && !c.name.startsWith('Compound CHEMBL') ? c.name : c.drug_id ? `Compound (${c.drug_id})` : c.name}
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-sky-400 block truncate max-w-sm">
                    {c.chembl_id ? `ChEMBL: ${c.chembl_id} | ` : ''}{c.smiles}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-purple-600 dark:text-purple-400 font-bold block">P(bind): {(c.interaction_probability * 100).toFixed(1)}%</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">pKd: {c.binding_affinity_pkd}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Modal>
  );
};
