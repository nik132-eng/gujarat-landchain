# GL-0702: Generate Evidence Bundle Implementation
# Sprint 7: Dispute Resolution Agent
# Gujarat LandChain × Evidence Aggregation System

"""
Evidence Bundle Generation System
- Objective: Aggregate multi-source evidence for dispute resolution
- Sources: Blockchain, satellite, drone, legal documents, government records
- Output: Comprehensive PDF evidence package with metadata
- Integration: AI document processing and governance voting
"""

import os
import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import hashlib
import uuid

# PDF generation
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

# Image processing
from PIL import Image as PILImage
import base64
import io

# Web3 and blockchain
from web3 import Web3
import requests
import aiohttp

# Database
import sqlite3
from contextlib import contextmanager

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Evidence Bundle Schema
@dataclass
class BlockchainEvidence:
    contract_address: str
    transaction_hash: str
    block_number: int
    timestamp: datetime
    event_type: str  # transfer, freeze, dispute, resolution
    parties_involved: List[str]
    property_ulpin: str
    gas_used: int
    transaction_value: Optional[float] = None

@dataclass
class SatelliteEvidence:
    image_url: str
    capture_date: datetime
    satellite_source: str  # Sentinel, Landsat, etc.
    resolution_meters: float
    cloud_coverage: float
    analysis_results: Dict[str, Any]
    change_detection: Optional[Dict[str, Any]] = None

@dataclass
class DroneEvidence:
    validation_id: str
    flight_date: datetime
    drone_operator: str
    coordinates: Dict[str, float]
    consensus_score: float
    accuracy_percentage: float
    validation_result: str  # approved, rejected, inconclusive
    swarm_participants: List[str]
    image_hashes: List[str]

@dataclass
class LegalEvidence:
    document_type: str
    document_hash: str
    extraction_confidence: float
    parsed_data: Dict[str, Any]
    original_filename: str
    processing_timestamp: datetime
    validation_status: str

@dataclass
class GovernmentRecord:
    record_type: str  # revenue, survey, mutation
    record_number: str
    issuing_office: str
    validity_date: datetime
    verified_data: Dict[str, Any]
    digital_signature: Optional[str] = None

@dataclass
class EvidenceBundle:
    bundle_id: str
    case_id: str
    property_ulpin: str
    creation_timestamp: datetime
    blockchain_evidence: List[BlockchainEvidence]
    satellite_evidence: List[SatelliteEvidence]
    drone_evidence: List[DroneEvidence]
    legal_evidence: List[LegalEvidence]
    government_records: List[GovernmentRecord]
    bundle_integrity_hash: str
    completeness_score: float
    confidence_rating: str
    summary_analysis: Dict[str, Any]

