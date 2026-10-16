import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyStateContainer } from '../ui/EmptyStateContainer';
import {
  AnalyticsDashboardData,
  DTIPrediction,
  calculateCompositeDrugScore,
  getLipinskiStatus,
} from '../../types';
import { usePredictionSession } from '../../contexts/PredictionSessionContext';
import { useUserProteins } from '../../hooks/useProtein';
import { usePredictionHistory } from '../../hooks/usePredictions';
import { useQuantumComparison } from '../../hooks/useQuantum';
import { getPreferredDrugName } from '../../pages/PredictionPage';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Zap,
  Activity,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  UserCheck,
  Award,
  Layers,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface AnalyticsChartsProps {
  data: AnalyticsDashboardData;
}

interface CandidateChartItem {
  rank: number;
  name: string;
  chemblId?: string;
  score: number;
  aiScore: number;
  quantumScore: number;
  probability: number;
  pkd: number;
  smiles: string;
  mw: number;
  logp: number;
  status: string;
  lipinskiStatus: string;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  const navigate = useNavigate();
  const { activeSessionProtein, sessionPredictionIds, sessionQuantumJobId } = usePredictionSession();
  const { data: userProteins } = useUserProteins();
  const activeProtein = activeSessionProtein || (userProteins && userProteins.length > 0 ? userProteins[0] : null);

  const { data: historyPredictions } = usePredictionHistory(activeProtein?.id);
  const { data: comparison } = useQuantumComparison(sessionQuantumJobId || undefined);

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateChartItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Active Session Predictions Filter
  const sessionPredictions: DTIPrediction[] = React.useMemo(() => {
    if (!historyPredictions) return [];
    if (sessionPredictionIds && sessionPredictionIds.length > 0) {
      return historyPredictions.filter((p) => sessionPredictionIds.includes(p.id));
    }
    return historyPredictions;
  }, [historyPredictions, sessionPredictionIds]);

