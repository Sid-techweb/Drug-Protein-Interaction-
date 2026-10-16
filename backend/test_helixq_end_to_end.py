import sys
import os
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure app is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.main import app
from app.database.connection import Base, get_db

# Use SQLite in-memory engine for fast end-to-end integration verification
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_helixq.db"
test_engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Create all database tables
Base.metadata.create_all(bind=test_engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

print("=====================================================")
print("  HELIXQ END-TO-END VERIFICATION SUITE (SPRINT 1-6)  ")
print("=====================================================")

# 1. Health & Root Endpoint Verification
print("\n[1/12] Verifying System Health & Root Endpoints...")
resp = client.get("/")
assert resp.status_code == 200, f"Root endpoint failed: {resp.text}"
print("   -> Root API Status: 200 OK | Platform:", resp.json().get("platform"))

resp = client.get("/api/v1/health")
assert resp.status_code == 200, f"Health endpoint failed: {resp.text}"
print("   -> Health API Status: 200 OK | Status:", resp.json().get("status"))

# 2. Authentication Verification (Register & Login)
print("\n[2/12] Verifying User Authentication (Register & JWT Issue)...")
user_payload = {
    "email": "researcher@helixq.bio",
    "password": "SecurePassword123!",
    "full_name": "Dr. Antigravity Lead Researcher",
    "organization": "HelixQ BioLabs"
}
resp = client.post("/api/v1/auth/register", json=user_payload)
if resp.status_code == 201:
    token_data = resp.json()
else:
    login_resp = client.post("/api/v1/auth/login", json={"email": user_payload["email"], "password": user_payload["password"]})
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token_data = login_resp.json()

token = token_data.get("access_token")
assert token is not None, "Failed to obtain access token"
headers = {"Authorization": f"Bearer {token}"}
print("   -> Auth API Status: OK | Issued JWT Token")

resp = client.get("/api/v1/auth/me", headers=headers)
assert resp.status_code == 200, f"Current user failed: {resp.text}"
print("   -> Current User Me API Status: 200 OK | User:", resp.json().get("full_name"))

# 3. Reference Metadata Verification
print("\n[3/12] Verifying Bootstrap Reference Domain Metadata...")
resp = client.get("/api/v1/system/metrics")
assert resp.status_code == 200, "System metrics API failed"
print(f"   -> System Metrics API Status: 200 OK ({len(resp.json())} metrics)")

resp = client.get("/api/v1/platform/capabilities")
assert resp.status_code == 200, "Platform capabilities API failed"
print(f"   -> Platform Capabilities API Status: 200 OK ({len(resp.json())} capabilities)")

# 4. Protein Intelligence & UniProt Verification
print("\n[4/12] Verifying Protein Intelligence & UniProt API...")
protein_payload = {
    "name": "Epidermal Growth Factor Receptor",
    "organism": "Homo sapiens",
    "gene_name": "EGFR",
    "sequence": "MRPSGTAGAALLALLAALCPASRALEEKKVCQGTSNKLTQLGTFEDHFLSLQRMFNNCEVVLGNLEITYVQRNYDLSFLKTIQEVAGYVLIALNTVERIPLENLQIIRGNMYYENSYALAVLSNYDANKTGLKELPMRNLQEILHGAVRFSNNPALCNVESIQWRDIVSSDFLSNMSMDFQNHLGSCQKCDPSCPNGSCWGAGEENCQKLTKIICAQQCSGRCRGKSPSDCCHNQCAAGCTGPRESDCLVCRKFRDEATCKDTCPPLMLYNPTTYQMDVNPEGKYSFGATCVKKCPRNYVVTDHGSCVRACGADSYEMEEDGVRKCKKCEGPCRKVCNGIGIGEFKDSLSINATNIKHFKNCTSISGDLHILPVAFRGDSFTHTPPLDPQELDILKTVKEITGFLLIQAWPENRTDLHAFENLEIIRGRTKQHGQFSLAVVSLNITSLGLRSLKEISDGDVIISGNKNLCYANTINWKKLFGTSGQKTKIISNRGENSCKATGQVCHALCSPEGCWGPEPRDCVSCRNVSRGRECVDKCNLLEGEPREFVENSECIQCHPECLPQAMNITCTGRGPDNCIQCAHYIDGPHCVKTCPAGVMGENNTLVWKYADAGHVCHLCHPNCTYGCTGPGLEGCPTNGPKIPSIATGMVGALLLLLVVALGIGLFMRRRHIVRKRTLRRLLQERELVEPLTPSGEAPNQALLRILKETEFKKIKVLGSGAFGTVYKGLWIPEGEKVKIPVAIKELREATSPKANKEILDEAYVMASVDNPHVCRLLGICLTSTVQLITQLMPFGCLLDYVREHKDNIGSQYLLNWCVQIAKGMNYLEDRRLVHRDLAARNVLVKTPQHVKITDFGLAKLLGAEEKEYHAEGGKVPIKWMALESILHRIYTHQSDVWSYGVTVWELMTFGSKPYDGIPASEISSILEKGERLPQPPICTIDVYMIMVKCWMIDADSRPKFRELIIEFSKMARDPQRYLVIQGDERMHLPSPTDSNFYRALMDEEDMDDVVDADEYLIPQQGFFSSPSTSRTPLLSSLSATSNNSTVACIDRNGLQSCPIKEDSFLQRYSSDPTGALTEDSIDDTFLPVPEYINQSVPKRPAGSVQNPVYHNQPLNPAPSRDPHYQDPHSTAVGNPEYLNTVQPTCVNSTFDSPAHWAQKGSHQISLDNPDYQQDFFPKEAKPNGIFKGSTAENAEYLRVAPQSSEFIGA"
}
resp = client.post("/api/v1/protein/paste", json=protein_payload, headers=headers)
assert resp.status_code == 201, f"Protein paste failed: {resp.text}"
protein_data = resp.json()
protein_id = protein_data["id"]
print(f"   -> Protein Intelligence API Status: 201 Created | Protein ID: {protein_id}")

# 5. ESM-2 Protein Embedding Generation
print("\n[5/12] Verifying ESM-2 Protein Embedding Generation...")
resp = client.post(f"/api/v1/embedding/queue/{protein_id}", headers=headers)
assert resp.status_code == 201, f"Embedding generation failed: {resp.text}"
print("   -> ESM-2 Embedding API Status: 201 Created | Status:", resp.json().get("status"))

# 6. ChEMBL Dataset Import & RDKit Processing
print("\n[6/12] Verifying ChEMBL REST API & RDKit Preprocessing Pipeline...")
chembl_req = {
    "name": "EGFR Test Assays",
    "query": "P00533",
    "max_compounds": 10
}
resp = client.post("/api/v1/dataset/chembl-import", json=chembl_req, headers=headers)
assert resp.status_code == 201, f"ChEMBL import failed: {resp.text}"
dataset_data = resp.json()
dataset_id = dataset_data["id"]
print(f"   -> ChEMBL REST & RDKit API Status: 201 Created | Dataset ID: {dataset_id} | Compounds: {dataset_data.get('total_compounds')}")

# 7. Drug Library Search
print("\n[7/12] Verifying Drug Library Search & Filtering...")
resp = client.get("/api/v1/drug?limit=10", headers=headers)
assert resp.status_code == 200, "Drug search API failed"
drugs_resp = resp.json()
drugs_list = drugs_resp["items"]
assert len(drugs_list) > 0, "No drugs returned in drug library"
drug_id = drugs_list[0]["id"]
print(f"   -> Drug Library API Status: 200 OK ({drugs_resp['total']} total compounds available)")

# 8. Candidate Queue System
print("\n[8/12] Verifying Candidate Prediction Queue...")
candidate_req = {
    "drug_ids": [d["id"] for d in drugs_list[:5]],
    "protein_id": protein_id
}
resp = client.post("/api/v1/candidate/queue", json=candidate_req, headers=headers)
assert resp.status_code == 201, f"Candidate queue failed: {resp.text}"
print(f"   -> Candidate Queue API Status: 201 Created ({len(resp.json())} items queued)")

# 9. Multimodal AI Prediction Engine (ESM-2 + GNN + Cross Attention)
print("\n[9/12] Verifying Multimodal AI Prediction Engine...")
batch_pred_req = {
    "protein_id": protein_id,
    "drug_ids": [d["id"] for d in drugs_list[:5]]
}
resp = client.post("/api/v1/prediction/batch", json=batch_pred_req, headers=headers)
assert resp.status_code == 201, f"Batch AI prediction failed: {resp.text}"
predictions = resp.json()
assert len(predictions) > 0, "No AI predictions generated"
pred_id = predictions[0]["id"]
print(f"   -> Multimodal AI Prediction API Status: 201 Created | Top Probability: {predictions[0]['interaction_probability']} | Status: {predictions[0]['prediction_status']}")

# 10. Explainable AI (XAI) Attribution Heatmap
print(f"\n[10/12] Verifying Explainable AI Heatmap for Prediction '{pred_id}'...")
resp = client.get(f"/api/v1/explainability/heatmap/{pred_id}", headers=headers)
assert resp.status_code == 200, f"Explainability API failed: {resp.text}"
explain_data = resp.json()
print("   -> Explainability XAI API Status: 200 OK | Residues:", len(explain_data["top_protein_residues"]), "| Pharmacophore Atoms:", len(explain_data["top_drug_atoms"]))

# 11. Quantum QUBO Candidate Optimization (D-Wave Simulated Annealing)
print("\n[11/12] Verifying QUBO Quantum Optimization Engine...")
qubo_req = {
    "protein_id": protein_id,
    "prediction_ids": [p["id"] for p in predictions],
    "weights": {
        "weight_probability": 1.0,
        "weight_affinity": 1.0,
        "weight_lipinski": 0.5,
        "weight_diversity_penalty": 0.8
    }
}
resp = client.post("/api/v1/quantum/optimize", json=qubo_req, headers=headers)
assert resp.status_code == 201, f"Quantum optimization failed: {resp.text}"
quantum_job = resp.json()
job_id = quantum_job["id"]
print(f"   -> Quantum QUBO API Status: 201 Created | Job ID: {job_id} | E_min: {quantum_job['qubo_energy']} | Runtime: {quantum_job['runtime_ms']} ms")

# 12. Scientific Report & PDF/CSV/JSON Exports & Analytics
print("\n[12/12] Verifying Scientific Report Generator, Multi-Format Exports & Analytics...")
rep_req = {
    "title": "Automated End-to-End Test Virtual Screening Report",
    "protein_id": protein_id
}
resp = client.post("/api/v1/report/generate", json=rep_req, headers=headers)
assert resp.status_code == 201, f"Report generation failed: {resp.text}"
report_id = resp.json()["id"]
print(f"   -> Scientific Report Generator API Status: 201 Created | Report ID: {report_id}")

resp = client.get(f"/api/v1/export/pdf/{report_id}", headers=headers)
assert resp.status_code == 200, "PDF Export API failed"
print("   -> PDF/Markdown Export API Status: 200 OK")

resp = client.get(f"/api/v1/export/csv/{report_id}", headers=headers)
assert resp.status_code == 200, "CSV Export API failed"
print("   -> CSV Export API Status: 200 OK")

resp = client.get(f"/api/v1/export/json/{report_id}", headers=headers)
assert resp.status_code == 200, "JSON Export API failed"
print("   -> JSON Payload Export API Status: 200 OK")

# 13. Scientist Validation Human-in-the-Loop Verification
print("\n[13/13] Verifying Scientist Validation Human-in-the-Loop API...")
top_drug_id = predictions[0]["drug_id"]
val_payload = {
    "protein_id": protein_id,
    "drug_id": top_drug_id,
    "decision": "APPROVED",
    "experimental_notes": "In-vitro SPR assay confirmed tight Kd = 1.2 nM binding to EGFR kinase domain.",
    "experimental_method": "IN_VITRO",
    "confidence": 98.5,
    "scientist_name": "Dr. Antigravity Lead Researcher",
    "institution": "HelixQ BioLabs"
}
resp = client.post("/api/v1/validation", json=val_payload, headers=headers)
assert resp.status_code == 201, f"Scientist validation submission failed: {resp.text}"
val_data = resp.json()
print(f"   -> Scientist Validation API Status: 201 Created | Decision: {val_data['decision']} | Scientist: {val_data['scientist_name']}")

resp = client.get(f"/api/v1/validation/protein/{protein_id}", headers=headers)
assert resp.status_code == 200, "Get protein validations failed"
assert len(resp.json()) >= 1, "Validation record not retrieved"
print(f"   -> Get Protein Validations API Status: 200 OK | Count: {len(resp.json())}")

print("\n=====================================================")
print("   ALL 13 HELIXQ API MODULES PASSED WITH 100% SUCCESS  ")
print("=====================================================")

# Cleanup test sqlite db
if os.path.exists("./test_helixq.db"):
    try:
        os.remove("./test_helixq.db")
    except Exception:
        pass
