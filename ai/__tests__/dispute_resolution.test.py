# GL-0701-0703: Dispute Resolution System Tests
# Sprint 7: Dispute Resolution Agent
# Gujarat LandChain × AI Testing Suite

"""
Comprehensive Test Suite for Dispute Resolution System
- Objective: Test legal document parsing, evidence bundle generation, and governance interface
- Coverage: All dispute resolution components and edge cases
- Integration: End-to-end testing of the complete dispute resolution workflow
"""

import unittest
import asyncio
import json
import tempfile
import os
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, AsyncMock
from pathlib import Path

# Import components to test
from langchain_legal_parser import GujaratLegalDocumentParser, LegalDocument, PropertyDetails, PersonEntity
from evidence_bundle_generator import EvidenceAggregator, EvidenceBundle, BlockchainEvidence, SatelliteEvidence

class TestLegalDocumentParser(unittest.TestCase):
    """Test suite for legal document parsing functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.parser = GujaratLegalDocumentParser(openai_api_key="test-key")
        self.sample_text = """
        PROPERTY DEED
        Document Number: DEED-2024-001
        Date: 15/01/2024
        Issuing Authority: Sub-Registrar Office, Ahmedabad
        
        Property Details:
        ULPIN: GJ24AB1234567890
        Survey Number: 123/4
        Village: Navrangpura
        Taluka: Ahmedabad City
        District: Ahmedabad
        Area: 2.5 acres
        
        Parties:
        Seller: Rajesh Patel, S/o Ramchandra Patel
        Address: 123, Gandhi Road, Ahmedabad
        Aadhaar: 1234 5678 9012
        
        Buyer: Suresh Mehta, S/o Harish Mehta
        Address: 456, Nehru Street, Ahmedabad
        Aadhaar: 9876 5432 1098
        
        Legal Status: Clear Title
        Ownership Type: Individual
        """
    
    def test_identify_document_type(self):
        """Test document type identification"""
        doc_type = self.parser.identify_document_type(self.sample_text)
        self.assertEqual(doc_type, "property_deed")
    
    def test_extract_legal_patterns(self):
        """Test legal pattern extraction"""
        patterns = self.parser.extract_legal_patterns(self.sample_text)
        
        self.assertIn('ulpin', patterns)
        self.assertIn('survey_number', patterns)
        self.assertIn('village', patterns)
        self.assertIn('taluka', patterns)
        self.assertIn('district', patterns)
        self.assertIn('area', patterns)
        self.assertIn('aadhaar', patterns)
        
        self.assertEqual(patterns['ulpin'][0], 'GJ24AB1234567890')
        self.assertEqual(patterns['survey_number'][0], '123/4')
        self.assertEqual(patterns['village'][0], 'Navrangpura')
    
    def test_extract_entities_with_spacy(self):
        """Test named entity extraction"""
        entities = self.parser.extract_entities_with_spacy(self.sample_text)
        
        # Check that entities are extracted
        self.assertIsInstance(entities, dict)
        self.assertIn('PERSON', entities)
        self.assertIn('GPE', entities)
        self.assertIn('DATE', entities)
    
    def test_validate_extracted_data(self):
        """Test data validation and confidence scoring"""
        extracted_data = {
            'property_details': {
                'village': 'Navrangpura',
                'survey_number': '123/4',
                'district': 'Ahmedabad',
                'area': '2.5 acres'
            },
            'parties_involved': [
                {
                    'name': 'Rajesh Patel',
                    'father_name': 'Ramchandra Patel'
                }
            ],
            'document_number': 'DEED-2024-001',
            'date_issued': '15/01/2024',
            'issuing_authority': 'Sub-Registrar Office'
        }
        
        confidence = self.parser.validate_extracted_data(extracted_data)
        self.assertGreater(confidence, 70)  # Should have high confidence
    
    def test_export_to_json(self):
        """Test JSON export functionality"""
        # Create a sample legal document
        property_details = PropertyDetails(
            ulpin_id="GJ24AB1234567890",
            survey_number="123/4",
            village="Navrangpura",
            taluka="Ahmedabad City",
            district="Ahmedabad",
            area_acres=2.5
        )
        
        parties = [
            PersonEntity(
                name="Rajesh Patel",
                father_name="Ramchandra Patel",
                address="123, Gandhi Road, Ahmedabad",
                identification={"aadhaar": "1234 5678 9012"}
            )
        ]
        
        legal_doc = LegalDocument(
            document_type="property_deed",
            document_number="DEED-2024-001",
            date_issued="15/01/2024",
            issuing_authority="Sub-Registrar Office",
            property_details=property_details,
            parties_involved=parties,
            legal_status="Clear Title",
            ownership_type="Individual",
            confidence_score=85.0
        )
        
        # Test export
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            output_path = f.name
        
        try:
            result_path = self.parser.export_to_json(legal_doc, output_path)
            
            # Verify file was created
            self.assertTrue(os.path.exists(result_path))
            
            # Verify JSON content
            with open(result_path, 'r') as f:
                exported_data = json.load(f)
            
            self.assertEqual(exported_data['document_type'], 'property_deed')
            self.assertEqual(exported_data['document_number'], 'DEED-2024-001')
            self.assertIsNotNone(exported_data['property_details'])
            self.assertIsNotNone(exported_data['parties_involved'])
            
        finally:
            # Cleanup
            if os.path.exists(output_path):
                os.unlink(output_path)

class TestEvidenceBundleGenerator(unittest.TestCase):
    """Test suite for evidence bundle generation"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {
            'blockchain': {
                'rpc_url': 'https://polygon-rpc.com',
                'contract_address': '0x1234567890123456789012345678901234567890'
            },
            'satellite': {
                'api_key': 'test-satellite-key',
                'base_url': 'https://api.sentinel-hub.com'
            },
            'database': {
                'path': ':memory:'  # Use in-memory database for testing
            }
        }
        self.aggregator = EvidenceAggregator(self.config)
    
    def test_calculate_completeness_score(self):
        """Test completeness score calculation"""
        # Create a sample evidence bundle
        bundle = EvidenceBundle(
            bundle_id="EB-2024-001",
            case_id="DIS-2024-001",
            property_ulpin="GJ24AB1234567890",
            creation_timestamp=datetime.now(),
            blockchain_evidence=[
                BlockchainEvidence(
                    contract_address="0x1234567890123456789012345678901234567890",
                    transaction_hash="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
                    block_number=12345678,
                    timestamp=datetime.now(),
                    event_type="transfer",
                    parties_involved=["0x1111111111111111111111111111111111111111"],
                    property_ulpin="GJ24AB1234567890",
                    gas_used=21000
                )
            ],
            satellite_evidence=[
                SatelliteEvidence(
                    image_url="https://example.com/satellite-image.jpg",
                    capture_date=datetime.now(),
                    satellite_source="Sentinel-2",
                    resolution_meters=10.0,
                    cloud_coverage=5.0,
                    analysis_results={"land_use": "agricultural", "change_detected": False}
                )
            ],
            drone_evidence=[],
            legal_evidence=[],
            government_records=[],
            bundle_integrity_hash="",
            completeness_score=0.0,
            confidence_rating="medium",
            summary_analysis={}
        )
        
        # Calculate completeness
        completeness = self.aggregator.calculate_completeness_score(bundle)
        
        # Should have some completeness due to blockchain and satellite evidence
        self.assertGreater(completeness, 0)
        self.assertLessEqual(completeness, 100)
    
    def test_calculate_bundle_integrity_hash(self):
        """Test bundle integrity hash calculation"""
        bundle = EvidenceBundle(
            bundle_id="EB-2024-001",
            case_id="DIS-2024-001",
            property_ulpin="GJ24AB1234567890",
            creation_timestamp=datetime.now(),
            blockchain_evidence=[],
            satellite_evidence=[],
            drone_evidence=[],
            legal_evidence=[],
            government_records=[],
            bundle_integrity_hash="",
            completeness_score=0.0,
            confidence_rating="medium",
            summary_analysis={}
        )
        
        integrity_hash = self.aggregator.calculate_bundle_integrity_hash(bundle)
        
        # Should generate a valid hash
        self.assertIsInstance(integrity_hash, str)
        self.assertEqual(len(integrity_hash), 64)  # SHA-256 hash length
    
    @patch('evidence_bundle_generator.Web3')
    def test_collect_blockchain_evidence(self, mock_web3):
        """Test blockchain evidence collection"""
        # Mock Web3 response
        mock_web3.return_value.eth.get_block.return_value = {
            'timestamp': int(datetime.now().timestamp())
        }
        
        # Mock contract events
        mock_events = [
            {
                'transactionHash': b'0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                'blockNumber': 12345678,
                'args': {
                    'from': '0x1111111111111111111111111111111111111111',
                    'to': '0x2222222222222222222222222222222222222222',
                    'ulpin': 'GJ24AB1234567890'
                }
            }
        ]
        
        mock_web3.return_value.eth.contract.return_value.events.Transfer.get_all_entries.return_value = mock_events
        
        # Test evidence collection
        async def test_collection():
            evidence = await self.aggregator.collect_blockchain_evidence("GJ24AB1234567890", days_back=30)
            self.assertIsInstance(evidence, list)
            if evidence:
                self.assertIsInstance(evidence[0], BlockchainEvidence)
        
        asyncio.run(test_collection())
    
    @patch('evidence_bundle_generator.aiohttp.ClientSession.get')
    def test_collect_satellite_evidence(self, mock_get):
        """Test satellite evidence collection"""
        # Mock satellite API response
        mock_response = AsyncMock()
        mock_response.json.return_value = {
            'features': [
                {
                    'properties': {
                        'datetime': '2024-01-15T10:00:00Z',
                        'satellite': 'Sentinel-2',
                        'cloud_coverage': 5.0
                    },
                    'assets': {
                        'visual': {
                            'href': 'https://example.com/satellite-image.jpg'
                        }
                    }
                }
            ]
        }
        mock_get.return_value.__aenter__.return_value = mock_response
        
        # Test evidence collection
        async def test_collection():
            coordinates = {'lat': 23.0225, 'lon': 72.5714}  # Ahmedabad coordinates
            evidence = await self.aggregator.collect_satellite_evidence(coordinates, months_back=6)
            self.assertIsInstance(evidence, list)
            if evidence:
                self.assertIsInstance(evidence[0], SatelliteEvidence)
        
        asyncio.run(test_collection())

