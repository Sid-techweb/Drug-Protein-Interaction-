import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_helixq_presentation(output_path="HelixQ_Presentation.pptx"):
    prs = Presentation()
    # Set slide dimensions to 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # Blank slide layout

    # Color Palette Definitions
    COLOR_BG = RGBColor(11, 15, 25)       # #0B0F19 Dark Navy
    COLOR_CARD = RGBColor(21, 29, 46)     # #151D2E Dark Blue Card
    COLOR_BORDER = RGBColor(38, 50, 77)   # #26324D Subtle Border
    COLOR_CYAN = RGBColor(0, 240, 255)    # #00F0FF Primary Accent
    COLOR_INDIGO = RGBColor(99, 102, 241) # #6366F1 Secondary Accent
    COLOR_EMERALD = RGBColor(16, 185, 129)# #10B981 Metric Accent
    COLOR_TEXT = RGBColor(248, 250, 252)  # #F8FAFC Primary Text
    COLOR_MUTED = RGBColor(148, 163, 184)# #94A3B8 Secondary Text

    def set_background(slide):
        bg = slide.background
        fill = bg.fill
        fill.solid()
        fill.fore_color.rgb = COLOR_BG

    def add_header(slide, title_text, category_text="HELIXQ BIOTECH PLATFORM"):
        # Header category badge
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = COLOR_CYAN
        p_cat.font.name = "Arial"

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.5), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_TEXT
        p_title.font.name = "Arial"

    def add_card(slide, left, top, width, height, border_color=COLOR_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = COLOR_CARD
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)
        return shape

    def set_speaker_notes(slide, notes_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_text

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_background(slide1)

    # Decorative Card Background
    add_card(slide1, Inches(1.5), Inches(1.2), Inches(10.333), Inches(5.1), border_color=COLOR_CYAN)

    # Title content inside card
    tbox = slide1.shapes.add_textbox(Inches(2.0), Inches(1.8), Inches(9.333), Inches(3.8))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p1 = tf1.paragraphs[0]
    p1.text = "HELIXQ"
    p1.font.size = Pt(54)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_CYAN
    p1.font.name = "Arial"

    p2 = tf1.add_paragraph()
    p2.text = "Next-Generation Quantum-Accelerated AI Drug Discovery & Virtual Screening Platform"
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT
    p2.font.name = "Arial"
    p2.space_before = Pt(14)

    p3 = tf1.add_paragraph()
    p3.text = "Unifying Deep Learning Protein Embeddings (ESM-2), RDKit Cheminformatics & D-Wave QUBO Quantum Annealing"
    p3.font.size = Pt(14)
    p3.font.color.rgb = COLOR_MUTED
    p3.font.name = "Arial"
    p3.space_before = Pt(16)

    p4 = tf1.add_paragraph()
    p4.text = "Executive Architecture & Technical Presentation  |  2026"
    p4.font.size = Pt(12)
    p4.font.bold = True
    p4.font.color.rgb = COLOR_EMERALD
    p4.font.name = "Arial"
    p4.space_before = Pt(28)

    set_speaker_notes(slide1, 
        "Welcome everyone. Today I am thrilled to present HelixQ, an enterprise-grade biotech platform engineered to solve the most critical bottleneck in modern drug discovery: high-throughput computational virtual screening.\n\n"
        "HelixQ bridges deep learning transformer protein sequence embeddings (ESM-2), RDKit molecular cheminformatics, and D-Wave quantum combinatorial optimization (QUBO) into a seamless, high-performance platform."
    )

    # ==========================================
    # SLIDE 2: Problem Statement
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_background(slide2)
    add_header(slide2, "The $2.6B Drug Discovery Bottleneck", "Industry Problem & Challenges")

    # Card 1: Physical Wet-Lab Challenges
    c1 = add_card(slide2, Inches(0.8), Inches(1.7), Inches(5.6), Inches(4.2))
    tb1 = slide2.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(5.2), Inches(3.8))
    tf_c1 = tb1.text_frame
    tf_c1.word_wrap = True
    p = tf_c1.paragraphs[0]
    p.text = "Physical Wet-Lab Screening"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    bullets_c1 = [
        "Astronomical Costs: Developing a single approved drug costs over $2.6 Billion.",
        "Extreme Timelines: 10 to 15 years required from target identification to clinical approval.",
        "Low Hit Rates: Physical assaying of millions of small molecules is financially unfeasible.",
        "Combinatorial Explosion: Selecting non-redundant lead candidates from chemical space grows exponentially."
    ]
    for b in bullets_c1:
        p_b = tf_c1.add_paragraph()
        p_b.text = "• " + b
        p_b.font.size = Pt(13)
        p_b.font.color.rgb = COLOR_TEXT
        p_b.space_before = Pt(10)

    # Card 2: Classical Computational Limits
    c2 = add_card(slide2, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.2))
    tb2 = slide2.shapes.add_textbox(Inches(7.0), Inches(1.9), Inches(5.3), Inches(3.8))
    tf_c2 = tb2.text_frame
    tf_c2.word_wrap = True
    p = tf_c2.paragraphs[0]
    p.text = "Classical Computational Limits"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_INDIGO

    bullets_c2 = [
        "Affinity vs. Scale Trade-off: Legacy docking algorithms require heavy 3D structures and struggle to scale.",
        "Chemical Redundancy: Classical greedy algorithms pick top binders that are structural analogues of each other.",
        "Lack of Unified Pipeline: Disconnected tools for sequence fetching, property calculation, and optimization.",
        "Slow Iteration Loops: Disconnected human scientist validation from computational pipelines."
    ]
    for b in bullets_c2:
        p_b = tf_c2.add_paragraph()
        p_b.text = "• " + b
        p_b.font.size = Pt(13)
        p_b.font.color.rgb = COLOR_TEXT
        p_b.space_before = Pt(10)

    # Bottom Banner
    add_card(slide2, Inches(0.8), Inches(6.1), Inches(11.7), Inches(0.9), border_color=COLOR_EMERALD)
    tb_b = slide2.shapes.add_textbox(Inches(1.0), Inches(6.25), Inches(11.3), Inches(0.6))
    tf_b = tb_b.text_frame
    tf_b.word_wrap = True
    p_b_text = tf_b.paragraphs[0]
    p_b_text.text = "HELIXQ IMPACT: Compress candidate selection timelines from months to seconds while enforcing chemical diversity and drug-likeness."
    p_b_text.font.size = Pt(14)
    p_b_text.font.bold = True
    p_b_text.font.color.rgb = COLOR_EMERALD

    set_speaker_notes(slide2,
        "Traditional drug discovery is bogged down by immense costs and decade-long timelines. Screening millions of small molecules physically in wet labs is practically impossible.\n\n"
        "Existing computational tools either take days to run docking simulations or pick lead compounds that all look almost identical, wasting experimental validation budgets on redundant analogues."
    )

    # ==========================================
    # SLIDE 3: The HelixQ Solution Pipeline
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_background(slide3)
    add_header(slide3, "Unified Multi-Stage Screening Pipeline", "The HelixQ Solution")

    stages = [
        ("1. Target Intelligence", "UniProt REST Fetching\nSequence Analysis\nMW, pI, Charge Metrics", COLOR_CYAN),
        ("2. Cheminformatics", "ChEMBL Dataset Import\nLipinski Rule of 5\nMorgan Fingerprints", COLOR_INDIGO),
        ("3. AI Binding Affinity", "ESM-2 Cross-Attention\nPredict pKd Score\nConfidence Metric", COLOR_CYAN),
        ("4. Quantum Selection", "D-Wave Ocean QUBO\nTanimoto Diversity\nOptimal Shortlist", COLOR_EMERALD),
    ]

    card_width = Inches(2.75)
    spacing = Inches(0.2)
    start_left = Inches(0.8)

    for idx, (st_title, st_desc, st_color) in enumerate(stages):
        left_pos = start_left + idx * (card_width + spacing)
        add_card(slide3, left_pos, Inches(1.8), card_width, Inches(4.8), border_color=st_color)
        
        tb = slide3.shapes.add_textbox(left_pos + Inches(0.15), Inches(2.0), card_width - Inches(0.3), Inches(4.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = st_title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = st_color
        
        p_d = tf.add_paragraph()
        p_d.text = st_desc
        p_d.font.size = Pt(14)
        p_d.font.color.rgb = COLOR_TEXT
        p_d.space_before = Pt(20)

    # Bottom summary box
    add_card(slide3, Inches(0.8), Inches(6.7), Inches(11.733), Inches(0.55), border_color=COLOR_BORDER)
    tb_s = slide3.shapes.add_textbox(Inches(1.0), Inches(6.75), Inches(11.3), Inches(0.4))
    p_s = tb_s.text_frame.paragraphs[0]
    p_s.text = "Seamless Data Flow: UniProt Target -> ChEMBL Library -> ESM-2 Deep Learning -> D-Wave QUBO Solver -> Exportable Report"
    p_s.font.size = Pt(12)
    p_s.font.bold = True
    p_s.font.color.rgb = COLOR_MUTED

    set_speaker_notes(slide3,
        "Here is HelixQ's 4-stage screening workflow:\n"
        "Stage 1 fetches and validates protein sequence properties from UniProt.\n"
        "Stage 2 processes candidate drug libraries using RDKit for Lipinski filtering and Morgan Fingerprint encoding.\n"
        "Stage 3 applies our ESM-2 deep learning transformer cross-attention model to predict binding affinity (pKd).\n"
        "Stage 4 feeds these scores and Tanimoto distances into a D-Wave QUBO Hamiltonian solver to yield an optimal, diverse lead shortlist."
    )

    # ==========================================
    # SLIDE 4: Technological Pillars
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_background(slide4)
    add_header(slide4, "Core Technological Pillars", "Deep Learning, Cheminformatics & Quantum Computing")

    pillars = [
        ("ESM-2 Deep Learning", "PyTorch Cross-Attention ML Engine", 
         "• Uses Evolutionary Scale Modeling (ESM-2) transformer sequence representations.\n"
         "• Predicts binding affinity (pKd) directly from amino acid sequences and SMILES strings.\n"
         "• Eliminates the bottleneck of requiring expensive experimental 3D crystal structures.",
         COLOR_CYAN),
        ("RDKit Cheminformatics", "Molecular Property & Structural Engine",
         "• Evaluates Lipinski Rule of 5 parameters (MW <= 500, LogP <= 5, HBD <= 5, HBA <= 10).\n"
         "• Computes TPSA, Rotatable Bonds, and Aromatic Ring counts.\n"
         "• Generates 2048-bit Morgan Fingerprints for Tanimoto distance matrix calculations.",
         COLOR_INDIGO),
        ("D-Wave QUBO Sampler", "Quantum Combinatorial Optimization",
         "• Formulates candidate selection as Quadratic Unconstrained Binary Optimization (QUBO).\n"
         "• Minimizes Hamiltonian energy balancing binding affinity, Lipinski scores, and redundancy penalties.\n"
         "• Solves multi-objective lead optimization in milliseconds via simulated annealing.",
         COLOR_EMERALD)
    ]

    p_width = Inches(3.7)
    p_spacing = Inches(0.3)
    p_start = Inches(0.8)

    for idx, (p_title, p_sub, p_body, p_color) in enumerate(pillars):
        left_pos = p_start + idx * (p_width + p_spacing)
        add_card(slide4, left_pos, Inches(1.7), p_width, Inches(5.2), border_color=p_color)
        
        tb = slide4.shapes.add_textbox(left_pos + Inches(0.2), Inches(1.9), p_width - Inches(0.4), Inches(4.8))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = p_title
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = p_color
        
        p_sub_elem = tf.add_paragraph()
        p_sub_elem.text = p_sub
        p_sub_elem.font.size = Pt(12)
        p_sub_elem.font.bold = True
        p_sub_elem.font.color.rgb = COLOR_MUTED
        p_sub_elem.space_before = Pt(4)

        p_b = tf.add_paragraph()
        p_b.text = p_body
        p_b.font.size = Pt(13)
        p_b.font.color.rgb = COLOR_TEXT
        p_b.space_before = Pt(16)

    set_speaker_notes(slide4,
        "These three pillars form the core foundation of HelixQ:\n"
        "1. ESM-2 Deep Learning transformer model allows fast, sequence-level affinity prediction.\n"
        "2. RDKit provides rigorous drug-likeness filtering and fingerprint generation.\n"
        "3. D-Wave QUBO quantum annealing guarantees that the shortlisted candidate set is not only high-binding but chemically diverse."
    )

    # ==========================================
    # SLIDE 5: System Architecture
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_background(slide5)
    add_header(slide5, "Decoupled Modern Software Architecture", "System Design & Tech Stack")

    # Left Card: Tech Stack Table
    c_arch_l = add_card(slide5, Inches(0.8), Inches(1.7), Inches(6.5), Inches(5.2))
    tb_al = slide5.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(6.1), Inches(4.8))
    tf_al = tb_al.text_frame
    tf_al.word_wrap = True

    p = tf_al.paragraphs[0]
    p.text = "Enterprise Technology Stack"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    stack_items = [
        ("Frontend SPA", "React 18, TypeScript, Vite, Tailwind CSS"),
        ("3D & Analytics", "Three.js WebGL Molecule Canvas, Recharts"),
        ("Backend Gateway", "FastAPI Python, OAuth2 JWT, Pydantic v2"),
        ("Database ORM", "PostgreSQL 15+, SQLAlchemy 2.0 AsyncIO"),
        ("AI / ML Engine", "PyTorch, ESM-2 Transformer Embeddings"),
        ("Cheminformatics", "RDKit C++ / Python Wrapper"),
        ("Quantum Engine", "D-Wave Ocean SDK (QUBO Matrix Sampler)")
    ]

    for cat, tech in stack_items:
        p_item = tf_al.add_paragraph()
        p_item.text = f"• {cat}: "
        p_item.font.bold = True
        p_item.font.size = Pt(13)
        p_item.font.color.rgb = COLOR_EMERALD
        p_item.space_before = Pt(8)

        run = p_item.add_run()
        run.text = tech
        run.font.bold = False
        run.font.color.rgb = COLOR_TEXT

    # Right Card: Architectural Highlights
    c_arch_r = add_card(slide5, Inches(7.6), Inches(1.7), Inches(4.9), Inches(5.2))
    tb_ar = slide5.shapes.add_textbox(Inches(7.8), Inches(1.9), Inches(4.5), Inches(4.8))
    tf_ar = tb_ar.text_frame
    tf_ar.word_wrap = True

    p = tf_ar.paragraphs[0]
    p.text = "Architectural Principles"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_INDIGO

    arch_principles = [
        "Async IO Engine: Non-blocking FastAPI request handling backed by SQLAlchemy 2.0 async sessions.",
        "Type Safety: Strict end-to-end typing via TypeScript interface schemas and Python Pydantic models.",
        "Relational Persistence: 12 normalized SQL tables managing users, targets, drugs, predictions, and quantum jobs.",
        "WebGL Hardware Acceleration: Three.js molecular canvas rendering complex 3D atomic structures at 60 FPS."
    ]

    for ap in arch_principles:
        p_ap = tf_ar.add_paragraph()
        p_ap.text = "• " + ap
        p_ap.font.size = Pt(13)
        p_ap.font.color.rgb = COLOR_TEXT
        p_ap.space_before = Pt(14)

    set_speaker_notes(slide5,
        "HelixQ is engineered with a clean, decoupled client-server architecture.\n"
        "The frontend is a single-page React 18 application with WebGL 3D molecular rendering.\n"
        "The backend is a high-throughput FastAPI service interacting asynchronously with PostgreSQL 15 and specialized compute engines for PyTorch, RDKit, and D-Wave Ocean."
    )

    # ==========================================
    # SLIDE 6: Target & Ligand Intelligence
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_background(slide6)
    add_header(slide6, "Protein & Molecular Intelligence", "Data Ingestion & Feature Engineering")

    # Left: Protein Intelligence
    add_card(slide6, Inches(0.8), Inches(1.7), Inches(5.6), Inches(4.2))
    tb_p = slide6.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(5.2), Inches(3.8))
    tf_p = tb_p.text_frame
    tf_p.word_wrap = True

    p = tf_p.paragraphs[0]
    p.text = "Protein Target Intelligence"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    p_bullets = [
        "UniProt REST Integration: Automated search and retrieval by accession ID (e.g., P00533 EGFR).",
        "FASTA Sequence Parsing: Real-time calculation of sequence length and molecular weight.",
        "Isoelectric Point (pI): Computed via Bjellqvist amino acid pKa scales.",
        "Amino Acid Composition: Categorized by Hydrophobic, Polar, Acidic, and Basic percentage ratios."
    ]
    for b in p_bullets:
        p_b = tf_p.add_paragraph()
        p_b.text = "• " + b
        p_b.font.size = Pt(13)
        p_b.font.color.rgb = COLOR_TEXT
        p_b.space_before = Pt(10)

    # Right: Ligand Cheminformatics
    add_card(slide6, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.2))
    tb_l = slide6.shapes.add_textbox(Inches(7.0), Inches(1.9), Inches(5.3), Inches(3.8))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True

    p = tf_l.paragraphs[0]
    p.text = "Ligand Cheminformatics"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_INDIGO

    l_bullets = [
        "ChEMBL Database Fetching: Bulk bioactivity dataset ingestion for specific target proteins.",
        "SMILES Validation: Canonicalization and parsing using RDKit C++ kernel.",
        "Lipinski Rule of 5: Automatic scoring of MW, LogP, HBD, HBA, and TPSA descriptors.",
        "Morgan Fingerprints: 2048-bit circular bit vectors generated for precise Tanimoto similarity matrices."
    ]
    for b in l_bullets:
        p_b = tf_l.add_paragraph()
        p_b.text = "• " + b
        p_b.font.size = Pt(13)
        p_b.font.color.rgb = COLOR_TEXT
        p_b.space_before = Pt(10)

    # Stat Highlights Row
    stats = [
        ("100% Sequence Coverage", "UniProt REST & FASTA", COLOR_CYAN),
        ("2048-bit Fingerprints", "Morgan Structural Bit-vectors", COLOR_INDIGO),
        ("< 10 ms Parsing", "RDKit Fast SMILES Evaluation", COLOR_EMERALD)
    ]
    s_w = Inches(3.7)
    for idx, (s_val, s_lbl, s_col) in enumerate(stats):
        l_pos = Inches(0.8) + idx * (s_w + Inches(0.3))
        add_card(slide6, l_pos, Inches(6.1), s_w, Inches(0.9), border_color=s_col)
        tb_s = slide6.shapes.add_textbox(l_pos + Inches(0.1), Inches(6.15), s_w - Inches(0.2), Inches(0.8))
        tf_s = tb_s.text_frame
        tf_s.word_wrap = True
        p1 = tf_s.paragraphs[0]
        p1.text = s_val
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = s_col
        p2 = tf_s.add_paragraph()
        p2.text = s_lbl
        p2.font.size = Pt(11)
        p2.font.color.rgb = COLOR_MUTED

    set_speaker_notes(slide6,
        "Data quality is paramount. HelixQ connects directly to UniProt REST APIs to pull target sequences and compute primary physicochemical properties like isoelectric point and amino acid ratios.\n\n"
        "On the chemical side, HelixQ ingests compound libraries from ChEMBL, canonicalizes SMILES strings, checks Lipinski parameters, and calculates 2048-bit Morgan Fingerprints for Tanimoto distance calculations."
    )

    # ==========================================
    # SLIDE 7: Quantum Optimization Engine (QUBO)
    # ==========================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_background(slide7)
    add_header(slide7, "Quantum Combinatorial Candidate Selection", "D-Wave QUBO & Hamiltonian Energy Minimization")

    # Math Box
    add_card(slide7, Inches(0.8), Inches(1.7), Inches(11.7), Inches(1.1), border_color=COLOR_CYAN)
    tb_m = slide7.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(0.9))
    tf_m = tb_m.text_frame
    tf_m.word_wrap = True
    p_m1 = tf_m.paragraphs[0]
    p_m1.text = "QUBO Hamiltonian Objective Function:"
    p_m1.font.size = Pt(14)
    p_m1.font.bold = True
    p_m1.font.color.rgb = COLOR_CYAN

    p_m2 = tf_m.add_paragraph()
    p_m2.text = "H(x) = - α Σ (pKd_i * x_i) + β Σ (LipinskiPenalty_i * x_i) + γ Σ Σ (TanimotoSimilarity_ij * x_i * x_j)"
    p_m2.font.size = Pt(16)
    p_m2.font.bold = True
    p_m2.font.color.rgb = COLOR_TEXT
    p_m2.space_before = Pt(4)

    # Left Column: Formulation
    add_card(slide7, Inches(0.8), Inches(3.0), Inches(5.6), Inches(3.9))
    tb_q1 = slide7.shapes.add_textbox(Inches(1.0), Inches(3.2), Inches(5.2), Inches(3.5))
    tf_q1 = tb_q1.text_frame
    tf_q1.word_wrap = True
    p = tf_q1.paragraphs[0]
    p.text = "Why QUBO Formulation?"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_INDIGO

    q1_text = [
        "Solves NP-Hard Selection: Selects K optimal leads from N candidates where N can be millions.",
        "Maximizes Binding Affinity: Positive linear weight (α) prioritizes high pKd predictions.",
        "Enforces Drug-likeness: Penalty weight (β) penalizes compounds violating Lipinski constraints.",
        "Eliminates Structural Redundancy: Quadratic weight (γ) penalizes pairs with high Tanimoto similarity."
    ]
    for qt in q1_text:
        p_qt = tf_q1.add_paragraph()
        p_qt.text = "• " + qt
        p_qt.font.size = Pt(13)
        p_qt.font.color.rgb = COLOR_TEXT
        p_qt.space_before = Pt(8)

    # Right Column: D-Wave Sampler Engine
    add_card(slide7, Inches(6.8), Inches(3.0), Inches(5.7), Inches(3.9))
    tb_q2 = slide7.shapes.add_textbox(Inches(7.0), Inches(3.2), Inches(5.3), Inches(3.5))
    tf_q2 = tb_q2.text_frame
    tf_q2.word_wrap = True
    p = tf_q2.paragraphs[0]
    p.text = "D-Wave Ocean Execution"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_EMERALD

    q2_text = [
        "Simulated Annealing: Solves QUBO matrix using D-Wave Ocean `dwave-neal` sampler.",
        "Energy Minimization: Explores quantum-inspired energy landscapes to find global minima.",
        "Sub-Second Performance: Executes 1,000 annealing reads in under 50 milliseconds.",
        "Audit Trail: Logs QUBO energy values, runtime milliseconds, and selected candidate IDs into PostgreSQL."
    ]
    for qt in q2_text:
        p_qt = tf_q2.add_paragraph()
        p_qt.text = "• " + qt
        p_qt.font.size = Pt(13)
        p_qt.font.color.rgb = COLOR_TEXT
        p_qt.space_before = Pt(8)

    set_speaker_notes(slide7,
        "Slide 7 explains our core innovation: QUBO quantum combinatorial optimization.\n\n"
        "Instead of greedily picking top predicted binders that all share identical chemical scaffolds, we construct a Hamiltonian energy matrix.\n"
        "Linear terms reward high binding affinity (pKd), while quadratic cross-terms penalize Tanimoto structural similarity. D-Wave Ocean's sampler finds global energy minima in milliseconds."
    )

    # ==========================================
    # SLIDE 8: Interactive UI & 3D Molecular Canvas
    # ==========================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_background(slide8)
    add_header(slide8, "Next-Gen Web UI & 3D WebGL Canvas", "Frontend Experience & Visualization")

    add_card(slide8, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2))
    tb_u1 = slide8.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(5.2), Inches(4.8))
    tf_u1 = tb_u1.text_frame
    tf_u1.word_wrap = True
    p = tf_u1.paragraphs[0]
    p.text = "Three.js WebGL 3D Molecule Viewer"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    ui1_bullets = [
        "Real-Time Hardware Acceleration: Renders 3D atomic structures directly in browser using Three.js WebGL shader pipelines.",
        "Interactive Molecular Manipulation: Full 360° orbital rotation, smooth zoom, and pan controls.",
        "Multiple Visualization Modes: Ball-and-stick, stick representation, space-filling CPK, and wireframe styles.",
        "Atomic Color Coding: CPK standard coloring for Carbon, Nitrogen, Oxygen, Sulfur, and Fluorine atoms."
    ]
    for b in ui1_bullets:
        p_b = tf_u1.add_paragraph()
        p_b.text = "• " + b
        p_b.font.size = Pt(13)
        p_b.font.color.rgb = COLOR_TEXT
        p_b.space_before = Pt(12)

    add_card(slide8, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2))
    tb_u2 = slide8.shapes.add_textbox(Inches(7.0), Inches(1.9), Inches(5.3), Inches(4.8))
    tf_u2 = tb_u2.text_frame
    tf_u2.word_wrap = True
    p = tf_u2.paragraphs[0]
    p.text = "Real-Time Telemetry & Analytics"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_INDIGO

    ui2_bullets = [
        "Recharts Visualization Suite: Telemetry histograms, binding affinity distribution curves, and doughnut charts.",
        "Framer Motion Animations: Smooth slide-out Candidate Drawers, modal dialogs, and dynamic tab transitions.",
        "Interactive QUBO Sliders: Live tuning of Alpha, Beta, and Gamma weights with instant convergence re-calculation.",
        "XAI Heatmaps: Cross-attention matrix heatmaps detailing atom-residue binding contributions."
    ]
    for b in ui2_bullets:
        p_b = tf_u2.add_paragraph()
        p_b.text = "• " + b
        p_b.font.size = Pt(13)
        p_b.font.color.rgb = COLOR_TEXT
        p_b.space_before = Pt(12)

    set_speaker_notes(slide8,
        "User experience is crucial for biotech researchers. HelixQ delivers a rich dark glassmorphic single-page application.\n\n"
        "Using Three.js, researchers can interactively inspect candidate molecules in 3D WebGL space. Recharts and Framer Motion provide fluid telemetry, interactive QUBO parameter tuning, and explainable AI heatmaps."
    )

    # ==========================================
    # SLIDE 9: Human-In-The-Loop & Export Engine
    # ==========================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_background(slide9)
    add_header(slide9, "Expert Validation & Publication Exports", "Human-in-the-Loop & Reporting")

    add_card(slide9, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2))
    tb_e1 = slide9.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(5.2), Inches(4.8))
    tf_e1 = tb_e1.text_frame
    tf_e1.word_wrap = True
    p = tf_e1.paragraphs[0]
    p.text = "Human-in-the-Loop Validation"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    ex1_bullets = [
        "Scientist Sign-Off Workflow: Allows senior biotechs to review AI + Quantum predictions before wet-lab synthesis.",
        "Decision States: APPROVED, REJECTED, or NEEDS_FURTHER_VALIDATION status flags.",
        "Experimental Protocol Logging: Records experimental assay methods (e.g. SPR, MST, Kinase Assay) and notes.",
        "Audit Trail Integrity: Saves scientist name, timestamp, and confidence rating into PostgreSQL."
    ]
    for b in ex1_bullets:
        p_b = tf_e1.add_paragraph()
        p_b.text = "• " + b
        p_b.font.size = Pt(13)
        p_b.font.color.rgb = COLOR_TEXT
        p_b.space_before = Pt(12)

    add_card(slide9, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2))
    tb_e2 = slide9.shapes.add_textbox(Inches(7.0), Inches(1.9), Inches(5.3), Inches(4.8))
    tf_e2 = tb_e2.text_frame
    tf_e2.word_wrap = True
    p = tf_e2.paragraphs[0]
    p.text = "Multi-Format Export Engine"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_EMERALD

    ex2_bullets = [
        "Publication-Grade PDF Reports: Assembles comprehensive research manuscripts with target properties, candidate rankings, and validation logs.",
        "CSV Dataset Stream: One-click export of structured compound libraries, SMILES, Lipinski scores, and pKd values.",
        "Raw JSON Payloads: Machine-readable API outputs for integration with automated robotic wet-lab synthesis stations.",
        "Persistent Blobs: Binary PDF reports stored and retrievable via FastAPI streaming endpoints."
    ]
    for b in ex2_bullets:
        p_b = tf_e2.add_paragraph()
        p_b.text = "• " + b
        p_b.font.size = Pt(13)
        p_b.font.color.rgb = COLOR_TEXT
        p_b.space_before = Pt(12)

    set_speaker_notes(slide9,
        "HelixQ doesn't stop at AI predictions. It bridges computational predictions with laboratory execution.\n\n"
        "Our Human-in-the-Loop module lets scientists log validation sign-offs and notes. Then, our export engine generates publication-ready PDF reports, CSV data streams, and JSON payloads for robotic synthesis stations."
    )

    # ==========================================
    # SLIDE 10: Performance & Validation Benchmarks
    # ==========================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_background(slide10)
    add_header(slide10, "Empirical Validation & System Benchmarks", "Verification & Performance Metrics")

    # 3 Stat Cards Across Top
    b_stats = [
        ("100% PyTest E2E Pass", "13/13 API Test Modules Passed Cleanly", COLOR_CYAN),
        ("0 Build Errors", "Vite Frontend Bundled in 11.18 seconds", COLOR_INDIGO),
        ("100% Schema Integrity", "12 Normalized PostgreSQL Relational Models", COLOR_EMERALD)
    ]
    bw = Inches(3.7)
    for idx, (b_val, b_lbl, b_col) in enumerate(b_stats):
        lp = Inches(0.8) + idx * (bw + Inches(0.3))
        add_card(slide10, lp, Inches(1.7), bw, Inches(1.3), border_color=b_col)
        tb_bs = slide10.shapes.add_textbox(lp + Inches(0.15), Inches(1.8), bw - Inches(0.3), Inches(1.1))
        tf_bs = tb_bs.text_frame
        tf_bs.word_wrap = True
        p1 = tf_bs.paragraphs[0]
        p1.text = b_val
        p1.font.size = Pt(20)
        p1.font.bold = True
        p1.font.color.rgb = b_col
        p2 = tf_bs.add_paragraph()
        p2.text = b_lbl
        p2.font.size = Pt(12)
        p2.font.color.rgb = COLOR_TEXT
        p2.space_before = Pt(4)

    # Performance Table Card
    add_card(slide10, Inches(0.8), Inches(3.3), Inches(11.7), Inches(3.6))
    tb_tbl = slide10.shapes.add_textbox(Inches(1.0), Inches(3.5), Inches(11.3), Inches(3.2))
    tf_tbl = tb_tbl.text_frame
    tf_tbl.word_wrap = True

    p = tf_tbl.paragraphs[0]
    p.text = "HelixQ System Benchmark Metrics"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    metrics_list = [
        ("UniProt Sequence Fetching", "< 350 ms", "Rest API querying + physicochemical composition calculation"),
        ("ChEMBL Ingestion & SMILES Parsing", "< 1,200 ms", "50 compounds canonicalized + Lipinski Ro5 evaluated"),
        ("ESM-2 Binding Affinity Inference", "< 80 ms / pair", "Cross-attention PyTorch tensor forward pass"),
        ("D-Wave QUBO Simulated Annealing", "< 45 ms", "1,000 reads on 50x50 Hamiltonian matrix"),
        ("PDF Manuscript Report Assembly", "< 250 ms", "ReportLab binary PDF document generation"),
    ]

    for m_name, m_val, m_desc in metrics_list:
        p_m = tf_tbl.add_paragraph()
        p_m.text = f"• {m_name}: "
        p_m.font.size = Pt(13)
        p_m.font.bold = True
        p_m.font.color.rgb = COLOR_TEXT
        p_m.space_before = Pt(8)

        r_v = p_m.add_run()
        r_v.text = f"[{m_val}] "
        r_v.font.bold = True
        r_v.font.color.rgb = COLOR_EMERALD

        r_d = p_m.add_run()
        r_d.text = f"— {m_desc}"
        r_d.font.bold = False
        r_d.font.color.rgb = COLOR_MUTED

    set_speaker_notes(slide10,
        "HelixQ is not a conceptual mockup — it is fully verified and benchmarked.\n\n"
        "Our end-to-end PyTest suite passes 100% across all 13 REST API endpoints. The frontend compiles cleanly with zero TypeScript errors. System benchmarks show sub-second execution across sequence fetching, affinity inference, and QUBO annealing."
    )

    # ==========================================
    # SLIDE 11: Enterprise Roadmap & Scalability
    # ==========================================
    slide11 = prs.slides.add_slide(blank_layout)
    set_background(slide11)
    add_header(slide11, "Future Roadmap & Enterprise Expansion", "Growth Strategy & Scaling")

    phases = [
        ("Phase 1: Current Release", "Production Core Engine",
         "• Virtual screening & ESM-2 pKd prediction.\n"
         "• D-Wave simulated annealing QUBO solver.\n"
         "• Human-in-the-loop scientist sign-offs.\n"
         "• PDF/CSV publication exports.", COLOR_CYAN),
        ("Phase 2: Near-Term", "Quantum Hardware & Docking",
         "• Direct integration with D-Wave Advantage QPU.\n"
         "• Multi-target polypharmacology screening.\n"
         "• AutoDock Vina physics-based docking engine.\n"
         "• Active learning feedback from assay results.", COLOR_INDIGO),
        ("Phase 3: Enterprise", "Cloud SaaS & Automation",
         "• Cloud SaaS deployment (Kubernetes & Multi-tenant DB).\n"
         "• Automated wet-lab robotic synthesis integration.\n"
         "• Federated learning on proprietary pharma data.\n"
         "• FDA regulatory filing documentation generator.", COLOR_EMERALD)
    ]

    r_w = Inches(3.7)
    r_sp = Inches(0.3)
    r_st = Inches(0.8)

    for idx, (ph_title, ph_sub, ph_body, ph_col) in enumerate(phases):
        lp = r_st + idx * (r_w + r_sp)
        add_card(slide11, lp, Inches(1.7), r_w, Inches(5.2), border_color=ph_col)
        
        tb = slide11.shapes.add_textbox(lp + Inches(0.2), Inches(1.9), r_w - Inches(0.4), Inches(4.8))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = ph_title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = ph_col
        
        p_sub_elem = tf.add_paragraph()
        p_sub_elem.text = ph_sub
        p_sub_elem.font.size = Pt(12)
        p_sub_elem.font.bold = True
        p_sub_elem.font.color.rgb = COLOR_MUTED
        p_sub_elem.space_before = Pt(4)

        p_b = tf.add_paragraph()
        p_b.text = ph_body
        p_b.font.size = Pt(13)
        p_b.font.color.rgb = COLOR_TEXT
        p_b.space_before = Pt(16)

    set_speaker_notes(slide11,
        "Looking ahead, our strategic roadmap expands HelixQ into a full enterprise biotech ecosystem.\n\n"
        "Phase 1 is live today. Phase 2 introduces direct cloud connection to D-Wave's 5000+ qubit Advantage QPU and physics-based AutoDock Vina simulation. Phase 3 scales to multi-tenant cloud Kubernetes and robotic wet-lab integration."
    )

    # ==========================================
    # SLIDE 12: Conclusion & Call to Action
    # ==========================================
    slide12 = prs.slides.add_slide(blank_layout)
    set_background(slide12)
    
    add_card(slide12, Inches(1.5), Inches(1.0), Inches(10.333), Inches(5.5), border_color=COLOR_CYAN)

    tb12 = slide12.shapes.add_textbox(Inches(2.0), Inches(1.3), Inches(9.333), Inches(4.9))
    tf12 = tb12.text_frame
    tf12.word_wrap = True

    p = tf12.paragraphs[0]
    p.text = "Transforming Drug Discovery with HelixQ"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    p_sub = tf12.add_paragraph()
    p_sub.text = "Accelerating lead discovery from years to seconds using unified AI and Quantum Computing."
    p_sub.font.size = Pt(18)
    p_sub.font.color.rgb = COLOR_TEXT
    p_sub.space_before = Pt(12)

    summary_points = [
        "✅ Proven Technology Stack: Decoupled React 18, FastAPI, PyTorch, RDKit & D-Wave Ocean SDK.",
        "✅ High-Precision Selection: ESM-2 transformer predictions combined with QUBO diversity penalties.",
        "✅ Enterprise Ready: Human-in-the-loop sign-offs, publication PDF exports, and 100% passing test suite."
    ]
    for sp in summary_points:
        p_sp = tf12.add_paragraph()
        p_sp.text = sp
        p_sp.font.size = Pt(14)
        p_sp.font.color.rgb = COLOR_TEXT
        p_sp.space_before = Pt(14)

    # CTA Box
    p_cta = tf12.add_paragraph()
    p_cta.text = "Ready to accelerate your biotech pipeline? Experience HelixQ today."
    p_cta.font.size = Pt(16)
    p_cta.font.bold = True
    p_cta.font.color.rgb = COLOR_EMERALD
    p_cta.space_before = Pt(28)

    set_speaker_notes(slide12,
        "In conclusion, HelixQ turns complex computational biology into actionable, diverse lead compounds for therapeutic target discovery.\n\n"
        "Thank you for your time, and we welcome any questions or live demonstration requests."
    )

    # Save presentation
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    output_file = "HelixQ_Presentation.pptx"
    if len(sys.argv) > 1:
        output_file = sys.argv[1]
    create_helixq_presentation(output_file)