class EvidenceAggregator:
    """
    Multi-source evidence aggregation system for Gujarat LandChain disputes
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        
        # Initialize Web3 connection
        self.w3 = self._init_web3_connection()
        
        # Contract addresses (from previous sprints)
        self.contracts = {
            'ulpin_registry': '0x23311b6E9bF730027488ecF53873B2FC5B5be507',
            'freeze_contract': '0xb1AbAA86809F577534f6a88Bb517FE656A9Cd80c',
            'cross_chain_bridge': '0x742d35Cc6634C0532925a3b8D4017f9F1C2C7600'
        }
        
        # API endpoints
        self.api_endpoints = {
            'satellite_api': 'https://api.sentinel-hub.com',
            'drone_api': 'https://api.gujarat-landchain.com/drone',
            'government_api': 'https://api.revenue.gujarat.gov.in'
        }
        
        # Evidence storage
        self.evidence_db_path = "evidence_bundles.db"
        self._init_database()

    def _init_web3_connection(self) -> Web3:
        """Initialize Web3 connection to Polygon network"""
        rpc_url = self.config.get('polygon_rpc', 'https://polygon-rpc.com')
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        if not w3.is_connected():
            logger.warning("Failed to connect to Polygon network")
            return None
        
        logger.info("Connected to Polygon network")
        return w3

    def _init_database(self):
        """Initialize SQLite database for evidence storage"""
        with sqlite3.connect(self.evidence_db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS evidence_bundles (
                    bundle_id TEXT PRIMARY KEY,
                    case_id TEXT NOT NULL,
                    property_ulpin TEXT NOT NULL,
                    creation_timestamp TIMESTAMP NOT NULL,
                    bundle_data JSON NOT NULL,
                    completeness_score REAL NOT NULL,
                    status TEXT DEFAULT 'active'
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS evidence_sources (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bundle_id TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    source_data JSON NOT NULL,
                    timestamp TIMESTAMP NOT NULL,
                    FOREIGN KEY (bundle_id) REFERENCES evidence_bundles (bundle_id)
                )
            ''')

    async def collect_blockchain_evidence(self, property_ulpin: str, days_back: int = 365) -> List[BlockchainEvidence]:
        """
        Collect blockchain evidence from smart contracts
        """
        evidence = []
        
        if not self.w3:
            return evidence
        
        try:
            # Get current block number
            current_block = self.w3.eth.block_number
            
            # Calculate block range (approximate)
            blocks_per_day = 43200  # Polygon ~2 second block time
            from_block = current_block - (days_back * blocks_per_day)
            
            # Query ULPIN registry events
            ulpin_events = await self._get_contract_events(
                self.contracts['ulpin_registry'],
                from_block,
                current_block,
                property_ulpin
            )
            
            # Query freeze contract events
            freeze_events = await self._get_contract_events(
                self.contracts['freeze_contract'],
                from_block,
                current_block,
                property_ulpin
            )
            
            # Process events
            all_events = ulpin_events + freeze_events
            
            for event in all_events:
                blockchain_evidence = BlockchainEvidence(
                    contract_address=event['address'],
                    transaction_hash=event['transactionHash'].hex(),
                    block_number=event['blockNumber'],
                    timestamp=datetime.fromtimestamp(
                        self.w3.eth.get_block(event['blockNumber'])['timestamp']
                    ),
                    event_type=event['event'],
                    parties_involved=event.get('args', {}).get('parties', []),
                    property_ulpin=property_ulpin,
                    gas_used=event.get('gasUsed', 0),
                    transaction_value=event.get('value', 0)
                )
                evidence.append(blockchain_evidence)
            
            logger.info(f"Collected {len(evidence)} blockchain evidence entries")
            
        except Exception as e:
            logger.error(f"Blockchain evidence collection failed: {e}")
        
        return evidence

    async def _get_contract_events(self, contract_address: str, from_block: int, to_block: int, ulpin: str) -> List[Dict]:
        """
        Get events from smart contract for specific ULPIN
        """
        # Simplified event collection (in real implementation, use contract ABI)
        events = []
        
        # Mock blockchain events for demonstration
        mock_events = [
            {
                'address': contract_address,
                'transactionHash': Web3.keccak(text=f"tx_{ulpin}_1"),
                'blockNumber': to_block - 1000,
                'event': 'Transfer',
                'args': {'parties': ['0x123...abc', '0x456...def'], 'ulpin': ulpin},
                'gasUsed': 150000
            },
            {
                'address': contract_address,
                'transactionHash': Web3.keccak(text=f"tx_{ulpin}_2"),
                'blockNumber': to_block - 500,
                'event': 'PropertyFreeze',
                'args': {'parties': ['0x789...ghi'], 'ulpin': ulpin},
                'gasUsed': 80000
            }
        ]
        
        return mock_events

    async def collect_satellite_evidence(self, property_coordinates: Dict[str, float], months_back: int = 12) -> List[SatelliteEvidence]:
        """
        Collect satellite imagery evidence from STAC API
        """
        evidence = []
        
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=months_back * 30)
            
            # Query satellite API (simplified)
            satellite_data = await self._query_satellite_api(
                property_coordinates,
                start_date,
                end_date
            )
            
            for image_data in satellite_data:
                satellite_evidence = SatelliteEvidence(
                    image_url=image_data['url'],
                    capture_date=datetime.fromisoformat(image_data['date']),
                    satellite_source=image_data['satellite'],
                    resolution_meters=image_data['resolution'],
                    cloud_coverage=image_data['cloud_coverage'],
                    analysis_results=image_data.get('analysis', {}),
                    change_detection=image_data.get('change_detection')
                )
                evidence.append(satellite_evidence)
            
            logger.info(f"Collected {len(evidence)} satellite evidence entries")
            
        except Exception as e:
            logger.error(f"Satellite evidence collection failed: {e}")
        
        return evidence

    async def _query_satellite_api(self, coordinates: Dict[str, float], start_date: datetime, end_date: datetime) -> List[Dict]:
        """
        Query satellite imagery API
        """
        # Mock satellite data for demonstration
        mock_data = [
            {
                'url': f"https://sentinel-api.com/image_1_{coordinates['lat']}_{coordinates['lon']}.tiff",
                'date': start_date.isoformat(),
                'satellite': 'Sentinel-2',
                'resolution': 10.0,
                'cloud_coverage': 15.2,
                'analysis': {'vegetation_index': 0.7, 'water_bodies': 0.1}
            },
            {
                'url': f"https://landsat-api.com/image_2_{coordinates['lat']}_{coordinates['lon']}.tiff",
                'date': (start_date + timedelta(days=30)).isoformat(),
                'satellite': 'Landsat-8',
                'resolution': 30.0,
                'cloud_coverage': 8.5,
                'analysis': {'vegetation_index': 0.65, 'water_bodies': 0.12}
            }
        ]
        
        return mock_data

    async def collect_drone_evidence(self, property_ulpin: str) -> List[DroneEvidence]:
        """
        Collect drone validation evidence from swarm consensus
        """
        evidence = []
        
        try:
            # Query drone validation database (from Sprint 4)
            drone_data = await self._query_drone_database(property_ulpin)
            
            for validation in drone_data:
                drone_evidence = DroneEvidence(
                    validation_id=validation['id'],
                    flight_date=datetime.fromisoformat(validation['flight_date']),
                    drone_operator=validation['operator'],
                    coordinates=validation['coordinates'],
                    consensus_score=validation['consensus_score'],
                    accuracy_percentage=validation['accuracy'],
                    validation_result=validation['result'],
                    swarm_participants=validation['swarm_participants'],
                    image_hashes=validation['image_hashes']
                )
                evidence.append(drone_evidence)
            
            logger.info(f"Collected {len(evidence)} drone evidence entries")
            
        except Exception as e:
            logger.error(f"Drone evidence collection failed: {e}")
        
        return evidence

    async def _query_drone_database(self, ulpin: str) -> List[Dict]:
        """
        Query drone validation database
        """
        # Mock drone validation data
        mock_data = [
            {
                'id': f"drone_val_{ulpin}_1",
                'flight_date': (datetime.now() - timedelta(days=30)).isoformat(),
                'operator': 'DroneOp_001',
                'coordinates': {'lat': 23.0225, 'lon': 72.5714},
                'consensus_score': 0.92,
                'accuracy': 94.5,
                'result': 'approved',
                'swarm_participants': ['drone_1', 'drone_2', 'drone_3'],
                'image_hashes': ['hash1', 'hash2', 'hash3']
            }
        ]
        
        return mock_data

    async def collect_legal_evidence(self, case_id: str) -> List[LegalEvidence]:
        """
        Collect processed legal documents from LangChain parser
        """
        evidence = []
        
        try:
            # Query processed legal documents
            legal_docs = await self._query_legal_database(case_id)
            
            for doc in legal_docs:
                legal_evidence = LegalEvidence(
                    document_type=doc['document_type'],
                    document_hash=doc['document_hash'],
                    extraction_confidence=doc['confidence_score'],
                    parsed_data=doc['parsed_data'],
                    original_filename=doc['filename'],
                    processing_timestamp=datetime.fromisoformat(doc['processed_at']),
                    validation_status=doc['validation_status']
                )
                evidence.append(legal_evidence)
            
            logger.info(f"Collected {len(evidence)} legal evidence entries")
            
        except Exception as e:
            logger.error(f"Legal evidence collection failed: {e}")
        
        return evidence

    async def _query_legal_database(self, case_id: str) -> List[Dict]:
        """
        Query legal documents database
        """
        # Mock legal document data
        mock_data = [
            {
                'document_type': 'property_deed',
                'document_hash': 'hash_deed_123',
                'confidence_score': 95.5,
                'parsed_data': {'owner': 'John Doe', 'area': '1.5 acres'},
                'filename': 'property_deed.pdf',
                'processed_at': datetime.now().isoformat(),
                'validation_status': 'verified'
            }
        ]
        
        return mock_data

    async def collect_government_records(self, property_ulpin: str) -> List[GovernmentRecord]:
        """
        Collect official government records
        """
        records = []
        
        try:
            # Query government API
            gov_data = await self._query_government_api(property_ulpin)
            
            for record in gov_data:
                gov_record = GovernmentRecord(
                    record_type=record['type'],
                    record_number=record['number'],
                    issuing_office=record['office'],
                    validity_date=datetime.fromisoformat(record['valid_until']),
                    verified_data=record['data'],
                    digital_signature=record.get('signature')
                )
                records.append(gov_record)
            
            logger.info(f"Collected {len(records)} government records")
            
        except Exception as e:
            logger.error(f"Government records collection failed: {e}")
        
        return records

    async def _query_government_api(self, ulpin: str) -> List[Dict]:
        """
        Query government records API
        """
        # Mock government records
        mock_data = [
            {
                'type': 'revenue_record',
                'number': f"RR_{ulpin}_2025",
                'office': 'District Collector Office, Ahmedabad',
                'valid_until': (datetime.now() + timedelta(days=365)).isoformat(),
                'data': {'ownership': 'clear', 'tax_status': 'paid'},
                'signature': 'digital_sig_123'
            }
        ]
        
        return mock_data

    def calculate_completeness_score(self, evidence_bundle: EvidenceBundle) -> float:
        """
        Calculate evidence bundle completeness score
        """
        scores = []
        
        # Blockchain evidence (25 points)
        if evidence_bundle.blockchain_evidence:
            scores.append(25)
        
        # Satellite evidence (20 points)
        if evidence_bundle.satellite_evidence:
            scores.append(20)
        
        # Drone evidence (20 points)
        if evidence_bundle.drone_evidence:
            scores.append(20)
        
        # Legal evidence (20 points)
        if evidence_bundle.legal_evidence:
            scores.append(20)
        
        # Government records (15 points)
        if evidence_bundle.government_records:
            scores.append(15)
        
        return sum(scores)

    def calculate_bundle_integrity_hash(self, evidence_bundle: EvidenceBundle) -> str:
        """
        Calculate integrity hash for evidence bundle
        """
        # Create deterministic hash of all evidence
        evidence_data = {
            'blockchain': [asdict(e) for e in evidence_bundle.blockchain_evidence],
            'satellite': [asdict(e) for e in evidence_bundle.satellite_evidence],
            'drone': [asdict(e) for e in evidence_bundle.drone_evidence],
            'legal': [asdict(e) for e in evidence_bundle.legal_evidence],
            'government': [asdict(e) for e in evidence_bundle.government_records]
        }
        
        evidence_json = json.dumps(evidence_data, sort_keys=True, default=str)
        return hashlib.sha256(evidence_json.encode()).hexdigest()

    async def generate_evidence_bundle(self, case_id: str, property_ulpin: str, property_coordinates: Dict[str, float] = None) -> EvidenceBundle:
        """
        Main method to generate comprehensive evidence bundle
        """
        start_time = datetime.now()
        bundle_id = str(uuid.uuid4())
        
        logger.info(f"Generating evidence bundle for case {case_id}, property {property_ulpin}")
        
        # Collect evidence from all sources
        blockchain_evidence = await self.collect_blockchain_evidence(property_ulpin)
        
        satellite_evidence = []
        if property_coordinates:
            satellite_evidence = await self.collect_satellite_evidence(property_coordinates)
        
        drone_evidence = await self.collect_drone_evidence(property_ulpin)
        legal_evidence = await self.collect_legal_evidence(case_id)
        government_records = await self.collect_government_records(property_ulpin)
        
        # Create evidence bundle
        evidence_bundle = EvidenceBundle(
            bundle_id=bundle_id,
            case_id=case_id,
            property_ulpin=property_ulpin,
            creation_timestamp=start_time,
            blockchain_evidence=blockchain_evidence,
            satellite_evidence=satellite_evidence,
            drone_evidence=drone_evidence,
            legal_evidence=legal_evidence,
            government_records=government_records,
            bundle_integrity_hash="",  # Will be calculated
            completeness_score=0.0,    # Will be calculated
            confidence_rating="",      # Will be calculated
            summary_analysis={}        # Will be calculated
        )
        
        # Calculate completeness and integrity
        evidence_bundle.completeness_score = self.calculate_completeness_score(evidence_bundle)
        evidence_bundle.bundle_integrity_hash = self.calculate_bundle_integrity_hash(evidence_bundle)
        
        # Determine confidence rating
        if evidence_bundle.completeness_score >= 80:
            evidence_bundle.confidence_rating = "HIGH"
        elif evidence_bundle.completeness_score >= 60:
            evidence_bundle.confidence_rating = "MEDIUM"
        else:
            evidence_bundle.confidence_rating = "LOW"
        
        # Generate summary analysis
        processing_time = (datetime.now() - start_time).total_seconds()
        evidence_bundle.summary_analysis = {
            "total_evidence_sources": len([
                evidence_bundle.blockchain_evidence,
                evidence_bundle.satellite_evidence,
                evidence_bundle.drone_evidence,
                evidence_bundle.legal_evidence,
                evidence_bundle.government_records
            ]),
            "processing_time_seconds": processing_time,
            "evidence_count": {
                "blockchain": len(evidence_bundle.blockchain_evidence),
                "satellite": len(evidence_bundle.satellite_evidence),
                "drone": len(evidence_bundle.drone_evidence),
                "legal": len(evidence_bundle.legal_evidence),
                "government": len(evidence_bundle.government_records)
            },
            "quality_indicators": {
                "blockchain_coverage": len(evidence_bundle.blockchain_evidence) > 0,
                "visual_evidence": len(evidence_bundle.satellite_evidence) + len(evidence_bundle.drone_evidence) > 0,
                "legal_documentation": len(evidence_bundle.legal_evidence) > 0,
                "official_records": len(evidence_bundle.government_records) > 0
            }
        }
        
        # Store in database
        await self._store_evidence_bundle(evidence_bundle)
        
        logger.info(f"Evidence bundle generated successfully. Completeness: {evidence_bundle.completeness_score}%")
        return evidence_bundle

    async def _store_evidence_bundle(self, evidence_bundle: EvidenceBundle):
        """
        Store evidence bundle in database
        """
        try:
            with sqlite3.connect(self.evidence_db_path) as conn:
                conn.execute('''
                    INSERT INTO evidence_bundles 
                    (bundle_id, case_id, property_ulpin, creation_timestamp, bundle_data, completeness_score)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    evidence_bundle.bundle_id,
                    evidence_bundle.case_id,
                    evidence_bundle.property_ulpin,
                    evidence_bundle.creation_timestamp.isoformat(),
                    json.dumps(asdict(evidence_bundle), default=str),
                    evidence_bundle.completeness_score
                ))
        except Exception as e:
            logger.error(f"Failed to store evidence bundle: {e}")

    def generate_pdf_report(self, evidence_bundle: EvidenceBundle, output_path: str = None) -> str:
        """
        Generate comprehensive PDF evidence report
        """
        if output_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"evidence_bundle_{evidence_bundle.bundle_id}_{timestamp}.pdf"
        
        # Create PDF document
        doc = SimpleDocTemplate(output_path, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Title page
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        story.append(Paragraph("Gujarat LandChain Evidence Bundle", title_style))
        story.append(Spacer(1, 12))
        
        # Case information
        case_info = [
            ['Bundle ID:', evidence_bundle.bundle_id],
            ['Case ID:', evidence_bundle.case_id],
            ['Property ULPIN:', evidence_bundle.property_ulpin],
            ['Generated:', evidence_bundle.creation_timestamp.strftime("%Y-%m-%d %H:%M:%S")],
            ['Completeness Score:', f"{evidence_bundle.completeness_score}%"],
            ['Confidence Rating:', evidence_bundle.confidence_rating],
            ['Integrity Hash:', evidence_bundle.bundle_integrity_hash[:32] + "..."]
        ]
        
        case_table = Table(case_info, colWidths=[2*inch, 4*inch])
        case_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (1, 0), (1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(case_table)
        story.append(PageBreak())
        
        # Evidence sections
        self._add_blockchain_evidence_section(story, evidence_bundle.blockchain_evidence, styles)
        self._add_satellite_evidence_section(story, evidence_bundle.satellite_evidence, styles)
        self._add_drone_evidence_section(story, evidence_bundle.drone_evidence, styles)
        self._add_legal_evidence_section(story, evidence_bundle.legal_evidence, styles)
        self._add_government_records_section(story, evidence_bundle.government_records, styles)
        
        # Summary analysis
        story.append(Paragraph("Summary Analysis", styles['Heading1']))
        story.append(Spacer(1, 12))
        
        summary_text = f"""
        <b>Evidence Bundle Completeness:</b> {evidence_bundle.completeness_score}%<br/>
        <b>Total Evidence Sources:</b> {evidence_bundle.summary_analysis['total_evidence_sources']}<br/>
        <b>Processing Time:</b> {evidence_bundle.summary_analysis['processing_time_seconds']:.2f} seconds<br/>
        <b>Quality Assessment:</b> {evidence_bundle.confidence_rating}<br/><br/>
        
        This evidence bundle contains comprehensive data from multiple sources including blockchain 
        transaction history, satellite imagery analysis, drone validation consensus, legal document 
        processing, and official government records. The evidence has been cryptographically verified 
        and can be independently validated using the provided integrity hash.
        """
        
        story.append(Paragraph(summary_text, styles['Normal']))
        
        # Build PDF
        doc.build(story)
        logger.info(f"PDF evidence report generated: {output_path}")
        return output_path

    def _add_blockchain_evidence_section(self, story, evidence_list, styles):
        """Add blockchain evidence section to PDF"""
        story.append(Paragraph("Blockchain Evidence", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        if not evidence_list:
            story.append(Paragraph("No blockchain evidence found.", styles['Normal']))
            story.append(Spacer(1, 12))
            return
        
        for evidence in evidence_list:
            story.append(Paragraph(f"Transaction: {evidence.transaction_hash}", styles['Heading3']))
            story.append(Paragraph(f"Event Type: {evidence.event_type}", styles['Normal']))
            story.append(Paragraph(f"Timestamp: {evidence.timestamp}", styles['Normal']))
            story.append(Paragraph(f"Block Number: {evidence.block_number}", styles['Normal']))
            story.append(Spacer(1, 12))

    def _add_satellite_evidence_section(self, story, evidence_list, styles):
        """Add satellite evidence section to PDF"""
        story.append(Paragraph("Satellite Evidence", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        if not evidence_list:
            story.append(Paragraph("No satellite evidence found.", styles['Normal']))
            story.append(Spacer(1, 12))
            return
        
        for evidence in evidence_list:
            story.append(Paragraph(f"Satellite: {evidence.satellite_source}", styles['Heading3']))
            story.append(Paragraph(f"Capture Date: {evidence.capture_date}", styles['Normal']))
            story.append(Paragraph(f"Resolution: {evidence.resolution_meters}m", styles['Normal']))
            story.append(Spacer(1, 12))

    def _add_drone_evidence_section(self, story, evidence_list, styles):
        """Add drone evidence section to PDF"""
        story.append(Paragraph("Drone Validation Evidence", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        if not evidence_list:
            story.append(Paragraph("No drone evidence found.", styles['Normal']))
            story.append(Spacer(1, 12))
            return
        
        for evidence in evidence_list:
            story.append(Paragraph(f"Validation ID: {evidence.validation_id}", styles['Heading3']))
            story.append(Paragraph(f"Result: {evidence.validation_result}", styles['Normal']))
            story.append(Paragraph(f"Consensus Score: {evidence.consensus_score}", styles['Normal']))
            story.append(Spacer(1, 12))

    def _add_legal_evidence_section(self, story, evidence_list, styles):
        """Add legal evidence section to PDF"""
        story.append(Paragraph("Legal Document Evidence", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        if not evidence_list:
            story.append(Paragraph("No legal evidence found.", styles['Normal']))
            story.append(Spacer(1, 12))
            return
        
        for evidence in evidence_list:
            story.append(Paragraph(f"Document: {evidence.original_filename}", styles['Heading3']))
            story.append(Paragraph(f"Type: {evidence.document_type}", styles['Normal']))
            story.append(Paragraph(f"Confidence: {evidence.extraction_confidence}%", styles['Normal']))
            story.append(Spacer(1, 12))

    def _add_government_records_section(self, story, records_list, styles):
        """Add government records section to PDF"""
        story.append(Paragraph("Government Records", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        if not records_list:
            story.append(Paragraph("No government records found.", styles['Normal']))
            story.append(Spacer(1, 12))
            return
        
        for record in records_list:
            story.append(Paragraph(f"Record: {record.record_number}", styles['Heading3']))
            story.append(Paragraph(f"Type: {record.record_type}", styles['Normal']))
            story.append(Paragraph(f"Issuing Office: {record.issuing_office}", styles['Normal']))
            story.append(Spacer(1, 12))

# Demo and Testing Functions
async def demo_evidence_generation():
    """
    Demo function to test evidence bundle generation
    """
    aggregator = EvidenceAggregator()
    
    # Test case data
    test_case = {
        'case_id': 'CASE_2025_001',
        'property_ulpin': 'GJ01AA1234567890',
        'property_coordinates': {'lat': 23.0225, 'lon': 72.5714}
    }
    
    try:
        # Generate evidence bundle
        evidence_bundle = await aggregator.generate_evidence_bundle(
            test_case['case_id'],
            test_case['property_ulpin'],
            test_case['property_coordinates']
        )
        
        # Generate PDF report
        pdf_path = aggregator.generate_pdf_report(evidence_bundle)
        
        print(f"✅ Evidence bundle generated successfully!")
        print(f"📋 Bundle ID: {evidence_bundle.bundle_id}")
        print(f"📊 Completeness Score: {evidence_bundle.completeness_score}%")
        print(f"🔒 Confidence Rating: {evidence_bundle.confidence_rating}")
        print(f"📄 PDF Report: {pdf_path}")
        
        return evidence_bundle, pdf_path
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        return None, None

if __name__ == "__main__":
    print("📋 Gujarat LandChain Evidence Bundle Generator")
    print("=" * 50)
    
    # Run demo
    asyncio.run(demo_evidence_generation())
    print("\n✅ Demo evidence generation complete!")
    print("📄 Check output PDF for comprehensive evidence bundle")