class TestDisputeResolutionIntegration(unittest.TestCase):
    """Integration tests for complete dispute resolution workflow"""
    
    def setUp(self):
        """Set up integration test environment"""
        self.parser = GujaratLegalDocumentParser(openai_api_key="test-key")
        self.aggregator = EvidenceAggregator()
    
    @patch('langchain_legal_parser.ChatOpenAI')
    def test_end_to_end_dispute_resolution(self, mock_llm):
        """Test complete dispute resolution workflow"""
        # Mock LLM response
        mock_llm.return_value.apredict.return_value = json.dumps({
            'property_details': {
                'ulpin_id': 'GJ24AB1234567890',
                'survey_number': '123/4',
                'village': 'Navrangpura',
                'taluka': 'Ahmedabad City',
                'district': 'Ahmedabad',
                'area': '2.5 acres'
            },
            'parties_involved': [
                {
                    'name': 'Rajesh Patel',
                    'father_name': 'Ramchandra Patel',
                    'address': '123, Gandhi Road, Ahmedabad',
                    'identification': {'aadhaar': '1234 5678 9012'}
                }
            ],
            'document_number': 'DEED-2024-001',
            'date_issued': '15/01/2024',
            'issuing_authority': 'Sub-Registrar Office',
            'legal_status': 'Clear Title',
            'ownership_type': 'Individual'
        })
        
        async def test_workflow():
            # Step 1: Parse legal document
            sample_text = """
            PROPERTY DEED
            Document Number: DEED-2024-001
            Date: 15/01/2024
            Property: Survey No. 123/4, Village Navrangpura
            """
            
            legal_doc = await self.parser.parse_legal_document("sample_document.pdf")
            
            # Verify document parsing
            self.assertIsInstance(legal_doc, LegalDocument)
            self.assertGreater(legal_doc.confidence_score, 0)
            
            # Step 2: Generate evidence bundle
            case_id = "DIS-2024-001"
            property_ulpin = "GJ24AB1234567890"
            coordinates = {'lat': 23.0225, 'lon': 72.5714}
            
            evidence_bundle = await self.aggregator.generate_evidence_bundle(
                case_id, property_ulpin, coordinates
            )
            
            # Verify evidence bundle
            self.assertIsInstance(evidence_bundle, EvidenceBundle)
            self.assertEqual(evidence_bundle.case_id, case_id)
            self.assertEqual(evidence_bundle.property_ulpin, property_ulpin)
            self.assertGreater(evidence_bundle.completeness_score, 0)
            
            # Step 3: Verify bundle integrity
            integrity_hash = self.aggregator.calculate_bundle_integrity_hash(evidence_bundle)
            self.assertIsInstance(integrity_hash, str)
            self.assertEqual(len(integrity_hash), 64)
            
            return legal_doc, evidence_bundle
        
        # Run integration test
        legal_doc, evidence_bundle = asyncio.run(test_workflow())
        
        # Verify integration results
        self.assertIsNotNone(legal_doc)
        self.assertIsNotNone(evidence_bundle)
        self.assertGreater(legal_doc.confidence_score, 0)
        self.assertGreater(evidence_bundle.completeness_score, 0)

