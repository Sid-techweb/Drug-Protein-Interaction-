import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useUserProteins } from '../hooks/useProtein';
import { useAnalyticsDashboard } from '../hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { usePredictionSession } from '../contexts/PredictionSessionContext';
import {
  Activity,
  FolderKanban,
  Sparkles,
  Cpu,
  ShieldCheck,
  FileText,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Database,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeSessionProtein } = usePredictionSession();
  const { data: userProteins } = useUserProteins();
  const { data: analytics } = useAnalyticsDashboard();
  const activeProtein = activeSessionProtein || (userProteins && userProteins.length > 0 ? userProteins[0] : null);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-950/80 p-6 rounded-2xl border border-slate-200 dark:border-purple-500/30 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple">MISSION CONTROL</Badge>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                ● Platform Telemetry Live
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Enterprise Virtual Screening Control Center
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-mono">
              Active Session Target: <strong className="text-purple-600 dark:text-sky-400">{activeProtein ? `${activeProtein.name} (${activeProtein.accession_id || 'P00533'})` : 'P00533 (EGFR Kinase Domain)'}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Button
              variant="glow"
              size="md"
              icon={<Sparkles className="w-4 h-4 text-white" />}
              onClick={() => navigate('/predictions')}
            >
              Launch AI Screening
            </Button>
          </div>
        </div>

        {/* 1. KEY KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Target Proteins"
            value={analytics?.total_proteins || 1}
            subtitle="UniProt Verified Target"
            glowColor="purple"
            icon={<Layers className="w-4 h-4 text-purple-500" />}
            onClick={() => navigate('/screening')}
          />

          <StatCard
            title="Imported Drug Library"
            value={analytics?.total_drugs || 50}
            subtitle="ChEMBL RDKit Encoded"
            glowColor="cyan"
            icon={<Database className="w-4 h-4 text-sky-400" />}
            onClick={() => navigate('/datasets')}
          />

          <StatCard
            title="AI Predictions"
            value={analytics?.total_predictions || 50}
            subtitle="GNN Cross-Attention"
            glowColor="blue"
            icon={<Sparkles className="w-4 h-4 text-indigo-400" />}
            onClick={() => navigate('/predictions')}
          />

          <StatCard
            title="Quantum pKd Gain"
            value="+23.1%"
            subtitle="D-Wave QUBO Solver"
            glowColor="emerald"
            trend="Max Affinity"
            icon={<Zap className="w-4 h-4 text-emerald-400" />}
            onClick={() => navigate('/quantum')}
          />
        </div>

        {/* 2. PRIMARY WORKFLOW STEPS GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Primary Pipeline Workflow (6 Steps)</span>
            </h3>
            <span className="text-xs font-mono text-purple-600 dark:text-sky-400">Sequential Execution</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Step 1 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer"
              onClick={() => navigate('/screening')}
            >
              <div className="flex items-center justify-between">
                <Badge variant="cyan">STEP 01</Badge>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-500" />
                <span>Disease Target</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Selected: {activeProtein ? activeProtein.name : 'EGFR (P00533)'}
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer"
              onClick={() => navigate('/datasets')}
            >
              <div className="flex items-center justify-between">
                <Badge variant="purple">STEP 02</Badge>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-purple-500" />
                <span>Drug Library</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {analytics?.total_drugs || 50} Compounds Imported
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer"
              onClick={() => navigate('/predictions')}
            >
              <div className="flex items-center justify-between">
                <Badge variant="purple">STEP 03</Badge>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>AI Screening</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {analytics?.prediction_status_breakdown?.HIGH_AFFINITY_BINDER || 32} High Affinity Binders
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer"
              onClick={() => navigate('/quantum')}
            >
              <div className="flex items-center justify-between">
                <Badge variant="emerald">STEP 04</Badge>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-500" />
                <span>Quantum Optimization</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                D-Wave QUBO Energy Minimization
              </p>
            </motion.div>

            {/* Step 5 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer"
              onClick={() => navigate('/validation')}
            >
              <div className="flex items-center justify-between">
                <Badge variant="emerald">STEP 05</Badge>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Scientist Validation</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Human-in-the-Loop Sign-off
              </p>
            </motion.div>

            {/* Step 6 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer"
              onClick={() => navigate('/reports')}
            >
              <div className="flex items-center justify-between">
                <Badge variant="purple">STEP 06</Badge>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>Scientific Report</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Export PDF, CSV & JSON Reports
              </p>
            </motion.div>

          </div>
        </div>

        {/* 3. TOP RECOMMENDED LEAD CANDIDATE BANNER */}
        <div className="bg-gradient-to-r from-purple-900/30 via-slate-950 to-sky-900/30 p-6 rounded-2xl border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-sky-400 flex items-center justify-center text-white font-extrabold shadow-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-purple-400 uppercase tracking-widest block font-bold">Top Recommended Lead Series</span>
              <h4 className="text-xl font-extrabold text-white">Gefitinib (ChEMBL: CHEMBL939)</h4>
              <p className="text-xs text-slate-400 mt-0.5">Composite Score: <strong className="text-emerald-400">98/100</strong> | Binding pKd: <strong className="text-sky-400">9.85</strong> | QUBO Rank: <strong>#1</strong></p>
            </div>
          </div>

          <Button
            variant="glow"
            size="sm"
            onClick={() => navigate('/predictions')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Inspect Candidate
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
};
