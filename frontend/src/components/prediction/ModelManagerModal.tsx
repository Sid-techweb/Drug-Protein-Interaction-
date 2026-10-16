import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { useActiveModel, useAllModels, useTrainNewModel } from '../../hooks/useModelRegistry';
import { Cpu, RefreshCw } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface ModelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelManagerModal: React.FC<ModelManagerModalProps> = ({ isOpen, onClose }) => {
  const { data: activeModel, isLoading: isActiveLoading } = useActiveModel();
  const { data: allModels } = useAllModels();
  const trainMutation = useTrainNewModel();
  const { showToast } = useToast();

  const handleTrainNewModel = async () => {
    try {
      await trainMutation.mutateAsync({ epochs: 5 });
      showToast('New PyTorch Multimodal DTI model version trained & checkpointed!', 'success');
    } catch (err: any) {
      showToast('Model training failed.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PyTorch Model Registry & Checkpointing Manager"
      subtitle="Manages active neural network checkpoint weights, validation metrics, and version history"
    >
      <div className="space-y-6">
        
        {/* Active Model Summary Card */}
        {isActiveLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : activeModel ? (
          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-purple-200 dark:border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-purple-600 dark:text-sky-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeModel.model_name}</h4>
              </div>
              <Badge variant="emerald">Active Checkpoint {activeModel.version}</Badge>
            </div>

            <div className="grid grid-cols-4 gap-2 font-mono text-center text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">ROC-AUC</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{activeModel.validation_roc_auc}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Accuracy</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{(activeModel.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">F1 Score</span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{activeModel.f1_score}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">BCE Loss</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{activeModel.training_loss}</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 break-all bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              Checkpoint File Path: {activeModel.checkpoint_path}
            </div>
          </div>
        ) : null}

        {/* Retrain Action */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">Trigger Training Pipeline</h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Executes PyTorch epoch loop & generates new .pt checkpoint</p>
          </div>

          <Button
            size="sm"
            variant="glow"
            disabled={trainMutation.isPending}
            onClick={handleTrainNewModel}
            icon={trainMutation.isPending ? <span className="animate-spin">⏳</span> : <RefreshCw className="w-4 h-4" />}
          >
            {trainMutation.isPending ? 'Training Model...' : 'Train New Version'}
          </Button>
        </div>

        {/* Model History List */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trained Version History</h5>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
            {allModels?.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{m.version}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-2">ROC-AUC: {m.validation_roc_auc}</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {new Date(m.trained_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Modal>
  );
};
