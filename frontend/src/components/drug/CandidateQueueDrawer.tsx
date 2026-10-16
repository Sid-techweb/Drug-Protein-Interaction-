import React, { useState, useEffect } from 'react';
import { useCandidateQueue, useRemoveFromCandidateQueue, useClearCandidateQueue } from '../../hooks/useCandidates';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Sparkles, Trash2, Zap, X, ArrowRight, RotateCcw } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

export const CandidateQueueDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: queue, isLoading } = useCandidateQueue();
  const removeMutation = useRemoveFromCandidateQueue();
  const clearMutation = useClearCandidateQueue();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleRemove = (candidateId: string, name: string) => {
    removeMutation.mutate(candidateId, {
      onSuccess: () => {
        showToast(`Removed '${name}' from candidate queue.`, 'info');
      },
    });
  };

  const handleClear = async () => {
    try {
      await clearMutation.mutateAsync();
      setIsOpen(false);
      showToast('Candidate queue cleared for new session.', 'info');
    } catch (e) {
      showToast('Failed to clear candidate queue.', 'error');
    }
  };

  const queueCount = queue?.length || 0;

  // If no compounds in queue, hide floating toggle button and drawer
  if (isLoading || !queue || queueCount === 0) {
    return null;
  }

  return (
    <>
      {/* 1. Floating Toggle Button (Visible when drawer is CLOSED) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-purple-600/30 hover:scale-105 transition-all duration-200 group cursor-pointer border border-purple-400/30"
          aria-label="Open Prediction Candidate Queue"
        >
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
          <span>Prediction Candidate Queue</span>
          <span className="px-2 py-0.5 bg-purple-800 text-white rounded-full text-[11px] font-mono font-black border border-purple-400/40">
            {queueCount}
          </span>
        </button>
      )}

      {/* 2. Slide-over Drawer Panel & Backdrop (Visible when drawer is OPEN) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop Overlay Click to Close */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          />

          {/* Slide-over Content Container */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300 text-slate-900 dark:text-slate-100">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/10 dark:bg-amber-400/10 rounded-xl text-amber-500">
                  <Zap className="w-5 h-5 fill-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Candidate Queue</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Current Session Compounds</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={clearMutation.isPending}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1 text-[11px] font-mono"
                  title="Clear entire queue"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
                <Badge variant="purple">{queueCount} Queued</Badge>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close Candidate Queue Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Candidate List Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm hover:border-purple-300 dark:hover:border-purple-800 transition-colors"
                >
                  <div className="overflow-hidden mr-3">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{item.drug?.name || 'Queued Compound'}</p>
                    <p className="text-[11px] font-mono text-purple-600 dark:text-sky-400 truncate mt-0.5">
                      {item.drug?.chembl_id || 'LOCAL'} | MW: {item.drug?.molecular_weight} Da
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      SMILES: {item.drug?.smiles}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id, item.drug?.name || 'Compound')}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                    title="Remove candidate from queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Drawer Footer Action CTA */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono text-center">
                Step 4 AI Binding Affinity models will evaluate these candidate drugs.
              </p>

              <Button
                variant="glow"
                size="md"
                className="w-full justify-center"
                icon={<Sparkles className="w-4 h-4" />}
                onClick={() => {
                  setIsOpen(false);
                  navigate('/predictions');
                }}
              >
                <span>Proceed to AI Predictions (Step 4)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
