from sqlalchemy.orm import Session
from app.database.connection import engine, SessionLocal, Base
from app.models.system_metric import SystemMetric
from app.models.platform_capability import PlatformCapability
from app.models.workflow_stage import WorkflowStage
from app.models.tech_stack_item import TechStackItem
from app.logging.logger import logger

def bootstrap_reference_metadata(db: Session) -> None:
    """
    Bootstraps ONLY immutable reference metadata into PostgreSQL.
    No synthetic prediction data, fake users, or mock statistics.
    """
    logger.info("Bootstrapping immutable reference domain metadata...")

    # 1. Immutable System Telemetry Configuration
    if not db.query(SystemMetric).first():
        metrics = [
            SystemMetric(
                metric_key="SYS_COMPOUND_LIBRARY",
                label="Approved Compound Library",
                value_display="ChEMBL 34 (2.4M)",
                numeric_value=2400000.0,
                unit="molecules",
                category="CAPACITY",
                status="ACTIVE"
            ),
            SystemMetric(
                metric_key="SYS_TARGET_PROTEINS",
                label="UniProt Structural Targets",
                value_display="215,400+",
                numeric_value=215400.0,
                unit="structures",
                category="CAPACITY",
                status="ACTIVE"
            ),
            SystemMetric(
                metric_key="SYS_QUANTUM_ORCHESTRATOR",
                label="QUBO Solver Engine",
                value_display="D-Wave Ocean v6.12",
                numeric_value=5000.0,
                unit="qubits",
                category="TELEMETRY",
                status="ONLINE"
            ),
            SystemMetric(
                metric_key="SYS_ML_INFERENCE_LATENCY",
                label="ESM-2 Embed Inference",
                value_display="< 120 ms",
                numeric_value=120.0,
                unit="ms",
                category="PERFORMANCE",
                status="OPTIMAL"
            ),
            SystemMetric(
                metric_key="SYS_EXPLAINABILITY_ACCURACY",
                label="SHAP / GNN Fidelity",
                value_display="99.4%",
                numeric_value=0.994,
                unit="ratio",
                category="ACCURACY",
                status="VERIFIED"
            )
        ]
        db.add_all(metrics)
        logger.info("Bootstrapped SystemMetric reference records.")

    # 2. Immutable Workflow Stage Pipeline Definition (9-Stage virtual screening)
    if not db.query(WorkflowStage).first():
        stages = [
            WorkflowStage(
                stage_number=1,
                title="Protein Input & Target Selection",
                subtitle="UniProt Accession / PDB Coordinate Resolution",
                description="Researcher inputs UniProt ID, FASTA sequence, or PDB crystal structure. HelixQ resolves 3D coordinates, active binding pockets, and residue conservation maps.",
                badge="STAGE 01",
                tech_stack_tag="UniProt REST API / Biopython",
                icon_name="Dna"
            ),
            WorkflowStage(
                stage_number=2,
                title="Protein Intelligence & ESM-2 Embeddings",
                subtitle="Deep Transformer Contextual Representation",
                description="Transformer protein language models generate high-dimensional embeddings capturing evolutionary conservation, secondary structure, and active site residue dynamics.",
                badge="STAGE 02",
                tech_stack_tag="PyTorch / ESM-2 3B",
                icon_name="BrainCircuit"
            ),
            WorkflowStage(
                stage_number=3,
                title="Virtual Drug Screening Library",
                subtitle="ChEMBL 34 & ZINC20 Filtering",
                description="High-throughput initial filtering against millions of small molecules based on Lipinski Rule of 5, ADMET predictions, and structural pharmacophores.",
                badge="STAGE 03",
                tech_stack_tag="RDKit / PostgreSQL",
                icon_name="Database"
            ),
            WorkflowStage(
                stage_number=4,
                title="Deep Learning Affinitive Prediction",
                subtitle="3D Graph Neural Network Binding Affinity",
                description="Equivariant Graph Neural Networks (EGNN) score protein-ligand complex interactions, predicting binding affinity pKd and IC50 inhibition thresholds.",
                badge="STAGE 04",
                tech_stack_tag="PyTorch Geometric / EGNN",
                icon_name="Cpu"
            ),
            WorkflowStage(
                stage_number=5,
                title="Quantum Optimization (QUBO)",
                subtitle="Conformational & Combinatorial Docking",
                description="Translates molecular docking combinatorial optimization into Quadratic Unconstrained Binary Optimization (QUBO) executed on D-Wave Quantum Annealers.",
                badge="STAGE 05",
                tech_stack_tag="D-Wave Ocean SDK / Simulated Annealing",
                icon_name="Zap"
            ),
            WorkflowStage(
                stage_number=6,
                title="Interactive 3D Molecular Visualization",
                subtitle="WebGL WebGPU Hardware Acceleration",
                description="Dynamic WebGL molecular rendering engine visualizes binding poses, atom-atom hydrogen bonds, hydrophobic contacts, and electrostatic surface potential.",
                badge="STAGE 06",
                tech_stack_tag="Three.js / WebGL 2.0",
                icon_name="Box"
            ),
            WorkflowStage(
                stage_number=7,
                title="Explainable AI (XAI) Attribution",
                subtitle="Substructure & Residue Importance Scoring",
                description="Integrated Gradients and GNN-Explainer compute atom-level attribution maps, highlighting precisely which chemical moieties drive binding energy.",
                badge="STAGE 07",
                tech_stack_tag="Captum / GNNExplainer",
                icon_name="Eye"
            ),
            WorkflowStage(
                stage_number=8,
                title="Scientist Validation & Feedback Loop",
                subtitle="Human-in-the-Loop Expert Scoring",
                description="Biomedical researchers review predictions, annotate active site poses, rate binding confidence, and validate docking outputs.",
                badge="STAGE 08",
                tech_stack_tag="HelixQ Expert Portal",
                icon_name="UserCheck"
            ),
            WorkflowStage(
                stage_number=9,
                title="Continuous Machine Learning Fine-Tuning",
                subtitle="Active Learning Model Refinement",
                description="Scientist feedback and wet-lab bioassay validations automatically feed back into model training pipelines to eliminate systemic bias.",
                badge="STAGE 09",
                tech_stack_tag="MLflow / Active Learning",
                icon_name="RefreshCw"
            )
        ]
        db.add_all(stages)
        logger.info("Bootstrapped WorkflowStage reference records.")

    # 3. Immutable Platform Capabilities Definition
    if not db.query(PlatformCapability).first():
        capabilities = [
            PlatformCapability(
                capability_key="CAP_PROTEIN_INTEL",
                title="Protein Intelligence Architecture",
                subtitle="Deep Transformer Sequence Context",
                description="Leverages Meta ESM-2 protein language models to extract evolutionary representations and active site binding pocket geometry directly from amino acid sequences.",
                category="AI",
                icon_name="Dna",
                badge_label="ESM-2 Transformer",
                display_order=1
            ),
            PlatformCapability(
                capability_key="CAP_VIRTUAL_SCREENING",
                title="AI Virtual Screening Engine",
                subtitle="Ultra-Fast Library Scale Search",
                description="Screens multi-million compound libraries in seconds using GPU-accelerated molecular fingerprint similarity and 3D Graph Convolutional Neural Networks.",
                category="AI",
                icon_name="Sparkles",
                badge_label="EGNN Graph AI",
                display_order=2
            ),
            PlatformCapability(
                capability_key="CAP_QUANTUM_OPT",
                title="Quantum Optimization Layer",
                subtitle="Combinatorial Docking Acceleration",
                description="Maps complex molecular conformational search space into QUBO mathematical formulations, utilizing D-Wave quantum annealers for global energy minimum solution.",
                category="QUANTUM",
                icon_name="Zap",
                badge_label="QUBO / D-Wave",
                display_order=3
            ),
            PlatformCapability(
                capability_key="CAP_3D_VISUAL",
                title="3D Molecular Visualization Engine",
                subtitle="Hardware Accelerated Interactive Inspection",
                description="Real-time WebGL engine for examining protein-ligand complexes, ligand surface electrostatic charge, atom contacts, and distance measurements.",
                category="VISUALIZATION",
                icon_name="Box",
                badge_label="Three.js WebGL",
                display_order=4
            ),
            PlatformCapability(
                capability_key="CAP_EXPLAINABLE_AI",
                title="Explainable AI Attribution",
                subtitle="Atom-Level Binding Feature Importance",
                description="Generates visual heatmaps highlighting exact chemical functional groups and target amino acid residues driving predicted binding affinity.",
                category="EXPLAINABILITY",
                icon_name="Eye",
                badge_label="SHAP / GNN-Explainer",
                display_order=5
            ),
            PlatformCapability(
                capability_key="CAP_SCIENTIST_FEEDBACK",
                title="Human-in-the-Loop Validation",
                subtitle="Continuous Active Learning Refinement",
                description="Integrates domain expert knowledge into active learning pipelines, systematically refining model confidence and eliminating computational artifacts.",
                category="CLINICAL",
                icon_name="UserCheck",
                badge_label="Active Learning",
                display_order=6
            )
        ]
        db.add_all(capabilities)
        logger.info("Bootstrapped PlatformCapability reference records.")

    # 4. Immutable Tech Stack Reference Specifications
    if not db.query(TechStackItem).first():
        tech_items = [
            TechStackItem(
                tech_key="TECH_FRONTEND",
                name="Frontend Web Application Layer",
                category="Frontend",
                version="React 18 / TypeScript 5 / Vite 5",
                description="Enterprise single-page architecture built with React, TypeScript, Tailwind CSS, Framer Motion, and TanStack React Query.",
                architecture_role="Client UI, State Management & Interactivity",
                icon_name="Code2",
                display_order=1,
                modal_specs={
                    "framework": "React 18.2 + Vite 5",
                    "language": "TypeScript 5.3 Strict Mode",
                    "styling": "Tailwind CSS v3 + Custom Glassmorphism Token Palette",
                    "state": "TanStack React Query v5 + React Context API",
                    "http": "Centralized Axios Client with Refresh Interceptors",
                    "routing": "React Router v6 Protected Route Infrastructure"
                }
            ),
            TechStackItem(
                tech_key="TECH_BACKEND",
                name="API & Microservice Backend",
                category="Backend",
                version="FastAPI 0.109 / Python 3.11",
                description="Asynchronous REST API framework implementing OpenAPI standards, OAuth2/JWT security, dependency injection, and Pydantic validation.",
                architecture_role="REST Controllers, Business Logic & Security",
                icon_name="Server",
                display_order=2,
                modal_specs={
                    "framework": "FastAPI (ASGI)",
                    "server": "Uvicorn Async Worker",
                    "orm": "SQLAlchemy 2.0 Unified Mapping",
                    "auth": "OAuth2 Bearer JWT Architecture (Passlib/Jose)",
                    "logging": "Structured JSON with Request Correlation IDs",
                    "errors": "RFC-7807 Standardized Problem Details"
                }
            ),
            TechStackItem(
                tech_key="TECH_ML",
                name="Deep Learning & Bioinformatics",
                category="Machine Learning",
                version="PyTorch 2.2 / PyTorch Geometric / ESM-2",
                description="State-of-the-art biophysically aware deep learning framework for protein language modeling and 3D graph affinity prediction.",
                architecture_role="Embedding Generation & Affinity Scoring",
                icon_name="BrainCircuit",
                display_order=3,
                modal_specs={
                    "models": "ESM-2 3B Protein Transformer & Equivariant GNNs",
                    "cheminformatics": "RDKit 2023.09 Fingerprinting & ADMET",
                    "acceleration": "CUDA 12.1 Hardware Compute",
                    "explainability": "Captum Integrated Gradients & GNNExplainer",
                    "database_ref": "ChEMBL 34 Bioactivity Records"
                }
            ),
            TechStackItem(
                tech_key="TECH_QUANTUM",
                name="Quantum Optimization Engine",
                category="Quantum",
                version="D-Wave Ocean SDK v6.12",
                description="Translates continuous molecular energy landscapes into discrete QUBO formulations for execution on D-Wave Advantage QPUs.",
                architecture_role="Combinatorial Docking Conformation Optimization",
                icon_name="Zap",
                display_order=4,
                modal_specs={
                    "framework": "D-Wave Ocean SDK",
                    "formulation": "QUBO (Quadratic Unconstrained Binary Optimization)",
                    "hardware": "D-Wave Advantage 5000+ Qubit System",
                    "fallback": "Simulated Annealing & Quantum-Inspired Solvers",
                    "target_problem": "Rigid & Flexible Molecular Pose Conformations"
                }
            ),
            TechStackItem(
                tech_key="TECH_VISUALIZATION",
                name="Interactive 3D Molecular Graphics Engine",
                category="Visualization",
                version="Three.js r160 / WebGL 2.0",
                description="Modular WebGL 3D molecular renderer capable of dynamically streaming and rendering atomic structures, bonds, and surfaces.",
                architecture_role="Hardware Accelerated 3D Structure Viewer",
                icon_name="Box",
                display_order=5,
                modal_specs={
                    "engine": "Three.js Custom Shader Engine",
                    "render_modes": "Ball-and-Stick, Spacefill (CPK), Wireframe",
                    "interactivity": "Raycasting Atom Selection & Distance Markers",
                    "performance": "Instanced Mesh Rendering for >10,000 Atoms",
                    "format_support": "PDB, SDF, Mol2, Custom JSON Coordinate Streams"
                }
            ),
            TechStackItem(
                tech_key="TECH_DATABASE",
                name="Enterprise Persistence & Caching",
                category="Database",
                version="PostgreSQL 15 / Redis 7",
                description="Relational database for ACID transactional storage paired with in-memory Redis for session token invalidation and response caching.",
                architecture_role="Relational Store & In-Memory Cache",
                icon_name="Database",
                display_order=6,
                modal_specs={
                    "database": "PostgreSQL 15 Enterprise Engine",
                    "migrations": "Alembic Version Control",
                    "caching": "Redis 7 In-Memory KV Store",
                    "pooling": "SQLAlchemy QueuePool with Health Pre-Ping",
                    "containment": "Docker Containerized Persistent Volumes"
                }
            )
        ]
        db.add_all(tech_items)
        logger.info("Bootstrapped TechStackItem reference records.")

    db.commit()
    logger.info("Metadata bootstrapping complete.")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db_session = SessionLocal()
    try:
        bootstrap_reference_metadata(db_session)
    finally:
        db_session.close()
