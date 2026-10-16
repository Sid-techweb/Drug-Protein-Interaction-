import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Cpu, CheckCircle, AlertCircle, ExternalLink, XCircle } from 'lucide-react';
import { DTIPrediction, calculateCompositeDrugScore, getLipinskiStatus } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';

interface CandidateDrawerProps {
  prediction: DTIPrediction | null;
  isOpen: boolean;
  onClose: () => void;
  onInspectExplainability?: (prediction: DTIPrediction) => void;
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  prediction,
  isOpen,
  onClose,
  onInspectExplainability
}) => {
  const navigate = useNavigate();

  if (!prediction) return null;

  const probPct = Math.round(prediction.interaction_probability * 100);
  const confidencePct = Math.round(prediction.confidence_score * 100);
  const drug = prediction.drug;
  const chemblId = drug?.chembl_id || (prediction.drug_id?.startsWith('CHEMBL') ? prediction.drug_id : 'CHEMBL-REF');
  const drugName = drug?.name && !drug.name.startsWith('Compound CHEMBL')
    ? drug.name
    : chemblId !== 'CHEMBL-REF'
    ? `Compound (${chemblId})`
    : `Compound ${prediction.drug_id}`;

  const lipinski = getLipinskiStatus(drug);
  const drugScore = calculateCompositeDrugScore(prediction);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    prediction.prediction_status === 'HIGH_AFFINITY_BINDER'
                      ? 'emerald'
                      : prediction.prediction_status === 'MODERATE_BINDER'
                      ? 'cyan'
                      : prediction.prediction_status === 'WEAK_BINDER'
                      ? 'purple'
                      : 'rose'
                  }>
                    {prediction.prediction_status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs font-mono text-purple-600 dark:text-sky-400">ChEMBL: {chemblId}</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {drugName}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 font-mono text-xs">
              
              {/* Primary Metric Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase mb-1">Composite Score</span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{drugScore}/100</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase mb-1">Binding pKd</span>
                  <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{prediction.binding_affinity_pkd}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase mb-1">Probability</span>
                  <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400">{probPct}%</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase mb-1">Confidence</span>
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{confidencePct}%</span>
                </div>
              </div>

              {/* Chemical Structure Representation */}
              <div className="space-y-2">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                  Canonical SMILES Representation
                </span>
                <div className="bg-slate-900 text-sky-400 p-3 rounded-xl border border-slate-800 font-mono text-[11px] break-all leading-relaxed">
                  {drug?.smiles || 'N/A'}
                </div>
              </div>

              {/* Physicochemical Properties Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Physicochemical ADMET Properties
                  </span>
                  <span className={`inline-flex items-center space-x-1 text-[10px] px-2.5 py-0.5 rounded-full border ${
                    lipinski.status === 'PASS'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : lipinski.status === 'WARNING'
                      ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  }`}>
                    {lipinski.status === 'PASS' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : lipinski.status === 'WARNING' ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    <span>
                      {lipinski.status === 'PASS'
                        ? 'Lipinski Compliant'
                        : lipinski.status === 'WARNING'
                        ? 'Lipinski Warning (1 Violation)'
                        : `Lipinski Fail (${lipinski.violations} Violations)`}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-500">Molecular Weight:</span>
                    <strong className="text-slate-900 dark:text-white">{drug?.molecular_weight || 420.5} Da</strong>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-500">LogP Lipophilicity:</span>
                    <strong className="text-slate-900 dark:text-white">{drug?.logp || 2.8}</strong>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-500">H-Bond Donors (HBD):</span>
                    <strong className="text-slate-900 dark:text-white">{drug?.hbd ?? 2}</strong>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-500">H-Bond Acceptors (HBA):</span>
                    <strong className="text-slate-900 dark:text-white">{drug?.hba ?? 5}</strong>
                  </div>
                </div>
              </div>

              {/* Explainable AI Heatmap Banner */}
              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Explainable AI (XAI) Pocket Mapping
                  </span>
                  {onInspectExplainability && (
                    <button
                      onClick={() => {
                        onClose();
                        onInspectExplainability(prediction);
                      }}
                      className="text-purple-600 dark:text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Open Heatmap</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Deep cross-attention weights map high affinity interactions to binding pocket residues with {(confidencePct).toFixed(1)}% neural confidence.
                </p>
              </div>

            </div>

            {/* Drawer Action Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>

              <Button
                variant="glow"
                size="sm"
                icon={<Cpu className="w-4 h-4 text-indigo-300" />}
                onClick={() => {
                  onClose();
                  navigate('/quantum');
                }}
              >
                Proceed to Quantum Optimization
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
