import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useQueueEmbedding, useEmbeddingStatus } from '../../hooks/useEmbeddingStatus';
import { BrainCircuit, CheckCircle2, Clock, Cpu, Sparkles } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface EmbeddingProgressCardProps {
  proteinId: string;
  proteinName: string;
}

export const EmbeddingProgressCard: React.FC<EmbeddingProgressCardProps> = ({ proteinId, proteinName }) => {
  const [activeJobId, setActiveJobId] = useState<string | undefined>(undefined);
  const queueMutation = useQueueEmbedding();
  const { data: jobStatus } = useEmbeddingStatus(activeJobId);
  const { showToast } = useToast();

  const handleQueueJob = async () => {
    try {
      const job = await queueMutation.mutateAsync(proteinId);
      setActiveJobId(job.id);
      showToast(`Queued ESM-2 3B Embedding Job for '${proteinName}'!`, 'success');
    } catch (err: any) {
      showToast('Failed to queue ESM-2 embedding job.', 'error');
    }
  };

  const status = jobStatus?.status || (queueMutation.isSuccess ? 'COMPLETED' : 'IDLE');

  return (
    <Card glowColor="cyan" className="p-6 space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 rounded-xl text-purple-700 dark:text-purple-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">ESM-2 Transformer Embedding Pipeline Architecture</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Prepares 2560-dimensional contextual sequence representations for virtual screening.</p>
          </div>
        </div>

        <Badge variant={status === 'COMPLETED' ? 'emerald' : status === 'PROCESSING' || status === 'PENDING' ? 'amber' : 'purple'}>
          {status}
        </Badge>
      </div>

      {/* Pipeline Status Steps */}
      <div className="grid grid-cols-3 gap-4">
        
        {/* Step 1: Queue */}
        <div className={`p-4 rounded-xl border transition-all ${
          status !== 'IDLE' 
            ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/30 text-sky-700 dark:text-sky-400' 
            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Stage 01</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Queued in Pipeline</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">PostgreSQL Job Created</p>
        </div>

        {/* Step 2: Processing */}
        <div className={`p-4 rounded-xl border transition-all ${
          status === 'PROCESSING' || status === 'COMPLETED' 
            ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-400' 
            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Stage 02</span>
            <Cpu className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">ESM-2 3B Inference</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">PyTorch Tensor Compute</p>
        </div>

        {/* Step 3: Complete */}
        <div className={`p-4 rounded-xl border transition-all ${
          status === 'COMPLETED' 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Stage 03</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Embeddings Ready</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Virtual Screening Unlocked</p>
        </div>

      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Model: Meta ESM-2 (esm2_t36_3B_UR50D)
        </p>

        <Button
          variant="glow"
          size="sm"
          onClick={handleQueueJob}
          disabled={queueMutation.isPending || status === 'PROCESSING'}
          icon={queueMutation.isPending ? <span className="animate-spin">⏳</span> : <Sparkles className="w-4 h-4" />}
        >
          {status === 'COMPLETED' ? 'Re-Prepare Protein for AI' : 'Prepare Protein for AI'}
        </Button>
      </div>

    </Card>
  );
};
