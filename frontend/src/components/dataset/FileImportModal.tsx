import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUploadDatasetFile } from '../../hooks/useDatasets';
import { usePredictionSession } from '../../contexts/PredictionSessionContext';
import { useToast } from '../../contexts/ToastContext';
import { Upload, FileText, AlertTriangle, Loader2 } from 'lucide-react';

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileImportModal: React.FC<FileImportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const { activeSessionDataset, setActiveSessionDataset } = usePredictionSession();
  const uploadMutation = useUploadDatasetFile();
  const { showToast } = useToast();

  const handleExecuteUpload = async () => {
    if (!selectedFile) return;

    try {
      const res = await uploadMutation.mutateAsync(selectedFile);
      setActiveSessionDataset(res);
      showToast(`Dataset file '${selectedFile.name}' imported as active experiment dataset!`, 'success');
      setShowReplaceConfirm(false);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'File dataset import failed.';
      showToast(msg, 'error');
      setShowReplaceConfirm(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a CSV or SDF file.', 'error');
      return;
    }

    if (activeSessionDataset) {
      setShowReplaceConfirm(true);
    } else {
      handleExecuteUpload();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showReplaceConfirm}
        onClose={() => !uploadMutation.isPending && onClose()}
        title="Upload Local CSV / SDF Dataset"
        subtitle="Parses compound SMILES and calculates RDKit fingerprints & descriptors"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-950/60 transition-colors">
            <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">
              Select or drop .csv / .sdf dataset file
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Must contain 'smiles' and optional 'name' columns.
            </p>

            <input
              type="file"
              accept=".csv,.sdf,.txt"
              id="csv-file-dataset-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor="csv-file-dataset-input"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-purple-600 dark:text-sky-400 rounded-xl cursor-pointer transition-colors border border-slate-300 dark:border-slate-700 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Browse Computer</span>
            </label>

            {selectedFile && (
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-3">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="ghost" size="sm" type="button" disabled={uploadMutation.isPending} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              disabled={!selectedFile || uploadMutation.isPending}
              icon={uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            >
              {uploadMutation.isPending ? 'Processing File...' : 'Upload & Process Dataset'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dataset Replacement Confirmation Dialog */}
      <Modal
        isOpen={showReplaceConfirm}
        onClose={() => !uploadMutation.isPending && setShowReplaceConfirm(false)}
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

          {uploadMutation.isPending && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 rounded-xl flex items-center space-x-3 text-emerald-700 dark:text-emerald-300 animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-bold text-xs">Processing & Fingerprinting Dataset File...</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Parsing SMILES columns & generating RDKit molecular descriptors.</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" disabled={uploadMutation.isPending} onClick={() => setShowReplaceConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="glow"
              size="sm"
              disabled={uploadMutation.isPending}
              icon={uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              onClick={handleExecuteUpload}
            >
              {uploadMutation.isPending ? 'Processing File...' : 'Continue & Replace Dataset'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
