import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DatasetOverview } from '../components/dataset/DatasetOverview';
import { ChEMBLImportModal } from '../components/dataset/ChEMBLImportModal';
import { FileImportModal } from '../components/dataset/FileImportModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ScientificTooltip } from '../components/ui/ScientificTooltip';
import { Download, Upload, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DatasetManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [isChEMBLModalOpen, setIsChEMBLModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Streamlined Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-sky-500/20 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple">STEP 2 CANDIDATE MOLECULES</Badge>
              <span className="text-xs text-slate-500 font-mono font-medium">(Dataset Repositories)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Import Drug Molecule Libraries
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Import compounds directly from ChEMBL or upload custom CSV/SDF files with automatic <ScientificTooltip term="SMILES" /> extraction.
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Button
              variant="glow"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => setIsChEMBLModalOpen(true)}
            >
              Import ChEMBL Dataset
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={<Upload className="w-4 h-4 text-purple-600 dark:text-sky-400" />}
              onClick={() => setIsFileModalOpen(true)}
            >
              Upload File (CSV/SDF)
            </Button>
          </div>
        </div>

        {/* Dataset Overview & Table */}
        <DatasetOverview />

        {/* Step 2 Completion Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                Step 2 Complete: Drug Dataset Prepared!
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-400">
                Molecules are loaded into your workspace. Proceed to Step 3 to run AI screening.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/predictions')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0"
          >
            <span>Proceed to Step 3: AI Screening</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ChEMBL Modal */}
        <ChEMBLImportModal
          isOpen={isChEMBLModalOpen}
          onClose={() => setIsChEMBLModalOpen(false)}
        />

        {/* File Modal */}
        <FileImportModal
          isOpen={isFileModalOpen}
          onClose={() => setIsFileModalOpen(false)}
        />

      </div>
    </DashboardLayout>
  );
};