  // Quantum Result Lookup Map
  const quantumResultMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    if (comparison && comparison.results) {
      comparison.results.forEach((r) => {
        map[r.drug_id] = r;
      });
    }
    return map;
  }, [comparison]);

  // 1. Dynamic Top Candidate Items (100% computed)
  const top10Candidates: CandidateChartItem[] = React.useMemo(() => {
    if (sessionPredictions.length === 0) return [];

    const sorted = [...sessionPredictions].sort((a, b) => {
      const qA = quantumResultMap[a.drug_id]?.quantum_score ?? a.interaction_probability;
      const qB = quantumResultMap[b.drug_id]?.quantum_score ?? b.interaction_probability;
      return qB - qA;
    });

    return sorted.slice(0, 10).map((p, idx) => {
      const { name, chemblId } = getPreferredDrugName(p);
      const score = calculateCompositeDrugScore(p);
      const qRes = quantumResultMap[p.drug_id];
      const quantumScore = qRes ? Math.round(qRes.quantum_score * 100) : score;
      const lipinski = getLipinskiStatus(p.drug);

      return {
        rank: idx + 1,
        name,
        chemblId,
        score,
        aiScore: score,
        quantumScore,
        probability: Math.round(p.interaction_probability * 100),
        pkd: p.binding_affinity_pkd,
        smiles: p.drug?.smiles || 'N/A',
        mw: p.drug?.molecular_weight || 400.0,
        logp: p.drug?.logp || 2.5,
        status: p.prediction_status,
        lipinskiStatus: lipinski.status,
      };
    });
  }, [sessionPredictions, quantumResultMap]);

  // 2. Dynamic Prediction Status Pie Data (100% computed)
  const predictionPieData = React.useMemo(() => {
    const high = sessionPredictions.filter((p) => p.prediction_status === 'HIGH_AFFINITY_BINDER').length;
    const mod = sessionPredictions.filter((p) => p.prediction_status === 'MODERATE_BINDER').length;
    const weak = sessionPredictions.filter((p) => p.prediction_status === 'WEAK_BINDER').length;
    const rej = sessionPredictions.filter((p) => p.prediction_status === 'REJECTED').length;

    return [
      { name: 'High Affinity Binders', value: high, color: '#10b981' },
      { name: 'Moderate Binders', value: mod, color: '#38bdf8' },
      { name: 'Weak Binders', value: weak, color: '#a855f7' },
      { name: 'Rejected', value: rej, color: '#f43f5e' },
    ];
  }, [sessionPredictions]);

  // 3. Dynamic Confidence Distribution Histogram Data (100% computed)
  const confidenceData = React.useMemo(() => {
    const bin90 = sessionPredictions.filter((p) => p.confidence_score >= 0.90).length;
    const bin80 = sessionPredictions.filter((p) => p.confidence_score >= 0.80 && p.confidence_score < 0.90).length;
    const bin70 = sessionPredictions.filter((p) => p.confidence_score >= 0.70 && p.confidence_score < 0.80).length;
    const binLow = sessionPredictions.filter((p) => p.confidence_score < 0.70).length;

    return [
      { range: '90% - 100%', count: bin90, label: 'High Confidence' },
      { range: '80% - 89%', count: bin80, label: 'Optimal' },
      { range: '70% - 79%', count: bin70, label: 'Moderate' },
      { range: '< 70%', count: binLow, label: 'Review Required' },
    ];
  }, [sessionPredictions]);

  // 4. Dynamic Binding Affinity (pKd) Distribution (100% computed)
  const pkdDistributionData = React.useMemo(() => {
    const p9 = sessionPredictions.filter((p) => p.binding_affinity_pkd >= 9.0).length;
    const p8 = sessionPredictions.filter((p) => p.binding_affinity_pkd >= 8.0 && p.binding_affinity_pkd < 9.0).length;
    const p7 = sessionPredictions.filter((p) => p.binding_affinity_pkd >= 7.0 && p.binding_affinity_pkd < 8.0).length;
    const p6 = sessionPredictions.filter((p) => p.binding_affinity_pkd >= 6.0 && p.binding_affinity_pkd < 7.0).length;
    const pLow = sessionPredictions.filter((p) => p.binding_affinity_pkd < 6.0).length;

    return [
      { range: '≥ 9.0 pKd (Kd < 1nM)', count: p9, label: 'High Affinity' },
      { range: '8.0 - 8.9 pKd', count: p8, label: 'Sub-Micromolar' },
      { range: '7.0 - 7.9 pKd', count: p7, label: 'Moderate Binders' },
      { range: '6.0 - 6.9 pKd', count: p6, label: 'Weak Binders' },
      { range: '< 6.0 pKd', count: pLow, label: 'Non-Binders' },
    ];
  }, [sessionPredictions]);

  // 5. Dynamic Drug Score Distribution Data (100% computed)
  const scoreDistributionData = React.useMemo(() => {
    const s90 = sessionPredictions.filter((p) => calculateCompositeDrugScore(p) >= 90).length;
    const s80 = sessionPredictions.filter((p) => calculateCompositeDrugScore(p) >= 80 && calculateCompositeDrugScore(p) < 90).length;
    const s70 = sessionPredictions.filter((p) => calculateCompositeDrugScore(p) >= 70 && calculateCompositeDrugScore(p) < 80).length;
    const sLow = sessionPredictions.filter((p) => calculateCompositeDrugScore(p) < 70).length;

    return [
      { range: '90 - 100 Score', count: s90, label: 'Tier 1 Leads' },
      { range: '80 - 89 Score', count: s80, label: 'Tier 2 Candidates' },
      { range: '70 - 79 Score', count: s70, label: 'Tier 3 Candidates' },
      { range: '< 70 Score', count: sLow, label: 'Low Score' },
    ];
  }, [sessionPredictions]);

  // 6. Dynamic Drug-Likeness Radar Data (100% computed)
  const radarData = React.useMemo(() => {
    if (sessionPredictions.length === 0) return [];
    const total = sessionPredictions.length;

    const lipinskiPassCount = sessionPredictions.filter((p) => getLipinskiStatus(p.drug).status === 'PASS').length;
    const mwPassCount = sessionPredictions.filter((p) => (p.drug?.molecular_weight || 0) <= 500).length;
    const logpPassCount = sessionPredictions.filter((p) => (p.drug?.logp || 0) <= 5.0).length;
    const hbdPassCount = sessionPredictions.filter((p) => (p.drug?.hbd || 0) <= 5).length;
    const hbaPassCount = sessionPredictions.filter((p) => (p.drug?.hba || 0) <= 10).length;

    return [
      { property: 'Lipinski Compliance', A: Math.round((lipinskiPassCount / total) * 100), fullMark: 100 },
      { property: 'MW <= 500 Da', A: Math.round((mwPassCount / total) * 100), fullMark: 100 },
      { property: 'LogP <= 5.0', A: Math.round((logpPassCount / total) * 100), fullMark: 100 },
      { property: 'HBD <= 5', A: Math.round((hbdPassCount / total) * 100), fullMark: 100 },
      { property: 'HBA <= 10', A: Math.round((hbaPassCount / total) * 100), fullMark: 100 },
    ];
  }, [sessionPredictions]);

  // 7. Dynamic Summary KPI Calculations (100% computed)
  const kpiSummary = React.useMemo(() => {
    const total = sessionPredictions.length;
    if (total === 0) {
      return {
        total: 0,
        highAffinity: 0,
        avgConfidence: 0,
        avgPkd: '0.00',
        avgDrugScore: 0,
        quantumGain: comparison ? comparison.quantum_optimization_gain_pct : 0,
        lipinskiPass: 0,
        lipinskiWarning: 0,
        lipinskiFail: 0,
      };
    }

    const highAffinity = sessionPredictions.filter((p) => p.prediction_status === 'HIGH_AFFINITY_BINDER').length;
    const avgConfidence = Math.round(
      (sessionPredictions.reduce((acc, p) => acc + p.confidence_score, 0) / total) * 100
    );
    const avgPkd = (sessionPredictions.reduce((acc, p) => acc + p.binding_affinity_pkd, 0) / total).toFixed(2);
    const avgDrugScore = Math.round(
      sessionPredictions.reduce((acc, p) => acc + calculateCompositeDrugScore(p), 0) / total
    );

    const lipinskiPass = sessionPredictions.filter((p) => getLipinskiStatus(p.drug).status === 'PASS').length;
    const lipinskiWarning = sessionPredictions.filter((p) => getLipinskiStatus(p.drug).status === 'WARNING').length;
    const lipinskiFail = sessionPredictions.filter((p) => getLipinskiStatus(p.drug).status === 'FAIL').length;

    return {
      total,
      highAffinity,
      avgConfidence,
      avgPkd,
      avgDrugScore,
      quantumGain: comparison ? comparison.quantum_optimization_gain_pct : 0,
      lipinskiPass,
      lipinskiWarning,
      lipinskiFail,
    };
  }, [sessionPredictions, comparison]);

  // Pipeline Workflow Flow Nodes
  const pipelineNodes = [
    { label: 'Protein Target', desc: activeProtein ? activeProtein.name : 'Unselected', icon: <Layers className="w-5 h-5 text-purple-400" /> },
    { label: 'Drug Library', desc: `${kpiSummary.total} Candidates`, icon: <Database className="w-5 h-5 text-sky-400" /> },
    { label: 'AI Screening', desc: 'ESM-2 + GNN', icon: <Cpu className="w-5 h-5 text-indigo-400" /> },
    { label: 'Quantum QUBO', desc: comparison ? `${comparison.selected_candidates} Shortlisted` : 'D-Wave Ocean', icon: <Zap className="w-5 h-5 text-amber-400" /> },
    { label: 'Scientist Review', desc: 'Human-in-the-Loop', icon: <UserCheck className="w-5 h-5 text-emerald-400" /> },
    { label: 'Lead Series', desc: `${kpiSummary.highAffinity} High Binders`, icon: <Award className="w-5 h-5 text-emerald-300" /> }
  ];

  const handleBarClick = (entry: any) => {
    if (entry && entry.name) {
      setSelectedCandidate(entry);
      setIsModalOpen(true);
    }
  };

  if (sessionPredictions.length === 0) {
    return (
      <EmptyStateContainer
        icon={<Activity className="w-8 h-8 text-purple-600 dark:text-sky-400" />}
        title="No Live Telemetry Data Available"
        description={
          activeProtein
            ? `Target '${activeProtein.name}' has no active predictions. Run Step 3 AI Screening to populate live analytics.`
            : 'Select a target protein and run AI Screening to generate live experiment telemetry.'
        }
        actionText="Go to Step 3: AI Screening"
        onAction={() => navigate('/predictions')}
      />
    );
  }

  return (
    <div className="space-y-8">
      
      {/* ---------------------------------------------------- */}
      {/* SECTION: Live Session KPI Telemetry Cards */}
      {/* ---------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 font-mono text-center"
      >
        <Card glowColor="purple" className="p-4 hover:scale-105 transition-transform duration-300">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block mb-1">Evaluated Compounds</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpiSummary.total}</span>
          <span className="text-[9px] text-purple-500 block">Session Candidates</span>
        </Card>

        <Card glowColor="emerald" className="p-4 hover:scale-105 transition-transform duration-300">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block mb-1">High Affinity Binders</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{kpiSummary.highAffinity}</span>
          <span className="text-[9px] text-emerald-500 block">pKd ≥ 8.5</span>
        </Card>

        <Card glowColor="cyan" className="p-4 hover:scale-105 transition-transform duration-300">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block mb-1">Avg AI Confidence</span>
          <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">{kpiSummary.avgConfidence}%</span>
          <span className="text-[9px] text-sky-500 block">Neural Model Signal</span>
        </Card>

        <Card glowColor="blue" className="p-4 hover:scale-105 transition-transform duration-300">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block mb-1">Avg Binding (pKd)</span>
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{kpiSummary.avgPkd}</span>
          <span className="text-[9px] text-purple-400 block">-log10 Kd Affinity</span>
        </Card>

        <Card glowColor="cyan" className="p-4 hover:scale-105 transition-transform duration-300">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block mb-1">Avg Drug Score</span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{kpiSummary.avgDrugScore}/100</span>
          <span className="text-[9px] text-amber-500 block">Composite Metric</span>
        </Card>

        <Card glowColor="purple" className="p-4 hover:scale-105 transition-transform duration-300">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block mb-1">Quantum Gain</span>
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">+{kpiSummary.quantumGain}%</span>
          <span className="text-[9px] text-indigo-400 block">D-Wave Ocean Boost</span>
        </Card>
      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* SECTION: Pipeline Sequence Stream */}
      {/* ---------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card glowColor="purple" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Badge variant="purple">LIVE EXPERIMENT PIPELINE</Badge>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Active Session Telemetry Stream ({activeProtein?.name || 'Target Protein'})
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-500 font-bold animate-pulse">
              ● Live Session Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {pipelineNodes.map((nd, idx) => (
              <div key={nd.label} className="relative flex flex-col items-center text-center p-3 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 group hover:border-purple-500 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shadow-inner">
                  {nd.icon}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{nd.label}</h5>
                  <span className="text-[10px] font-mono text-slate-500 block mt-0.5">{nd.desc}</span>
                </div>
                {idx < pipelineNodes.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-purple-500 animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 1: Top 10 Ranked Drug Candidates Chart */}
      {/* ---------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant="cyan">TOP CANDIDATES</Badge>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Top Ranked Session Drug Candidates
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Click any bar below to inspect full molecular properties and SMILES structure.
              </p>
            </div>
            <span className="text-xs font-mono text-purple-600 dark:text-sky-400 font-bold">
              Dynamic Session Results
            </span>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={top10Candidates}
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    handleBarClick(e.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} fontFamily="monospace" width={100} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs font-mono space-y-1 text-white">
                          <p className="font-bold text-sky-400">{d.name} ({d.chemblId || 'N/A'})</p>
                          <p>Composite Drug Score: <strong className="text-emerald-400">{d.score}%</strong></p>
                          <p>Binding Probability: <strong>{d.probability}%</strong></p>
                          <p>Binding Affinity (pKd): <strong>{d.pkd}</strong></p>
                          <p className="text-[10px] text-purple-300 pt-1">💡 Click bar to view chemical details</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="score"
                  fill="url(#scoreGradient)"
                  radius={[0, 8, 8, 0]}
                  isAnimationActive={true}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* GRID: Status Doughnut & Quantum Score Shift Chart */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 2: AI Prediction Binding Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <Badge variant="emerald">BINDING STATUS</Badge>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Binding Status Distribution Breakdown
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-500">Doughnut Distribution</span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={predictionPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {predictionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0];
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-mono text-white">
                            <p style={{ color: d.payload.color }} className="font-bold">{d.name}</p>
                            <p>Count: {d.value} compounds</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* SECTION 3: AI vs Quantum Optimization Grouped Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
              <div>
                <Badge variant="purple">QUANTUM SHIFT</Badge>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  AI Score vs Quantum Optimized Score
                </h4>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold rounded-lg flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>+{kpiSummary.quantumGain}% Gain</span>
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Candidates.slice(0, 5)}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} fontFamily="monospace" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length >= 2) {
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs font-mono text-white space-y-1">
                            <p className="font-bold text-sky-400">{payload[0].payload.name}</p>
                            <p className="text-purple-400">AI Initial Score: {payload[0].value}%</p>
                            <p className="text-emerald-400">Quantum Score: {payload[1].value}%</p>
                            <p className="text-emerald-300 font-bold">Optimization Gain: +{(Number(payload[1].value) - Number(payload[0].value)).toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Bar dataKey="aiScore" name="Initial AI Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="quantumScore" name="Quantum Optimized" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* GRID: Confidence, pKd Distribution, Score Distribution */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SECTION 4: Prediction Confidence Histogram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-5 space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <Badge variant="cyan">CONFIDENCE BINS</Badge>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                Prediction Confidence Histogram
              </h4>
            </div>

            <div className="h-52 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceData}>
                  <XAxis dataKey="range" stroke="#64748b" fontSize={9} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={9} fontFamily="monospace" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs font-mono text-white">
                            <p className="font-bold text-sky-400">{d.range}</p>
                            <p>{d.count} Compounds ({d.label})</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* SECTION 5: Binding Affinity (pKd) Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-5 space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <Badge variant="purple">pKd DISTRIBUTION</Badge>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                Binding Affinity (pKd) Spectrum
              </h4>
            </div>

            <div className="h-52 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pkdDistributionData}>
                  <XAxis dataKey="range" stroke="#64748b" fontSize={8} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={9} fontFamily="monospace" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs font-mono text-white">
                            <p className="font-bold text-purple-400">{d.range}</p>
                            <p>{d.count} Compounds ({d.label})</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* SECTION 6: Drug-Likeness Radar Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="p-5 space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <Badge variant="emerald">LIPINSKI RADAR</Badge>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                ADMET Drug-Likeness Compliance
              </h4>
            </div>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={55} data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="property" stroke="#94a3b8" fontSize={9} fontFamily="monospace" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  <Radar name="Compliance %" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs font-mono text-white">
                            <p className="font-bold text-emerald-400">{d.property}</p>
                            <p>Compliance Rate: <strong>{d.A}%</strong></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* CANDIDATE DETAILS MODAL */}
      {/* ---------------------------------------------------- */}
      {selectedCandidate && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCandidate(null);
          }}
          title={selectedCandidate.name}
          subtitle={`ChEMBL ID: ${selectedCandidate.chemblId || 'N/A'} | Rank #${selectedCandidate.rank}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 block">Composite Score:</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{selectedCandidate.score}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Binding Affinity (pKd):</span>
                <span className="text-xl font-bold text-purple-600 dark:text-sky-400">{selectedCandidate.pkd}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Binding Probability:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedCandidate.probability}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Molecular Weight (MW):</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedCandidate.mw} Da</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Canonical SMILES String:</span>
              <div className="bg-slate-900 text-sky-400 p-3 rounded-xl overflow-x-auto text-[11px] break-all">
                {selectedCandidate.smiles}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Close Details
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
