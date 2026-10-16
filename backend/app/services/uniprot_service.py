import httpx
import re
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.configs.app_config import settings
from app.exceptions.base_exceptions import HelixQException
from app.constants.error_codes import ErrorCode
from app.models.protein import Protein, ProteinMetadata
from app.repositories.protein_repository import ProteinRepository
from app.services.protein_service import ProteinService
from app.logging.logger import logger

GENE_TYPO_MAP = {
    "EFGR": "EGFR",
    "EGF-R": "EGFR",
    "HER2": "ERBB2",
    "HER-2": "ERBB2",
    "TP-53": "TP53",
    "TP 53": "TP53",
    "PD1": "PDCD1",
    "PD-1": "PDCD1",
    "PDL1": "CD274",
    "PD-L1": "CD274",
    "ACE-2": "ACE2",
    "BRCA": "BRCA1",
    "VEGF": "VEGFA",
    "TNF-A": "TNF",
    "TNF-ALPHA": "TNF",
    "KRAS2": "KRAS",
    "AKT": "AKT1",
}

class UniProtService:
    """
    Production REST integration service for UniProt Knowledgebase (UniProtKB).
    Queries https://rest.uniprot.org/uniprotkb/ asynchronously.
    Supports UniProt Accession IDs (e.g. P00533), Gene Symbols (e.g. EGFR, TP53),
    and intelligent fuzzy typo resolution (e.g. EFGR -> EGFR).
    """
    def __init__(self, db: Optional[Session] = None, base_url: Optional[str] = None):
        self.db = db
        self.base_url = base_url or settings.UNIPROT_API_BASE_URL
        self.timeout = 15.0

    def _get_search_candidates(self, query: str) -> list[str]:
        q_clean = query.strip()
        q_upper = q_clean.upper()
        candidates = []

        # 1. Direct typo map lookup
        if q_upper in GENE_TYPO_MAP:
            candidates.append(GENE_TYPO_MAP[q_upper])

        # 2. Original query
        if q_clean not in candidates:
            candidates.append(q_clean)

        # 3. Transposition candidates (e.g. EFGR -> EGFR)
        if len(q_upper) >= 3 and q_upper.isalpha():
            for i in range(len(q_upper) - 1):
                arr = list(q_upper)
                arr[i], arr[i+1] = arr[i+1], arr[i]
                cand_str = "".join(arr)
                if cand_str in GENE_TYPO_MAP:
                    mapped = GENE_TYPO_MAP[cand_str]
                    if mapped not in candidates:
                        candidates.append(mapped)
                elif cand_str not in candidates:
                    candidates.append(cand_str)

        return candidates

    async def search_and_fetch(self, query: str) -> Dict[str, Any]:
        """
        Queries UniProt REST API by Accession (e.g., P00533) or Gene/Protein Name (e.g. EGFR).
        Handles direct accession lookups, gene symbol search queries, and intelligent typo resolution.
        """
        clean_query = (query or "").strip()
        if not clean_query or len(clean_query) < 2:
            raise HelixQException(
                "Please enter a valid UniProt Accession ID (e.g., P00533) or Gene Symbol (e.g., EGFR).",
                ErrorCode.VALIDATION_ERROR,
                status_code=400
            )

        logger.info(f"Executing UniProt REST lookup for query: '{clean_query}'")
        candidates = self._get_search_candidates(clean_query)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            # 1. Try Direct Accession Lookup if original query looks like a standard UniProt Accession ID
            if re.match(r"^[A-Za-z0-9]{6,10}$", clean_query):
                direct_url = f"{self.base_url}{clean_query.upper()}.json"
                try:
                    resp = await client.get(direct_url)
                    if resp.status_code == 200:
                        logger.info(f"Direct UniProt accession match found for '{clean_query}'")
                        return self._parse_uniprot_json(resp.json())
                except httpx.HTTPError as exc:
                    logger.debug(f"Direct UniProt accession lookup skipped for '{clean_query}': {str(exc)}")

            # 2. Iterate through search candidates (handles gene symbols, aliases & typos)
            for cand in candidates:
                query_encoded = httpx.URL(f"https://rest.uniprot.org/uniprotkb/search?query=(gene_exact:{cand} OR gene:{cand} OR accession:{cand} OR {cand}) AND reviewed:true&format=json&size=5")
                try:
                    search_resp = await client.get(query_encoded)
                    if search_resp.status_code == 200:
                        data = search_resp.json()
                        results = data.get("results", [])
                        if results:
                            human_result = next((r for r in results if r.get("organism", {}).get("scientificName") == "Homo sapiens"), results[0])
                            logger.info(f"UniProt query search match found for '{cand}' (original query: '{clean_query}', accession: {human_result.get('primaryAccession')})")
                            return self._parse_uniprot_json(human_result)
                except httpx.HTTPError as exc:
                    logger.warning(f"Targeted UniProt query search failed for candidate '{cand}': {str(exc)}")

            # 3. Fallback General Search Query if targeted searches yielded no results
            for cand in candidates:
                fallback_url = f"https://rest.uniprot.org/uniprotkb/search?query={cand}&format=json&size=5"
                try:
                    fallback_resp = await client.get(fallback_url)
                    if fallback_resp.status_code == 200:
                        data = fallback_resp.json()
                        results = data.get("results", [])
                        if results:
                            logger.info(f"UniProt fallback search match found for '{cand}' (original: '{clean_query}')")
                            return self._parse_uniprot_json(results[0])
                except httpx.HTTPError as exc:
                    logger.error(f"UniProt fallback search failed for candidate '{cand}': {str(exc)}")

        # 4. If no results found after all candidates
        suggestion = " Did you mean 'EGFR'?" if clean_query.upper() in ["EFGR", "EGF-R"] else ""
        raise HelixQException(
            f"No protein entries found matching UniProt query '{clean_query}'.{suggestion} Please verify the accession ID or gene symbol.",
            ErrorCode.NOT_FOUND,
            status_code=404
        )

    def _parse_uniprot_json(self, entry: Dict[str, Any]) -> Dict[str, Any]:
        """Parses UniProt API JSON response into structured protein domain fields."""
        accession = entry.get("primaryAccession", "UNKNOWN")
        
        # Protein Name
        protein_description = entry.get("proteinDescription", {})
        rec_name = protein_description.get("recommendedName", {}).get("fullName", {}).get("value")
        if not rec_name:
            sub_names = protein_description.get("submissionNames", [])
            if sub_names:
                rec_name = sub_names[0].get("fullName", {}).get("value")
        name = rec_name or f"UniProt Entry {accession}"

        # Gene Name
        genes = entry.get("genes", [])
        gene_name = genes[0].get("geneName", {}).get("value") if genes else None

        # Organism
        organism = entry.get("organism", {}).get("scientificName", "Homo sapiens")

        # Sequence
        sequence_data = entry.get("sequence", {})
        sequence = sequence_data.get("value", "")
        length = sequence_data.get("length", len(sequence))

        # Function Comment
        comments = entry.get("comments", [])
        func_text = None
        for c in comments:
            if c.get("commentType") == "FUNCTION":
                texts = c.get("texts", [])
                if texts:
                    func_text = texts[0].get("value")
                    break

        return {
            "accession_id": accession,
            "name": name,
            "gene_name": gene_name,
            "organism": organism,
            "sequence": sequence,
            "length": length,
            "function_description": func_text
        }

    async def search_and_store_protein(self, query: str, user_id: str) -> Protein:
        """Fetch entry from UniProt REST API, validate sequence, compute properties, and persist to PostgreSQL."""
        if not self.db:
            raise HelixQException("Database session required for storing protein.", ErrorCode.INTERNAL_SERVER_ERROR)

        repo = ProteinRepository(self.db)
        parsed = await self.search_and_fetch(query)

        # Check if already present for user
        existing = repo.get_by_accession(parsed["accession_id"], user_id)
        if existing:
            return existing

        # Validate sequence
        seq = ProteinService.clean_and_validate_sequence(parsed["sequence"])
        props = ProteinService.calculate_physicochemical_properties(seq)

        protein = Protein(
            accession_id=parsed["accession_id"],
            name=parsed["name"],
            organism=parsed["organism"],
            gene_name=parsed["gene_name"],
            sequence=seq,
            length=len(seq),
            function_description=parsed["function_description"],
            source_type="UNIPROT",
            user_id=user_id
        )

        metadata = ProteinMetadata(
            hydrophobic_pct=props["hydrophobic_pct"],
            polar_pct=props["polar_pct"],
            basic_pct=props["basic_pct"],
            acidic_pct=props["acidic_pct"],
            molecular_weight=props["molecular_weight"],
            isoelectric_point=props["isoelectric_point"],
            composition_json=props["composition_json"]
        )

        return repo.create_protein_with_metadata(protein, metadata)