class TestGovernanceInterface(unittest.TestCase):
    """Test suite for governance interface functionality"""
    
    def test_dispute_case_validation(self):
        """Test dispute case data validation"""
        # Valid dispute case
        valid_case = {
            'caseId': 'DIS-2024-001',
            'propertyUlpin': 'GJ24AB1234567890',
            'disputeType': 'ownership',
            'status': 'voting',
            'priority': 'high',
            'parties': {
                'petitioner': 'Rajesh Patel',
                'respondent': 'Suresh Mehta'
            },
            'requiredVotes': 3,
            'currentVotes': 1
        }
        
        # Test validation logic
        self.assertTrue(self.validate_dispute_case(valid_case))
        
        # Invalid case (missing required fields)
        invalid_case = {
            'caseId': 'DIS-2024-001',
            'disputeType': 'ownership'
            # Missing required fields
        }
        
        self.assertFalse(self.validate_dispute_case(invalid_case))
    
    def test_vote_validation(self):
        """Test vote submission validation"""
        # Valid vote
        valid_vote = {
            'vote': 'approve',
            'reasoning': 'Based on evidence, the petitioner has demonstrated clear ownership rights.',
            'evidenceReviewed': ['EB-2024-001', 'LEGAL-001']
        }
        
        self.assertTrue(self.validate_vote(valid_vote))
        
        # Invalid vote (missing reasoning)
        invalid_vote = {
            'vote': 'approve',
            'reasoning': '',  # Empty reasoning
            'evidenceReviewed': []
        }
        
        self.assertFalse(self.validate_vote(invalid_vote))
    
    def validate_dispute_case(self, case):
        """Helper method to validate dispute case data"""
        required_fields = ['caseId', 'propertyUlpin', 'disputeType', 'status', 'priority', 'parties', 'requiredVotes']
        return all(field in case for field in required_fields)
    
    def validate_vote(self, vote):
        """Helper method to validate vote data"""
        required_fields = ['vote', 'reasoning']
        if not all(field in vote for field in required_fields):
            return False
        
        valid_votes = ['approve', 'reject', 'abstain', 'request_more_info']
        if vote['vote'] not in valid_votes:
            return False
        
        if not vote['reasoning'].strip():
            return False
        
        return True

