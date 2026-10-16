import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Drug } from '../../types';
import { Molecule2DViewer } from './Molecule2DViewer';
import { Copy, Check, Activity, Database } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface DrugDetailsModalProps {
  drug: Drug | null;
  onClose: () => void;
}

export const DrugDetailsModal: React.FC<DrugDetailsModalProps> = ({ drug, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!drug) return null;

  const props = drug.property_rel;
  const fps = drug.fingerprint_rel;

  const handleCopySMILES = () => {
    navigator.clipboard.writeText(drug.smiles);
    setCopied(true);
    showToast('Canonical SMILES copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={!!drug}
      onClose={onClose}
      title={drug.name}
      subtitle={`ChEMBL Identifier: ${drug.chembl_id || 'N/A'} | Formula: ${drug.formula}`}
    >
      <div className="space-y-6">
        
        {/* Top 2D Structure & Quick Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <Molecule2DViewer smiles={drug.smiles} name={drug.name} height={200} />

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant="cyan" className="font-mono">{drug.formula}</Badge>
              <Badge variant={drug.molecular_weight <= 500 ? 'emerald' : 'amber'}>
                MW: {drug.molecular_weight} Da
              </Badge>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Lipinski LogP:</span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">{drug.logp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">H-Bond Donors (HBD):</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">{drug.hbd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">H-Bond Acceptors (HBA):</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">{drug.hba}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">TPSA (Surface Area):</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{drug.tpsa} Å²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Rotatable Bonds:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{drug.rotatable_bonds}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canonical SMILES Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Canonical SMILES Representation
            </span>
            <button
              onClick={handleCopySMILES}
              className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium text-purple-700 dark:text-sky-400 bg-purple-50 dark:bg-sky-500/10 hover:bg-purple-100 dark:hover:bg-sky-500/20 border border-purple-200 dark:border-sky-500/30 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy SMILES'}</span>
            </button>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-purple-900 dark:text-sky-300 break-all select-all tracking-wider">
            {drug.smiles}
          </div>
        </div>

        {/* Bioactivity Assays & Target Information */}
        {drug.targets && drug.targets.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>ChEMBL Bioactivity & Target Assays</span>
            </h4>

            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2 font-mono text-xs">
              {drug.targets.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-slate-900 last:border-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white">{t.target_name}</span>
                    {t.chembl_target_id && (
                      <span className="text-[10px] text-purple-700 dark:text-sky-400 bg-purple-100 dark:bg-sky-500/10 px-2 py-0.5 rounded border border-purple-300 dark:border-sky-500/30">
                        {t.chembl_target_id}
                      </span>
                    )}
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {t.activity_type}: {t.activity_value} {t.activity_units}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Molecular Descriptors & Fingerprints Metadata */}
        {props && fps && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-600 dark:text-sky-400" />
              <span>RDKit Molecular Descriptors & Fingerprints</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Heavy Atom Count</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{props.heavy_atom_count}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Ring Count</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{props.ring_count}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Fraction Csp3</span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{props.fraction_csp3}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Morgan Bit Length</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">2048-bit</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};
