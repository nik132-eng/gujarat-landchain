# GL-0701: LangChain Agent Parse Court PDFs Implementation
# Sprint 7: Dispute Resolution Agent
# Gujarat LandChain × AI Document Processing

"""
LangChain Agent for Legal Document Processing
- Objective: Parse court PDFs and extract structured legal data
- Input: Legal documents (property deeds, court filings, certificates)
- Output: Structured JSON with validated legal entities and metadata
- Integration: Evidence bundle generation and governance workflows
"""

import os
import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

# LangChain and AI imports
from langchain.agents import AgentType, initialize_agent
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.callbacks import get_openai_callback

# PDF processing imports
import PyPDF2
import pdfplumber
from pdf2image import convert_from_path
import pytesseract
from PIL import Image

# NLP and entity recognition
import spacy
import re
from dataclasses import dataclass
import hashlib

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Legal Document Schema
@dataclass
class PropertyDetails:
    ulpin_id: Optional[str] = None
    survey_number: Optional[str] = None
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    area_acres: Optional[float] = None
    coordinates: Optional[Dict[str, float]] = None

@dataclass
class PersonEntity:
    name: str
    father_name: Optional[str] = None
    address: Optional[str] = None
    identification: Optional[Dict[str, str]] = None  # Aadhaar, PAN, etc.

@dataclass
class LegalDocument:
    document_type: str
    document_number: Optional[str] = None
    date_issued: Optional[str] = None
    issuing_authority: Optional[str] = None
    property_details: Optional[PropertyDetails] = None
    parties_involved: List[PersonEntity] = None
    legal_status: Optional[str] = None
    ownership_type: Optional[str] = None
    encumbrances: List[str] = None
    extracted_text: str = ""
    confidence_score: float = 0.0
    processing_metadata: Dict[str, Any] = None

class GujaratLegalDocumentParser:
    """
    LangChain-powered legal document parser specifically designed for Gujarat property documents
    """
    
    def __init__(self, openai_api_key: str = None):
        # Initialize AI models
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        if not self.openai_api_key:
            raise ValueError("OpenAI API key required for LangChain agent")
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.1,  # Low temperature for consistent extraction
            openai_api_key=self.openai_api_key,
            max_tokens=2000
        )
        
        # Load spaCy model for NER
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy English model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        # Initialize text splitter for large documents
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=4000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " "]
        )
        
        # Document type patterns
        self.document_patterns = {
            'property_deed': r'(property|deed|transfer|sale)',
            'court_order': r'(court|order|judgment|decree)',
            'survey_record': r'(survey|settlement|record|pahani)',
            'mutation_entry': r'(mutation|entry|registration)',
            'ownership_certificate': r'(ownership|certificate|title|deed)'
        }
        
        # Legal entity patterns for Gujarat
        self.legal_patterns = {
            'ulpin': r'[A-Z]{2}\d{2}[A-Z]{2}\d{10}',  # ULPIN format
            'survey_number': r'Survey No\.?\s*(\d+(?:/\d+)*)',
            'village': r'Village:?\s*([A-Za-z\s]+)',
            'taluka': r'Taluka:?\s*([A-Za-z\s]+)',
            'district': r'District:?\s*([A-Za-z\s]+)',
            'area': r'Area:?\s*(\d+(?:\.\d+)?)\s*(acre|hectare|sq\.?\s*mt)',
            'date': r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
            'aadhaar': r'\b\d{4}\s*\d{4}\s*\d{4}\b',
            'pan': r'[A-Z]{5}\d{4}[A-Z]'
        }

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from PDF with OCR fallback for scanned documents
        """
        extracted_text = ""
        
        try:
            # Method 1: Direct text extraction using PyPDF2
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text.strip():
                        extracted_text += text + "\n"
            
            # Method 2: Enhanced extraction using pdfplumber
            if len(extracted_text.strip()) < 100:  # If extraction was poor
                with pdfplumber.open(pdf_path) as pdf:
                    for page in pdf.pages:
                        text = page.extract_text()
                        if text:
                            extracted_text += text + "\n"
            
            # Method 3: OCR fallback for scanned documents
            if len(extracted_text.strip()) < 100:
                logger.info("Using OCR fallback for scanned document")
                extracted_text = self._extract_text_with_ocr(pdf_path)
                
        except Exception as e:
            logger.error(f"PDF text extraction failed: {e}")
            # Final fallback to OCR
            extracted_text = self._extract_text_with_ocr(pdf_path)
        
        return extracted_text.strip()

    def _extract_text_with_ocr(self, pdf_path: str) -> str:
        """
        OCR text extraction for scanned documents
        """
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path, dpi=300)
            extracted_text = ""
            
            for i, image in enumerate(images):
                # Configure Tesseract for better accuracy
                custom_config = r'--oem 3 --psm 6 -l eng'
                text = pytesseract.image_to_string(image, config=custom_config)
                extracted_text += f"\n--- Page {i+1} ---\n{text}\n"
            
            return extracted_text
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return ""

    def identify_document_type(self, text: str) -> str:
        """
        Identify the type of legal document based on content
        """
        text_lower = text.lower()
        
        for doc_type, pattern in self.document_patterns.items():
            if re.search(pattern, text_lower):
                return doc_type
        
        return "unknown_legal_document"

    def extract_entities_with_spacy(self, text: str) -> Dict[str, List[str]]:
        """
        Extract named entities using spaCy NLP
        """
        entities = {
            'PERSON': [],
            'ORG': [],
            'GPE': [],  # Geopolitical entities (cities, states)
            'DATE': [],
            'MONEY': [],
            'QUANTITY': []
        }
        
        if not self.nlp:
            return entities
        
        try:
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ in entities:
                    entities[ent.label_].append(ent.text.strip())
        except Exception as e:
            logger.error(f"spaCy entity extraction failed: {e}")
        
        return entities

    def extract_legal_patterns(self, text: str) -> Dict[str, List[str]]:
        """
        Extract Gujarat-specific legal patterns using regex
        """
        extracted_patterns = {}
        
        for pattern_name, pattern in self.legal_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                extracted_patterns[pattern_name] = [match.strip() for match in matches if match.strip()]
        
        return extracted_patterns

    def create_legal_extraction_prompt(self, text: str, document_type: str) -> str:
        """
        Create specialized prompt for legal document extraction
        """
        prompt_template = """