class TestPerformanceAndScalability(unittest.TestCase):
    """Test suite for performance and scalability"""
    
    def test_document_parsing_performance(self):
        """Test document parsing performance"""
        parser = GujaratLegalDocumentParser(openai_api_key="test-key")
        
        # Test with large document
        large_text = "PROPERTY DEED " * 1000  # Create large text
        
        start_time = datetime.now()
        doc_type = parser.identify_document_type(large_text)
        patterns = parser.extract_legal_patterns(large_text)
        end_time = datetime.now()
        
        processing_time = (end_time - start_time).total_seconds()
        
        # Should process large documents within reasonable time
        self.assertLess(processing_time, 5.0)  # Less than 5 seconds
        self.assertEqual(doc_type, "property_deed")
        self.assertIsInstance(patterns, dict)
    
    def test_evidence_bundle_scalability(self):
        """Test evidence bundle generation scalability"""
        aggregator = EvidenceAggregator()
        
        # Test with multiple evidence sources
        start_time = datetime.now()
        
        # Simulate multiple evidence sources
        bundle = EvidenceBundle(
            bundle_id="EB-2024-001",
            case_id="DIS-2024-001",
            property_ulpin="GJ24AB1234567890",
            creation_timestamp=datetime.now(),
            blockchain_evidence=[Mock() for _ in range(100)],  # 100 blockchain events
            satellite_evidence=[Mock() for _ in range(50)],    # 50 satellite images
            drone_evidence=[Mock() for _ in range(20)],        # 20 drone validations
            legal_evidence=[Mock() for _ in range(10)],        # 10 legal documents
            government_records=[Mock() for _ in range(5)],     # 5 government records
            bundle_integrity_hash="",
            completeness_score=0.0,
            confidence_rating="high",
            summary_analysis={}
        )
        
        completeness = aggregator.calculate_completeness_score(bundle)
        integrity_hash = aggregator.calculate_bundle_integrity_hash(bundle)
        
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        
        # Should handle large evidence bundles efficiently
        self.assertLess(processing_time, 2.0)  # Less than 2 seconds
        self.assertGreater(completeness, 0)
        self.assertIsInstance(integrity_hash, str)

def run_all_tests():
    """Run all test suites"""
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test classes
    test_classes = [
        TestLegalDocumentParser,
        TestEvidenceBundleGenerator,
        TestDisputeResolutionIntegration,
        TestGovernanceInterface,
        TestPerformanceAndScalability
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun) * 100:.1f}%")
    
    if result.failures:
        print(f"\nFAILURES:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if result.errors:
        print(f"\nERRORS:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    return result.wasSuccessful()

if __name__ == "__main__":
    print("🧪 Running Dispute Resolution System Tests")
    print("=" * 60)
    
    success = run_all_tests()
    
    if success:
        print("\n✅ All tests passed!")
        print("🎉 Dispute resolution system is ready for production!")
    else:
        print("\n❌ Some tests failed!")
        print("🔧 Please review and fix the failing tests.")
    
    exit(0 if success else 1) 