import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useImportChEMBL } from '../../hooks/useDatasets';
import { usePredictionSession } from '../../contexts/PredictionSessionContext';
import { useToast } from '../../contexts/ToastContext';
import { Download, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface ChEMBLImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChEMBLImportModal: React.FC<ChEMBLImportModalProps> = ({ isOpen, onClose }) => {
  const [datasetName, setDatasetName] = useState('EGFR Kinase Inhibitors Dataset');
  const [query, setQuery] = useState('P00533'); // Default EGFR
  const [maxCompounds, setMaxCompounds] = useState(50);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  const { activeSessionDataset, setActiveSessionDataset } = usePredictionSession();
  const importMutation = useImportChEMBL();
  const { showToast } = useToast();

  const handleExecuteImport = async () => {
    try {
      const res = await importMutation.mutateAsync({
        name: datasetName,
        query,
        max_compounds: maxCompounds,
      });
      setActiveSessionDataset(res);
      showToast(`ChEMBL Dataset '${datasetName}' imported as single active experiment dataset!`, 'success');
      setShowReplaceConfirm(false);
      onClose();
    } catch (err: any) {
      let msg = 'ChEMBL dataset import failed.';
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        msg = 'ChEMBL API request timed out after 60s. Please check your network connection or try a smaller compound limit.';
      } else if (err.response?.data) {
        const data = err.response.data;
        if (typeof data.detail === 'string') {
          msg = data.detail;
        } else if (typeof data.message === 'string') {
          msg = data.message;
        } else if (Array.isArray(data.detail)) {
          msg = data.detail.map((d: any) => d.msg || d.message).join('; ');
        } else {
          msg = JSON.stringify(data);
        }
      } else if (err.message) {
        msg = err.message;
      }
      showToast(msg, 'error');
      setShowReplaceConfirm(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetName || !query) {
      showToast('Please fill in Dataset Name and ChEMBL Target query.', 'error');
      return;
    }

    if (activeSessionDataset) {
      setShowReplaceConfirm(true);
    } else {
      handleExecuteImport();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showReplaceConfirm}
        onClose={() => !importMutation.isPending && onClose()}
        title="Import ChEMBL Compound Dataset"
        subtitle="Executes real-time ChEMBL REST fetch, RDKit preprocessing, and fingerprinting"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <Input
            label="Dataset Name"
            placeholder="e.g. EGFR Inhibitor Assays"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            required
          />

          <Input
            label="UniProt ID, Gene Symbol, or ChEMBL Target ID"
            placeholder="e.g. P00533 (EGFR), TP53, or CHEMBL203"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Maximum Compounds to Retrieve
            </label>
            <input
              type="number"
              min={5}
              max={500}
              value={maxCompounds}
              onChange={(e) => setMaxCompounds(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-purple-500 dark:focus:border-sky-500"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-mono space-y-1">
            <div className="text-purple-600 dark:text-sky-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Automated Processing Pipeline Sequence:</span>
            </div>
            <p>Downloading → Parsing SMILES → RDKit Preprocessing → Morgan 2048-bit FP → MACCS 166-bit → PostgreSQL Storage</p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="ghost" size="sm" type="button" disabled={importMutation.isPending} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              disabled={importMutation.isPending}
              icon={importMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            >
              {importMutation.isPending ? 'Executing Pipeline...' : 'Start ChEMBL Import'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dataset Replacement Confirmation Dialog */}
      <Modal
        isOpen={showReplaceConfirm}
        onClose={() => !importMutation.isPending && setShowReplaceConfirm(false)}
        title="Replace Active Experiment Dataset?"
        subtitle="Confirm Dataset & Session Reset"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Importing a new dataset will replace the current active experiment dataset.</p>
              <p className="text-slate-600 dark:text-slate-400">Previous screening results for the old dataset will be cleared for this session.</p>
            </div>
          </div>

          {importMutation.isPending && (
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/70 rounded-xl flex items-center space-x-3 text-purple-700 dark:text-sky-300 animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin shrink-0 text-purple-600 dark:text-sky-400" />
              <div>
                <p className="font-bold text-xs">Importing & Preprocessing ChEMBL Dataset...</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Executing RDKit SMILES validation & 2048-bit Morgan Fingerprinting.</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" disabled={importMutation.isPending} onClick={() => setShowReplaceConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="glow"
              size="sm"
              disabled={importMutation.isPending}
              icon={importMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              onClick={handleExecuteImport}
            >
              {importMutation.isPending ? 'Importing Dataset...' : 'Continue & Replace Dataset'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
