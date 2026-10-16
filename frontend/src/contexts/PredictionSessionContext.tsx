import React, { createContext, useContext, useState } from 'react';
import { Protein, DrugDataset } from '../types';

interface PredictionSessionContextType {
  activeSessionProtein: Protein | null;
  sessionWorkspaceProteins: Protein[];
  activeSessionDataset: DrugDataset | null;
  sessionPredictionIds: string[] | null;
  sessionQuantumJobId: string | null;
  setActiveSessionProtein: (protein: Protein | null) => void;
  addProteinToSessionWorkspace: (protein: Protein) => void;
  setActiveSessionDataset: (dataset: DrugDataset | null) => void;
  clearSessionWorkspace: () => void;
  startNewPredictionSession: (predictionIds: string[]) => void;
  setSessionQuantumJobId: (jobId: string | null) => void;
  clearSession: () => void;
}

const PredictionSessionContext = createContext<PredictionSessionContextType | undefined>(undefined);

export const PredictionSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSessionProtein, setActiveSessionProteinState] = useState<Protein | null>(() => {
    try {
      const saved = sessionStorage.getItem('helixq_active_session_protein');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sessionWorkspaceProteins, setSessionWorkspaceProteinsState] = useState<Protein[]>(() => {
    try {
      const saved = sessionStorage.getItem('helixq_session_workspace_proteins');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionDataset, setActiveSessionDatasetState] = useState<DrugDataset | null>(() => {
    try {
      const saved = sessionStorage.getItem('helixq_active_session_dataset');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sessionPredictionIds, setSessionPredictionIdsState] = useState<string[] | null>(() => {
    try {
      const saved = sessionStorage.getItem('helixq_session_pred_ids');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sessionQuantumJobId, setSessionQuantumJobIdState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('helixq_session_quantum_job_id') || null;
    } catch {
      return null;
    }
  });

  const setActiveSessionProtein = (protein: Protein | null) => {
    setActiveSessionProteinState(protein);
    try {
      if (protein) {
        sessionStorage.setItem('helixq_active_session_protein', JSON.stringify(protein));
      } else {
        sessionStorage.removeItem('helixq_active_session_protein');
      }
    } catch {}
  };

  const addProteinToSessionWorkspace = (protein: Protein) => {
    setSessionWorkspaceProteinsState((prev) => {
      // Replace previously loaded workspace proteins to maintain active single-experiment focus
      const next = [protein];
      try {
        sessionStorage.setItem('helixq_session_workspace_proteins', JSON.stringify(next));
      } catch {}
      return next;
    });
    setActiveSessionProtein(protein);
  };

  const setActiveSessionDataset = (dataset: DrugDataset | null) => {
    setActiveSessionDatasetState(dataset);
    // Reset downstream screening & quantum results when dataset changes
    setSessionPredictionIdsState(null);
    setSessionQuantumJobIdState(null);
    try {
      if (dataset) {
        sessionStorage.setItem('helixq_active_session_dataset', JSON.stringify(dataset));
      } else {
        sessionStorage.removeItem('helixq_active_session_dataset');
      }
      sessionStorage.removeItem('helixq_session_pred_ids');
      sessionStorage.removeItem('helixq_session_quantum_job_id');
    } catch {}
  };

  const clearSessionWorkspace = () => {
    setActiveSessionProteinState(null);
    setSessionWorkspaceProteinsState([]);
    setActiveSessionDatasetState(null);
    setSessionPredictionIdsState(null);
    setSessionQuantumJobIdState(null);
    try {
      sessionStorage.removeItem('helixq_active_session_protein');
      sessionStorage.removeItem('helixq_session_workspace_proteins');
      sessionStorage.removeItem('helixq_active_session_dataset');
      sessionStorage.removeItem('helixq_session_pred_ids');
      sessionStorage.removeItem('helixq_session_quantum_job_id');
    } catch {}
  };

  const startNewPredictionSession = (predictionIds: string[]) => {
    setSessionPredictionIdsState(predictionIds);
    setSessionQuantumJobIdState(null);
    try {
      sessionStorage.setItem('helixq_session_pred_ids', JSON.stringify(predictionIds));
      sessionStorage.removeItem('helixq_session_quantum_job_id');
    } catch {}
  };

  const setSessionQuantumJobId = (jobId: string | null) => {
    setSessionQuantumJobIdState(jobId);
    try {
      if (jobId) {
        sessionStorage.setItem('helixq_session_quantum_job_id', jobId);
      } else {
        sessionStorage.removeItem('helixq_session_quantum_job_id');
      }
    } catch {}
  };

  const clearSession = () => {
    clearSessionWorkspace();
  };

  return (
    <PredictionSessionContext.Provider
      value={{
        activeSessionProtein,
        sessionWorkspaceProteins,
        activeSessionDataset,
        sessionPredictionIds,
        sessionQuantumJobId,
        setActiveSessionProtein,
        addProteinToSessionWorkspace,
        setActiveSessionDataset,
        clearSessionWorkspace,
        startNewPredictionSession,
        setSessionQuantumJobId,
        clearSession,
      }}
    >
      {children}
    </PredictionSessionContext.Provider>
  );
};

export const usePredictionSession = () => {
  const context = useContext(PredictionSessionContext);
  if (!context) {
    throw new Error('usePredictionSession must be used within a PredictionSessionProvider');
  }
  return context;
};