You are an expert legal document analyzer specializing in Gujarat property documents. 
Analyze the following {document_type} document and extract structured information.

Document Text:
{text}

Extract the following information in JSON format:

1. PROPERTY DETAILS:
   - ULPIN ID (if mentioned)
   - Survey Number
   - Village/Town name
   - Taluka
   - District
   - Area (with units)
   - Coordinates (if available)

2. PARTIES INVOLVED:
   - Names of all persons mentioned
   - Father's names (where mentioned)
   - Addresses
   - Identification numbers (Aadhaar, PAN, etc.)

3. LEGAL INFORMATION:
   - Document number/reference
   - Date of issue/registration
   - Issuing authority
   - Legal status (clear title, disputed, etc.)
   - Type of ownership (individual, joint, etc.)
   - Any encumbrances or liens mentioned

4. CONFIDENCE ASSESSMENT:
   - Rate your confidence in the extraction (0-100%)
   - Note any unclear or missing information

Please provide a structured JSON response with all extracted information.
If information is not clearly stated, mark as null rather than guessing.

Focus on accuracy and completeness for Gujarat land records and legal documents.
"""
        
        return prompt_template.format(
            document_type=document_type,
            text=text[:4000]  # Limit text length for prompt
        )

    async def process_document_with_langchain(self, text: str, document_type: str) -> Dict[str, Any]:
        """
        Process document using LangChain agent for structured extraction
        """
        try:
            # Create extraction prompt
            prompt = self.create_legal_extraction_prompt(text, document_type)
            
            # Process with LangChain
            with get_openai_callback() as callback:
                result = await self.llm.apredict(prompt)
                
                # Log token usage
                logger.info(f"OpenAI API usage - Tokens: {callback.total_tokens}, Cost: ${callback.total_cost:.4f}")
            
            # Parse JSON response
            try:
                extracted_data = json.loads(result)
                return extracted_data
            except json.JSONDecodeError:
                # Fallback: extract JSON from response if wrapped in text
                json_match = re.search(r'\{.*\}', result, re.DOTALL)
                if json_match:
                    extracted_data = json.loads(json_match.group())
                    return extracted_data
                else:
                    logger.error("Failed to parse JSON from LangChain response")
                    return {"error": "Failed to parse structured output", "raw_response": result}
            
        except Exception as e:
            logger.error(f"LangChain processing failed: {e}")
            return {"error": str(e), "confidence_score": 0.0}

    def validate_extracted_data(self, extracted_data: Dict[str, Any]) -> float:
        """
        Validate extracted data and calculate confidence score
        """
        confidence_factors = []
        
        # Check for required fields
        if extracted_data.get('property_details'):
            property_data = extracted_data['property_details']
            if property_data.get('village'): confidence_factors.append(20)
            if property_data.get('survey_number'): confidence_factors.append(20)
            if property_data.get('district'): confidence_factors.append(15)
            if property_data.get('area'): confidence_factors.append(15)
        
        # Check for parties involved
        if extracted_data.get('parties_involved'):
            parties = extracted_data['parties_involved']
            if len(parties) > 0: confidence_factors.append(15)
            if any(party.get('father_name') for party in parties): confidence_factors.append(10)
        
        # Check for legal information
        if extracted_data.get('document_number'): confidence_factors.append(15)
        if extracted_data.get('date_issued'): confidence_factors.append(10)
        if extracted_data.get('issuing_authority'): confidence_factors.append(10)
        
        # Calculate overall confidence
        total_confidence = sum(confidence_factors)
        return min(total_confidence, 100.0)

    async def parse_legal_document(self, pdf_path: str) -> LegalDocument:
        """
        Main method to parse a legal document and return structured data
        """
        start_time = datetime.now()
        
        # Extract text from PDF
        logger.info(f"Processing document: {pdf_path}")
        extracted_text = self.extract_text_from_pdf(pdf_path)
        
        if not extracted_text:
            return LegalDocument(
                document_type="extraction_failed",
                confidence_score=0.0,
                processing_metadata={"error": "Failed to extract text from PDF"}
            )
        
        # Identify document type
        document_type = self.identify_document_type(extracted_text)
        logger.info(f"Identified document type: {document_type}")
        
        # Extract entities with spaCy
        spacy_entities = self.extract_entities_with_spacy(extracted_text)
        
        # Extract legal patterns
        legal_patterns = self.extract_legal_patterns(extracted_text)
        
        # Process with LangChain for structured extraction
        langchain_result = await self.process_document_with_langchain(extracted_text, document_type)
        
        # Validate and calculate confidence
        confidence_score = self.validate_extracted_data(langchain_result)
        
        # Create structured response
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Parse property details
        property_details = None
        if langchain_result.get('property_details'):
            prop_data = langchain_result['property_details']
            property_details = PropertyDetails(
                ulpin_id=prop_data.get('ulpin_id'),
                survey_number=prop_data.get('survey_number'),
                village=prop_data.get('village'),
                taluka=prop_data.get('taluka'),
                district=prop_data.get('district'),
                area_acres=prop_data.get('area'),
                coordinates=prop_data.get('coordinates')
            )
        
        # Parse parties involved
        parties_involved = []
        if langchain_result.get('parties_involved'):
            for party_data in langchain_result['parties_involved']:
                party = PersonEntity(
                    name=party_data.get('name', ''),
                    father_name=party_data.get('father_name'),
                    address=party_data.get('address'),
                    identification=party_data.get('identification')
                )
                parties_involved.append(party)
        
        # Create final document object
        legal_document = LegalDocument(
            document_type=document_type,
            document_number=langchain_result.get('document_number'),
            date_issued=langchain_result.get('date_issued'),
            issuing_authority=langchain_result.get('issuing_authority'),
            property_details=property_details,
            parties_involved=parties_involved,
            legal_status=langchain_result.get('legal_status'),
            ownership_type=langchain_result.get('ownership_type'),
            encumbrances=langchain_result.get('encumbrances', []),
            extracted_text=extracted_text[:1000] + "..." if len(extracted_text) > 1000 else extracted_text,
            confidence_score=confidence_score,
            processing_metadata={
                "processing_time_seconds": processing_time,
                "text_length": len(extracted_text),
                "spacy_entities": spacy_entities,
                "legal_patterns": legal_patterns,
                "langchain_raw": langchain_result,
                "document_hash": hashlib.sha256(extracted_text.encode()).hexdigest()
            }
        )
        
        logger.info(f"Document processed successfully. Confidence: {confidence_score}%")
        return legal_document

    def export_to_json(self, legal_document: LegalDocument, output_path: str = None) -> str:
        """
        Export processed document to JSON format
        """
        if output_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"processed_document_{timestamp}.json"
        
        # Convert dataclass to dict for JSON serialization
        doc_dict = {
            "document_type": legal_document.document_type,
            "document_number": legal_document.document_number,
            "date_issued": legal_document.date_issued,
            "issuing_authority": legal_document.issuing_authority,
            "property_details": legal_document.property_details.__dict__ if legal_document.property_details else None,
            "parties_involved": [party.__dict__ for party in legal_document.parties_involved] if legal_document.parties_involved else [],
            "legal_status": legal_document.legal_status,
            "ownership_type": legal_document.ownership_type,
            "encumbrances": legal_document.encumbrances,
            "extracted_text": legal_document.extracted_text,
            "confidence_score": legal_document.confidence_score,
            "processing_metadata": legal_document.processing_metadata
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(doc_dict, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Document exported to: {output_path}")
        return output_path

# Demo and Testing Functions
async def demo_document_processing():
    """
    Demo function to test the legal document parser
    """
    # Initialize parser
    parser = GujaratLegalDocumentParser()
    
    # Create sample test data (in real implementation, use actual PDFs)
    sample_documents = [
        "sample_property_deed.pdf",
        "sample_court_order.pdf", 
        "sample_survey_record.pdf"
    ]
    
    results = []
    
    for doc_path in sample_documents:
        if Path(doc_path).exists():
            try:
                result = await parser.parse_legal_document(doc_path)
                results.append(result)
                
                # Export result
                json_path = parser.export_to_json(result)
                print(f"Processed: {doc_path} -> {json_path}")
                
            except Exception as e:
                logger.error(f"Failed to process {doc_path}: {e}")
        else:
            logger.warning(f"Sample document not found: {doc_path}")
    
    return results

if __name__ == "__main__":
    # Run demo
    print("🤖 Gujarat Legal Document Parser - LangChain Implementation")
    print("=" * 60)
    
    # Check environment
    if not os.getenv('OPENAI_API_KEY'):
        print("⚠️  Please set OPENAI_API_KEY environment variable")
        print("Example: export OPENAI_API_KEY='your-api-key-here'")
    else:
        # Run demo processing
        asyncio.run(demo_document_processing())
        print("\n✅ Demo processing complete!")
        print("📄 Check output JSON files for structured legal data extraction")
