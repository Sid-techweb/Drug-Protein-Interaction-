import React from 'react';
import { DTIPrediction, calculateCompositeDrugScore, getLipinskiStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Eye, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { getPreferredDrugName } from '../../pages/PredictionPage';
import { ScientistValidationRecord } from '../../api/validationApi';

interface PredictionTableProps {
  predictions: DTIPrediction[];
  valMap: Record<string, ScientistValidationRecord>;
  onSelectPrediction: (prediction: DTIPrediction) => void;
}

export const PredictionTable: React.FC<PredictionTableProps> = ({
  predictions,
  valMap,
  onSelectPrediction
}) => {
  return (
    <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden font-mono text-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/60">
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Drug Candidate</th>
              <th className="py-3 px-4">ChEMBL ID</th>
              <th className="py-3 px-4">Drug Score</th>
              <th className="py-3 px-4">Binding (pKd)</th>
              <th className="py-3 px-4">AI Confidence</th>
              <th className="py-3 px-4">Lipinski</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
            {predictions.map((p, idx) => {
              const { name, chemblId } = getPreferredDrugName(p);
              const confidencePct = Math.round(p.confidence_score * 100);
              const drugScore = calculateCompositeDrugScore(p);

              const lipinski = getLipinskiStatus(p.drug);
              const val = valMap[p.drug_id];

              return (
                <tr
                  key={p.id}
                  onClick={() => onSelectPrediction(p)}
                  className="hover:bg-purple-50/50 dark:hover:bg-slate-900/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <span className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-sky-400 transition-colors">
                      {name}
                    </div>
                    {val && val.decision === 'APPROVED' && (
                      <span className="inline-flex items-center space-x-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle className="w-2.5 h-2.5" />
                        <span>Validated</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-purple-600 dark:text-sky-400">
                    {chemblId}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {drugScore}/100
                  </td>

                  <td className="py-3.5 px-4 font-bold text-purple-600 dark:text-purple-400">
                    {p.binding_affinity_pkd}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {confidencePct}%
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full border ${
                      lipinski.status === 'PASS'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : lipinski.status === 'WARNING'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
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
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={
                      p.prediction_status === 'HIGH_AFFINITY_BINDER'
                        ? 'emerald'
                        : p.prediction_status === 'MODERATE_BINDER'
                        ? 'cyan'
                        : p.prediction_status === 'WEAK_BINDER'
                        ? 'purple'
                        : 'rose'
                    }>
                      {p.prediction_status.replace(/_/g, ' ')}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Eye className="w-3.5 h-3.5 text-purple-600 dark:text-sky-400" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPrediction(p);
                      }}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
