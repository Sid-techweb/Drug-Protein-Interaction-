export interface SystemMetric {
  id: string;
  metric_key: string;
  label: string;
  value_display: string;
  numeric_value?: number;
  unit?: string;
  category: 'TELEMETRY' | 'PERFORMANCE' | 'ACCURACY' | 'CAPACITY';
  status: string;
  updated_at: string;
}

export interface PlatformCapability {
  id: string;
  capability_key: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'AI' | 'QUANTUM' | 'VISUALIZATION' | 'EXPLAINABILITY' | 'CLINICAL';
  icon_name: string;
  badge_label: string;
  display_order: number;
}

export interface WorkflowStage {
  id: string;
  stage_number: number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  tech_stack_tag: string;
  icon_name: string;
}

export interface TechStackModalSpecs {
  [key: string]: string;
}

export interface TechStackItem {
  id: string;
  tech_key: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Machine Learning' | 'Quantum' | 'Visualization' | 'Database';
  version: string;
  description: string;
  architecture_role: string;
  icon_name: string;
  display_order: number;
  modal_specs: TechStackModalSpecs;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  organization?: string;
  role: string;
  is_active: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ProteinMetadata {
  id: string;
  hydrophobic_pct: number;
  polar_pct: number;
  basic_pct: number;
  acidic_pct: number;
  molecular_weight: number;
  isoelectric_point: number;
  composition_json: Record<string, number>;
}

export interface Protein {
  id: string;
  accession_id?: string;
  name: string;
  organism: string;
  gene_name?: string;
  sequence: string;
  length: number;
  function_description?: string;
  source_type: 'PASTE' | 'FASTA' | 'UNIPROT';
  user_id: string;
  created_at: string;
  metadata_rel?: ProteinMetadata;
}

export interface EmbeddingJob {
  id: string;
  protein_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  model_name: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface DrugProperty {
  id: string;
  heavy_atom_count: number;
  ring_count: number;
  fraction_csp3: number;
  molar_refractivity: number;
  descriptors_json: Record<string, any>;
  atom_graph_json: Record<string, any>;
}

export interface DrugFingerprint {
  id: string;
  morgan_fp_bitstring: string;
  maccs_fp_bitstring: string;
}

export interface DrugTarget {
  id: string;
  target_name: string;
  uniprot_id?: string;
  chembl_target_id?: string;
  activity_type: string;
  activity_value: number;
  activity_units: string;
}

export interface Drug {
  id: string;
  chembl_id?: string;
  name: string;
  smiles: string;
  formula: string;
  molecular_weight: number;
  logp: number;
  hbd: number;
  hba: number;
  tpsa: number;
  rotatable_bonds: number;
  dataset_id: string;
  user_id: string;
  created_at: string;
  property_rel?: DrugProperty;
  fingerprint_rel?: DrugFingerprint;
  targets?: DrugTarget[];
}

export interface DrugDataset {
  id: string;
  name: string;
  source_type: 'CHEMBL' | 'CSV' | 'SDF';
  total_compounds: number;
  status: string;
  storage_size_bytes: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatasetAnalytics {
  total_compounds: number;
  unique_targets: number;
  avg_molecular_weight: number;
  avg_logp: number;
  lipinski_pass_rate_pct: number;
  source_breakdown: Record<string, number>;
}

export interface CandidateQueue {
  id: string;
  drug_id: string;
  protein_id?: string;
  user_id: string;
  status: string;
  created_at: string;
  drug?: Drug;
}

export interface DTIPrediction {
  id: string;
  protein_id: string;
  drug_id: string;
  user_id: string;
  interaction_probability: number;
  confidence_score: number;
  binding_affinity_pkd: number;
  prediction_status: 'HIGH_AFFINITY_BINDER' | 'MODERATE_BINDER' | 'WEAK_BINDER' | 'REJECTED';
  inference_time_ms: number;
  model_version: string;
  created_at: string;
  protein?: Protein;
  drug?: Drug;
}

export interface ModelMetadata {
  id: string;
  version: string;
  model_name: string;
  checkpoint_path: string;
  training_loss: number;
  validation_roc_auc: number;
  accuracy: number;
  f1_score: number;
  precision_val: number;
  recall_val: number;
  is_active: boolean;
  trained_at: string;
}

export interface ExplainabilityResidue {
  residue_index: number;
  residue_name: string;
  attention_score: number;
  is_binding_pocket: boolean;
}

export interface ExplainabilityAtom {
  atom_index: number;
  element: string;
  importance_score: number;
  is_pharmacophore: boolean;
}

export interface ExplainabilityData {
  prediction_id: string;
  interaction_probability: number;
  confidence_score: number;
  top_protein_residues: ExplainabilityResidue[];
  top_drug_atoms: ExplainabilityAtom[];
  attention_matrix_summary: {
    matrix: number[][];
    num_protein_blocks: number;
    num_drug_blocks: number;
  };
  decision_summary: string;
}

export interface QUBOWeights {
  weight_probability: number;
  weight_affinity: number;
  weight_lipinski: number;
  weight_diversity_penalty: number;
}

export interface OptimizationResult {
  id: string;
  job_id: string;
  drug_id: string;
  initial_ai_rank: number;
  optimized_rank: number;
  ai_score: number;
  quantum_score: number;
  rank_delta: number;
  is_selected: boolean;
  created_at: string;
  drug?: Drug;
}

export interface QuantumJob {
  id: string;
  user_id: string;
  protein_id: string;
  status: string;
  solver_type: string;
  num_candidates: number;
  selected_count: number;
  qubo_energy: number;
  runtime_ms: number;
  weights_json: Record<string, number>;
  created_at: string;
  results?: OptimizationResult[];
}

export interface RankComparisonData {
  job_id: string;
  total_candidates: number;
  selected_candidates: number;
  avg_rank_shift: number;
  max_rank_boost: number;
  quantum_optimization_gain_pct: number;
  results: OptimizationResult[];
}

export interface WorkflowStageRecord {
  id: string;
  run_id: string;
  stage_number: number;
  stage_name: string;
  status: string;
  details_json: Record<string, any>;
  duration_ms: number;
  created_at: string;
}

export interface WorkflowRun {
  id: string;
  user_id: string;
  name: string;
  protein_id: string;
  dataset_id?: string;
  quantum_job_id?: string;
  status: string;
  current_stage: number;
  total_stages: number;
  total_compounds: number;
  selected_compounds: number;
  execution_time_ms: number;
  created_at: string;
  protein?: Protein;
  dataset?: DrugDataset;
  stages?: WorkflowStageRecord[];
}

export interface ScientificReport {
  id: string;
  user_id: string;
  title: string;
  workflow_run_id?: string;
  protein_id: string;
  summary_text: string;
  report_data_json: Record<string, any>;
  created_at: string;
  protein?: Protein;
}

export interface AnalyticsDashboardData {
  total_proteins: number;
  total_drugs: number;
  total_predictions: number;
  total_quantum_jobs: number;
  avg_interaction_probability: number;
  avg_binding_affinity_pkd: number;
  avg_lipinski_pass_pct: number;
  avg_prediction_latency_ms: number;
  avg_quantum_runtime_ms: number;
  dataset_source_counts: Record<string, number>;
  prediction_status_breakdown: Record<string, number>;
  timeline_history: Record<string, any>[];
}

export function calculateCompositeDrugScore(p: DTIPrediction): number {
  const probContrib = (p.interaction_probability || 0) * 45;
  const pkdContrib = Math.min(10, p.binding_affinity_pkd || 0) * 3.5;
  const confContrib = (p.confidence_score || 0) * 20;
  return Math.min(99, Math.max(10, Math.round(probContrib + pkdContrib + confContrib)));
}

export function getLipinskiStatus(drug?: Drug): { status: 'PASS' | 'WARNING' | 'FAIL'; violations: number } {
  if (!drug) return { status: 'PASS', violations: 0 };
  let violations = 0;
  if (drug.molecular_weight > 500) violations++;
  if (drug.logp > 5.0) violations++;
  if (drug.hbd > 5) violations++;
  if (drug.hba > 10) violations++;

  if (violations === 0) return { status: 'PASS', violations: 0 };
  if (violations === 1) return { status: 'WARNING', violations: 1 };
  return { status: 'FAIL', violations };
}
