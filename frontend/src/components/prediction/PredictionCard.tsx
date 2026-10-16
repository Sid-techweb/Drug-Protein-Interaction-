import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DTIPrediction, calculateCompositeDrugScore, getLipinskiStatus } from '../../types';
import { Eye, Clock, Cpu, CheckCircle, AlertCircle, XCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ScientistValidationRecord } from '../../api/validationApi';

interface PredictionCardProps {
  prediction: DTIPrediction;
  onInspectExplainability: (prediction: DTIPrediction) => void;
  rank?: number;
  validationRecord?: ScientistValidationRecord;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  onInspectExplainability,
  rank,
  validationRecord
}) => {
  const navigate = useNavigate();
  const probPct = Math.round(prediction.interaction_probability * 100);
  const confidencePct = Math.round(prediction.confidence_score * 100);
  const status = prediction.prediction_status;

  const drugScore = calculateCompositeDrugScore(prediction);
  const lipinski = getLipinskiStatus(prediction.drug);

  const statusColors: Record<string, 'emerald' | 'cyan' | 'purple' | 'rose'> = {
    HIGH_AFFINITY_BINDER: 'emerald',
    MODERATE_BINDER: 'cyan',
    WEAK_BINDER: 'purple',
    REJECTED: 'rose',
  };

  return (
    <Card glowColor={validationRecord?.decision === 'APPROVED' ? 'emerald' : status === 'HIGH_AFFINITY_BINDER' ? 'purple' : 'cyan'} className="p-6 space-y-4 flex flex-col justify-between">
      
      <div className="space-y-4">
        {/* Previously Validated Green Banner */}
        {validationRecord && validationRecord.decision === 'APPROVED' && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-semibold shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Previously Validated ({validationRecord.scientist_name})</span>
          </div>
        )}

        {validationRecord && validationRecord.decision === 'REJECTED' && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/60 rounded-xl text-rose-900 dark:text-rose-200 text-xs font-semibold shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="truncate">Previously Rejected ({validationRecord.scientist_name})</span>
          </div>
        )}
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3">
            {rank !== undefined && (
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/40 flex items-center justify-center font-mono font-extrabold text-purple-700 dark:text-purple-300 text-sm shrink-0">
                #{rank}
              </div>
            )}
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {prediction.drug?.name && !prediction.drug.name.startsWith('Compound CHEMBL')
                  ? prediction.drug.name
                  : prediction.drug?.chembl_id === 'CHEMBL939'
                  ? 'Gefitinib'
                  : prediction.drug?.chembl_id === 'CHEMBL1173655'
                  ? 'Osimertinib'
                  : prediction.drug?.chembl_id === 'CHEMBL941'
                  ? 'Imatinib'
                  : prediction.drug?.chembl_id === 'CHEMBL554'
                  ? 'Erlotinib'
                  : prediction.drug?.chembl_id === 'CHEMBL535'
                  ? 'Doxorubicin'
                  : prediction.drug?.name || (prediction.drug?.chembl_id ? `Compound (${prediction.drug.chembl_id})` : `Compound ${prediction.drug_id}`)}
              </h4>
              <p className="text-xs font-mono text-purple-600 dark:text-sky-400 mt-0.5">
                {prediction.drug?.chembl_id ? `ChEMBL: ${prediction.drug.chembl_id}` : `Target: ${prediction.protein?.name || prediction.protein_id}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1">
            <Badge variant={statusColors[status] || 'cyan'}>
              {status.replace(/_/g, ' ')}
            </Badge>
            {/* Lipinski Status Badge */}
            <span className={`inline-flex items-center space-x-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
              lipinski.status === 'PASS'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : lipinski.status === 'WARNING'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}>
              {lipinski.status === 'PASS' ? (
                <CheckCircle className="w-3 h-3 text-emerald-500" />
              ) : lipinski.status === 'WARNING' ? (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              ) : (
                <XCircle className="w-3 h-3 text-rose-500" />
              )}
              <span>
                {lipinski.status === 'PASS'
                  ? 'Pass'
                  : lipinski.status === 'WARNING'
                  ? 'Warning (1)'
                  : `Fail (${lipinski.violations})`}
              </span>
            </span>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 font-mono text-center">
          <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase">Probability</span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400">{probPct}%</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase">pKd Affinity</span>
            <span className="text-lg font-black text-sky-600 dark:text-sky-400">{prediction.binding_affinity_pkd}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase">Drug Score</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{drugScore}/100</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase">Confidence</span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{confidencePct}%</span>
          </div>
        </div>

        {/* Probability Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Neural Binding Probability</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">{probPct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-purple-500 to-indigo-500 transition-all duration-700 rounded-full"
              style={{ width: `${probPct}%` }}
            />
          </div>
        </div>

        {/* Explainability Summary Box */}
        <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between text-purple-900 dark:text-purple-200 font-semibold text-[11px]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Explainability Summary
            </span>
            <button
              onClick={() => onInspectExplainability(prediction)}
              className="text-purple-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 text-[10px] font-mono"
            >
              <Eye className="w-3 h-3" />
              <span>Atom Map & Heatmap</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
            High attention scores mapped to binding pocket residues and aromatic pharmacophores.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
          <Clock className="w-3 h-3 text-purple-500" />
          <span>{prediction.inference_time_ms} ms</span>
        </div>

        <Button
          size="sm"
          variant="glow"
          icon={<Cpu className="w-3.5 h-3.5 text-indigo-400" />}
          onClick={() => navigate('/quantum')}
        >
          Send to Quantum Optimization
        </Button>
      </div>

    </Card>
  );
};
