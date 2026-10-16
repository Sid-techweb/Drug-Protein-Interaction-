import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Drug } from '../../types';
import { Molecule2DViewer } from './Molecule2DViewer';
import { Plus, Check } from 'lucide-react';
import { useAddToCandidateQueue } from '../../hooks/useCandidates';
import { useToast } from '../../contexts/ToastContext';

interface DrugCardProps {
  drug: Drug;
  onInspect: (drug: Drug) => void;
  isQueued?: boolean;
}

export const DrugCard: React.FC<DrugCardProps> = ({ drug, onInspect, isQueued = false }) => {
  const addToQueueMutation = useAddToCandidateQueue();
  const { showToast } = useToast();

  const isLipinskiPass = drug.molecular_weight <= 500 && drug.logp <= 5.0 && drug.hbd <= 5 && drug.hba <= 10;

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueueMutation.mutate(
      { drug_ids: [drug.id] },
      {
        onSuccess: () => {
          showToast(`Added '${drug.name}' to Prediction Candidate Queue!`, 'success');
        },
      }
    );
  };

  return (
    <Card
      interactive
      glowColor="cyan"
      onClick={() => onInspect(drug)}
      className="p-5 flex flex-col justify-between space-y-4"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">{drug.name}</h4>
            <p className="text-xs font-mono text-purple-600 dark:text-sky-400">
              {drug.chembl_id || 'LOCAL-COMPOUND'}
            </p>
          </div>
          <Badge variant={isLipinskiPass ? 'emerald' : 'amber'} className="text-[10px]">
            {isLipinskiPass ? 'Lipinski OK' : 'Violation'}
          </Badge>
        </div>

        {/* 2D Chemical Visualizer */}
        <Molecule2DViewer smiles={drug.smiles} name={drug.name} />

        {/* Property Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-3">
          <div className="bg-slate-50 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">MW:</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">{drug.molecular_weight} Da</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">LogP:</span>
            <span className="text-sky-600 dark:text-sky-400 font-bold">{drug.logp}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">HBD / HBA:</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">{drug.hbd} / {drug.hba}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">TPSA:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{drug.tpsa} Å²</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Formula: {drug.formula}</span>

        <Button
          size="sm"
          variant={isQueued ? 'secondary' : 'glow'}
          onClick={handleAddToQueue}
          disabled={isQueued || addToQueueMutation.isPending}
          icon={isQueued ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
        >
          {isQueued ? 'Queued' : 'Add Queue'}
        </Button>
      </div>

    </Card>
  );
};
