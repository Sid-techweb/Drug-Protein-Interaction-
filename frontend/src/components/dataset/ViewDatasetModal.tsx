import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DrugDataset, Drug } from '../../types';
import { drugApi } from '../../api/drugApi';
import { Download, Search, CheckCircle, AlertCircle, Copy, Check, Database, Sparkles, Calendar } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface ViewDatasetModalProps {
  dataset: DrugDataset | null;
  isOpen: boolean;
  onClose: () => void;
  onExportCSV: (dataset: DrugDataset) => void;
}

export const ViewDatasetModal: React.FC<ViewDatasetModalProps> = ({
  dataset,
  isOpen,
  onClose,
  onExportCSV,
}) => {
  const [compounds, setCompounds] = useState<Drug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSmiles, setCopiedSmiles] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && dataset) {
      fetchDatasetCompounds();
    }
  }, [isOpen, dataset, searchQuery]);

  const fetchDatasetCompounds = async () => {
    if (!dataset) return;
    setIsLoading(true);
    try {
      const res = await drugApi.searchDrugs({
        dataset_id: dataset.id,
        search: searchQuery || undefined,
        limit: 100,
      });
      setCompounds(res.items);
    } catch (err: any) {
      console.error('Failed to load dataset compounds:', err);
      let msg = 'Failed to load dataset compounds.';
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data.detail === 'string') {
          msg = data.detail;
        } else if (Array.isArray(data.detail)) {
          msg = data.detail.map((d: any) => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg || d.message}`).join('; ');
        }
      } else if (err.message) {
        msg = err.message;
      }
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (smiles: string) => {
    navigator.clipboard.writeText(smiles);
    setCopiedSmiles(smiles);
    showToast('SMILES copied to clipboard!', 'info');
    setTimeout(() => setCopiedSmiles(null), 2000);
  };

  if (!dataset) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dataset.name}
      subtitle={`Repository Source: ${dataset.source_type} | ID: ${dataset.id.substring(0, 8)}...`}
    >
      <div className="space-y-5 max-w-4xl">
        
        {/* Dataset Metadata Header Box */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Badge variant="purple">
                <Database className="w-3 h-3 mr-1" /> {dataset.source_type}
              </Badge>
              
              {/* Screening Protein Badge */}
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/70 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>This dataset was used for screening this protein.</span>
              </div>
            </div>

            <Button
              variant="glow"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => onExportCSV(dataset)}
            >
              Export CSV
            </Button>
          </div>

          {/* Grid Metadata Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
            <div>
              <span className="text-slate-500 block">Dataset Name:</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">{dataset.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Target Protein:</span>
              <span className="font-bold text-purple-600 dark:text-sky-400">P00533 (EGFR Kinase)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Compounds:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{dataset.total_compounds} molecules</span>
            </div>
            <div>
              <span className="text-slate-500 block">Imported Timestamp:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(dataset.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Filter dataset compounds by Name, ChEMBL ID, or SMILES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>

        {/* Searchable Compounds Table */}
        <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
          {isLoading ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500 animate-pulse">
              Loading dataset compounds from PostgreSQL...
            </div>
          ) : compounds.length > 0 ? (
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Drug Name</th>
                  <th className="py-2.5 px-3">ChEMBL ID</th>
                  <th className="py-2.5 px-3">MW (Da)</th>
                  <th className="py-2.5 px-3">LogP</th>
                  <th className="py-2.5 px-3">Lipinski Status</th>
                  <th className="py-2.5 px-3">Canonical SMILES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 bg-white dark:bg-slate-950">
                {compounds.map((c) => {
                  const chemblId = c.chembl_id || (c.id.startsWith('CHEMBL') ? c.id : undefined);
                  const isPass = c.molecular_weight <= 500 && c.logp <= 5 && c.hbd <= 5 && c.hba <= 10;
                  const displayName = c.name && !c.name.startsWith('Compound CHEMBL')
                    ? c.name
                    : chemblId
                    ? `Compound (${chemblId})`
                    : c.name || `Compound ${c.id}`;

                  return (
                    <tr key={c.id} className="hover:bg-purple-50/40 dark:hover:bg-slate-900/60 transition-colors">
                      {/* Preferred Drug Name */}
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {displayName}
                      </td>

                      {/* ChEMBL ID */}
                      <td className="py-2.5 px-3 text-purple-600 dark:text-sky-400 font-semibold">
                        {chemblId || 'N/A'}
                      </td>

                      {/* MW */}
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {c.molecular_weight}
                      </td>

                      {/* LogP */}
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {c.logp}
                      </td>

                      {/* Lipinski Status */}
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isPass
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                          {isPass ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                          <span>{isPass ? 'Pass' : 'Review'}</span>
                        </span>
                      </td>

                      {/* SMILES */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="truncate max-w-xs text-[11px] text-slate-500 dark:text-slate-400">
                            {c.smiles}
                          </span>
                          <button
                            onClick={() => copyToClipboard(c.smiles)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-200 shrink-0"
                            title="Copy SMILES"
                          >
                            {copiedSmiles === c.smiles ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No matching compounds found in this dataset.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

      </div>
    </Modal>
  );
};
