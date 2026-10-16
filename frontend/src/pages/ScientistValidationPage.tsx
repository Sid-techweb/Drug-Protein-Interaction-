import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useUserProteins } from '../hooks/useProtein';
import { usePredictionHistory } from '../hooks/usePredictions';
import { useProteinValidations, useSubmitValidation } from '../hooks/useValidation';
import { usePredictionSession } from '../contexts/PredictionSessionContext';
import { useQuantumComparison } from '../hooks/useQuantum';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyStateContainer } from '../components/ui/EmptyStateContainer';
import { DTIPrediction, calculateCompositeDrugScore } from '../types';
import { ScientistValidationRecord } from '../api/validationApi';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, ArrowRight, UserCheck, Microscope, FileText } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { getPreferredDrugName } from './PredictionPage';

export const ScientistValidationPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionPredictionIds, activeSessionProtein, sessionQuantumJobId } = usePredictionSession();
  const { data: userProteins } = useUserProteins();
  const activeProtein = activeSessionProtein || (userProteins && userProteins.length > 0 ? userProteins[0] : null);

  const { data: predictions, isLoading: isPredLoading } = usePredictionHistory(activeProtein?.id);
  const { data: validations } = useProteinValidations(activeProtein?.id);
  const { data: comparison } = useQuantumComparison(sessionQuantumJobId || undefined);
  const submitValidationMutation = useSubmitValidation();

  const [selectedCandidate, setSelectedCandidate] = useState<DTIPrediction | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'NEEDS_FURTHER_VALIDATION'>('APPROVED');
  const [method, setMethod] = useState<'IN_VITRO' | 'IN_VIVO' | 'LITERATURE' | 'CLINICAL' | 'OTHER'>('IN_VITRO');
  const [notes, setNotes] = useState('');
  const [confidence, setConfidence] = useState(90);
  const [scientistName, setScientistName] = useState('Dr. Antigravity Lead Researcher');
  const [institution, setInstitution] = useState('HelixQ BioLabs');

  const { showToast } = useToast();

  const valMap: Record<string, ScientistValidationRecord> = {};
  if (validations) {
    validations.forEach((v) => {
      valMap[v.drug_id] = v;
    });
  }

  const qResultMap: Record<string, any> = {};
  if (comparison && comparison.results) {
    comparison.results.forEach((r) => {
      qResultMap[r.drug_id] = r;
    });
  }

  const candidatePool = sessionPredictionIds && predictions
    ? predictions.filter((p) => sessionPredictionIds.includes(p.id))
    : predictions || [];

  const handleOpenModal = (candidate: DTIPrediction) => {
    setSelectedCandidate(candidate);
    const existing = valMap[candidate.drug_id];
    if (existing) {
      setDecision(existing.decision);
      setMethod(existing.experimental_method);
      setNotes(existing.experimental_notes);
      setConfidence(existing.confidence);
      setScientistName(existing.scientist_name);
      setInstitution(existing.institution || '');
    } else {
      setDecision('APPROVED');
      setMethod('IN_VITRO');
      setNotes('');
      setConfidence(90);
    }
  };

  const handleSubmitValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !activeProtein) return;
    if (!notes.trim()) {
      showToast('Experimental Notes are required for expert review.', 'error');
      return;
    }

    try {
      await submitValidationMutation.mutateAsync({
        protein_id: activeProtein.id,
        drug_id: selectedCandidate.drug_id,
        decision,
        experimental_notes: notes,
        experimental_method: method,
        confidence,
        scientist_name: scientistName,
        institution: institution || undefined,
      });

      showToast(`Expert review decision '${decision}' saved for candidate.`, 'success');
      setSelectedCandidate(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to record expert review decision.', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Streamlined Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-emerald-500/30 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="emerald">STEP 5 SCIENTIST VALIDATION</Badge>
              <span className="text-xs text-slate-500 font-mono font-medium">(Human-in-the-Loop Sign-Off)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Scientist Review & Validation Workspace {activeProtein ? `(${activeProtein.name})` : ''}
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Inspect AI binding predictions and Quantum scores. Approve, reject, or override candidate recommendations with empirical lab notes.
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 font-mono">
            <Button
              variant="glow"
              size="sm"
              icon={<FileText className="w-4 h-4 text-white" />}
              onClick={() => navigate('/reports')}
            >
              Proceed to Step 6: Scientific Report
            </Button>
          </div>
        </div>

        {/* Enterprise Review Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Microscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Recommended Binders Review Table</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Total: {candidatePool.length} Candidates
            </span>
          </div>

          {isPredLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : candidatePool.length > 0 ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/60">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Drug Candidate</th>
                        <th className="py-3 px-4">ChEMBL ID</th>
                        <th className="py-3 px-4">Drug Score</th>
                        <th className="py-3 px-4">Quantum Score</th>
                        <th className="py-3 px-4">Validation Status</th>
                        <th className="py-3 px-4">Scientist</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      {candidatePool.map((pred, idx) => {
                        const val = valMap[pred.drug_id];
                        const qRes = qResultMap[pred.drug_id];
                        const { name, chemblId } = getPreferredDrugName(pred);
                        const aiScore = calculateCompositeDrugScore(pred);
                        const quantumScoreDisplay = qRes ? qRes.quantum_score.toFixed(4) : 'Pending Optimization';

                        return (
                          <tr key={pred.id} className="hover:bg-purple-50/50 dark:hover:bg-slate-900/80 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              <span className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold flex items-center justify-center text-[10px]">
                                #{idx + 1}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              {name}
                            </td>

                            <td className="py-3.5 px-4 text-purple-600 dark:text-sky-400">
                              {chemblId}
                            </td>

                            <td className="py-3.5 px-4 font-bold text-purple-600 dark:text-purple-400">
                              {aiScore}/100
                            </td>

                            <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                              {quantumScoreDisplay}
                            </td>

                            <td className="py-3.5 px-4">
                              {val ? (
                                <Badge variant={val.decision === 'APPROVED' ? 'emerald' : val.decision === 'REJECTED' ? 'rose' : 'cyan'}>
                                  {val.decision.replace(/_/g, ' ')}
                                </Badge>
                              ) : (
                                <Badge variant="purple">AI Recommended</Badge>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-slate-500">
                              {val ? val.scientist_name : 'Unassigned'}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <Button
                                size="sm"
                                variant={val ? 'outline' : 'glow'}
                                icon={<UserCheck className="w-3.5 h-3.5" />}
                                onClick={() => handleOpenModal(pred)}
                              >
                                {val ? 'Edit Review' : 'Review Candidate'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Completion Banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      Step 5 Complete: Expert Review Finished!
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400">
                      Expert sign-offs saved. Proceed to Step 6 to generate and export your scientific report.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/reports')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0"
                >
                  <span>Proceed to Step 6: Scientific Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <EmptyStateContainer
              icon={<ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
              title="No candidates to review"
              description="Run AI Screening and Quantum Optimization first to generate candidates for Expert Review."
              actionText="Go to Step 3: AI Screening"
              onAction={() => navigate('/predictions')}
            />
          )}
        </div>

        {/* Expert Review Form Modal */}
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title={`Expert Review: ${selectedCandidate?.drug?.name || 'Compound'}`}
          subtitle="Approve, Reject, or Override AI Decision & Record Lab Notes"
        >
          <form onSubmit={handleSubmitValidation} className="space-y-4 font-mono text-xs">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Expert Decision <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('APPROVED')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    decision === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/50 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Approve Candidate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    decision === 'REJECTED'
                      ? 'bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/50 shadow-sm ring-1 ring-rose-500'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span>Reject Candidate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('NEEDS_FURTHER_VALIDATION')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    decision === 'NEEDS_FURTHER_VALIDATION'
                      ? 'bg-cyan-100 text-cyan-900 border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/50 shadow-sm ring-1 ring-cyan-500'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Needs Further Val</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Experimental Method / Source <span className="text-rose-500">*</span>
              </label>
              <select
                value={method}
                onChange={(e: any) => setMethod(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="IN_VITRO">In-Vitro Assay (Surface Plasmon Resonance / Kinase)</option>
                <option value="IN_VIVO">In-Vivo Animal Model Study</option>
                <option value="LITERATURE">Literature & Benchmark Evidence</option>
                <option value="CLINICAL">Clinical Trial Registry Data</option>
                <option value="OTHER">Other Computational / Lab Method</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Experimental Notes & Rationale <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe empirical test observations, binding constants (Kd), or literature rationale..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Input
                  label="Confidence (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <Input
                  label="Scientist Name"
                  placeholder="e.g. Dr. Jane Doe"
                  value={scientistName}
                  onChange={(e) => setScientistName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Input
                  label="Institution (Optional)"
                  placeholder="e.g. Stanford BioLab"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedCandidate(null)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="glow"
                size="sm"
                disabled={submitValidationMutation.isPending}
              >
                {submitValidationMutation.isPending ? 'Saving...' : 'Save Decision'}
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </DashboardLayout>
  );
};
