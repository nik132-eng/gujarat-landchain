#!/usr/bin/env python3
"""
AnyROR Data Migration Script
Gujarat LandChain - Sprint 11

This script imports AnyROR (Any Record of Rights) CSV data into the PostgreSQL database
for the Gujarat LandChain pilot program.

Usage:
    python anyror-import.py --input data/anyror-sample.csv --batch-size 100
"""

import argparse
import csv
import hashlib
import logging
import sys
import time
from datetime import datetime
from typing import Dict, List, Optional, Tuple

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('anyror-import.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class AnyRORImporter:
    """Handles the import of AnyROR data into PostgreSQL database."""
    
    def __init__(self, db_config: Dict[str, str], batch_size: int = 100):
        self.db_config = db_config
        self.batch_size = batch_size
        self.connection_pool = None
        self.stats = {
            'total_records': 0,
            'imported_records': 0,
            'failed_records': 0,
            'start_time': None,
            'end_time': None
        }
        
    def connect(self) -> None:
        """Establish database connection pool."""
        try:
            self.connection_pool = SimpleConnectionPool(
                minconn=1,
                maxconn=10,
                **self.db_config
            )
            logger.info("Database connection pool established")
        except Exception as e:
            logger.error(f"Failed to establish database connection: {e}")
            raise
    
    def disconnect(self) -> None:
        """Close database connection pool."""
        if self.connection_pool:
            self.connection_pool.closeall()
            logger.info("Database connection pool closed")
    
    def create_tables(self) -> None:
        """Create necessary database tables if they don't exist."""
        create_tables_sql = """
        -- Land Parcels table
        CREATE TABLE IF NOT EXISTS land_parcels (
            id SERIAL PRIMARY KEY,
            ulpin_id VARCHAR(64) UNIQUE NOT NULL,
            village_name VARCHAR(255) NOT NULL,
            survey_number VARCHAR(50) NOT NULL,
            land_area DECIMAL(10,2) NOT NULL,
            land_type VARCHAR(100) NOT NULL,
            owner_name VARCHAR(255) NOT NULL,
            owner_aadhaar VARCHAR(12),
            ownership_type VARCHAR(50) NOT NULL,
            mutation_date DATE,
            registration_number VARCHAR(100),
            document_type VARCHAR(100),
            encumbrance_status VARCHAR(50) DEFAULT 'CLEAR',
            verification_status VARCHAR(50) DEFAULT 'PENDING',
            nft_mint_address VARCHAR(44),
            freeze_status VARCHAR(50) DEFAULT 'UNFROZEN',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Import Log table
        CREATE TABLE IF NOT EXISTS import_logs (
            id SERIAL PRIMARY KEY,
            batch_id VARCHAR(64) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            total_records INTEGER NOT NULL,
            imported_records INTEGER NOT NULL,
            failed_records INTEGER NOT NULL,
            checksum VARCHAR(64) NOT NULL,
            import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'COMPLETED'
        );
        
        -- Create indexes for performance
        CREATE INDEX IF NOT EXISTS idx_land_parcels_ulpin ON land_parcels(ulpin_id);
        CREATE INDEX IF NOT EXISTS idx_land_parcels_village ON land_parcels(village_name);
        CREATE INDEX IF NOT EXISTS idx_land_parcels_owner ON land_parcels(owner_name);
        CREATE INDEX IF NOT EXISTS idx_import_logs_batch ON import_logs(batch_id);
        """
        
        conn = self.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute(create_tables_sql)
                conn.commit()
                logger.info("Database tables created/verified successfully")
        except Exception as e:
            logger.error(f"Failed to create tables: {e}")
            conn.rollback()
            raise
        finally:
            self.connection_pool.putconn(conn)
    
    def validate_record(self, record: Dict[str, str]) -> Tuple[bool, List[str]]:
        """Validate a single AnyROR record."""
        errors = []
        
        # Required fields validation
        required_fields = ['ulpin_id', 'village_name', 'survey_number', 'land_area', 'owner_name']
        for field in required_fields:
            if not record.get(field) or record[field].strip() == '':
                errors.append(f"Missing required field: {field}")
        
        # ULPIN ID format validation (64 characters)
        ulpin_id = record.get('ulpin_id', '')
        if len(ulpin_id) != 64:
            errors.append(f"Invalid ULPIN ID length: {len(ulpin_id)} (expected 64)")
        
        # Land area validation
        try:
            land_area = float(record.get('land_area', 0))
            if land_area <= 0:
                errors.append("Land area must be greater than 0")
        except ValueError:
            errors.append("Invalid land area format")
        
        # Aadhaar validation (if provided)
        aadhaar = record.get('owner_aadhaar', '')
        if aadhaar and (len(aadhaar) != 12 or not aadhaar.isdigit()):
            errors.append("Invalid Aadhaar number format")
        
        return len(errors) == 0, errors
    
    def generate_ulpin_id(self, village: str, survey: str, owner: str) -> str:
        """Generate a deterministic ULPIN ID if not provided."""
        combined = f"{village}_{survey}_{owner}".encode('utf-8')
        return hashlib.sha256(combined).hexdigest()
    
    def insert_batch(self, records: List[Dict[str, str]], batch_id: str) -> Tuple[int, int]:
        """Insert a batch of records into the database."""
        if not records:
            return 0, 0
        
        insert_sql = """
        INSERT INTO land_parcels (
            ulpin_id, village_name, survey_number, land_area, land_type,
            owner_name, owner_aadhaar, ownership_type, mutation_date,
            registration_number, document_type, encumbrance_status,
            verification_status, nft_mint_address, freeze_status
        ) VALUES (
            %(ulpin_id)s, %(village_name)s, %(survey_number)s, %(land_area)s, %(land_type)s,
            %(owner_name)s, %(owner_aadhaar)s, %(ownership_type)s, %(mutation_date)s,
            %(registration_number)s, %(document_type)s, %(encumbrance_status)s,
            %(verification_status)s, %(nft_mint_address)s, %(freeze_status)s
        ) ON CONFLICT (ulpin_id) DO UPDATE SET
            village_name = EXCLUDED.village_name,
            survey_number = EXCLUDED.survey_number,
            land_area = EXCLUDED.land_area,
            land_type = EXCLUDED.land_type,
            owner_name = EXCLUDED.owner_name,
            owner_aadhaar = EXCLUDED.owner_aadhaar,
            ownership_type = EXCLUDED.ownership_type,
            mutation_date = EXCLUDED.mutation_date,
            registration_number = EXCLUDED.registration_number,
            document_type = EXCLUDED.document_type,
            encumbrance_status = EXCLUDED.encumbrance_status,
            updated_at = CURRENT_TIMESTAMP
        """
        
        conn = self.connection_pool.getconn()
        imported = 0
        failed = 0
        
        try:
            with conn.cursor() as cursor:
                for record in records:
                    try:
                        # Validate record
                        is_valid, errors = self.validate_record(record)
                        if not is_valid:
                            logger.warning(f"Record validation failed: {errors}")
                            failed += 1
                            continue
                        
                        # Generate ULPIN ID if not provided
                        if not record.get('ulpin_id'):
                            record['ulpin_id'] = self.generate_ulpin_id(
                                record['village_name'],
                                record['survey_number'],
                                record['owner_name']
                            )
                        
                        # Set default values
                        record.setdefault('land_type', 'Agricultural')
                        record.setdefault('ownership_type', 'Individual')
                        record.setdefault('encumbrance_status', 'CLEAR')
                        record.setdefault('verification_status', 'PENDING')
                        record.setdefault('freeze_status', 'UNFROZEN')
                        
                        # Convert land_area to float
                        record['land_area'] = float(record['land_area'])
                        
                        # Handle date conversion
                        if record.get('mutation_date'):
                            try:
                                record['mutation_date'] = datetime.strptime(
                                    record['mutation_date'], '%Y-%m-%d'
                                ).date()
                            except ValueError:
                                record['mutation_date'] = None
                        
                        cursor.execute(insert_sql, record)
                        imported += 1
                        
                    except Exception as e:
                        logger.error(f"Failed to insert record: {e}")
                        failed += 1
                
                conn.commit()
                logger.info(f"Batch {batch_id}: {imported} imported, {failed} failed")
                
        except Exception as e:
            logger.error(f"Batch insert failed: {e}")
            conn.rollback()
            failed += len(records)
        finally:
            self.connection_pool.putconn(conn)
        
        return imported, failed
    
    def log_import(self, batch_id: str, file_name: str, checksum: str) -> None:
        """Log import statistics to the database."""
        log_sql = """
        INSERT INTO import_logs (
            batch_id, file_name, total_records, imported_records, 
            failed_records, checksum, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        conn = self.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute(log_sql, (
                    batch_id, file_name, self.stats['total_records'],
                    self.stats['imported_records'], self.stats['failed_records'],
                    checksum, 'COMPLETED'
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to log import: {e}")
            conn.rollback()
        finally:
            self.connection_pool.putconn(conn)
    
    def calculate_checksum(self, file_path: str) -> str:
        """Calculate SHA256 checksum of the input file."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256_hash.update(chunk)
        return sha256_hash.hexdigest()
    
    def import_file(self, file_path: str) -> None:
        """Import data from CSV file."""
        self.stats['start_time'] = time.time()
        batch_id = f"batch_{int(time.time())}"
        
        logger.info(f"Starting import of {file_path}")
        logger.info(f"Batch ID: {batch_id}")
        
        # Calculate file checksum
        checksum = self.calculate_checksum(file_path)
        logger.info(f"File checksum: {checksum}")
        
        # Read and process CSV file
        current_batch = []
        
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row_num, row in enumerate(reader, start=2):  # Start from 2 to account for header
                self.stats['total_records'] += 1
                current_batch.append(row)
                
                # Process batch when it reaches the batch size
                if len(current_batch) >= self.batch_size:
                    imported, failed = self.insert_batch(current_batch, batch_id)
                    self.stats['imported_records'] += imported
                    self.stats['failed_records'] += failed
                    current_batch = []
                    
                    # Progress update
                    if self.stats['total_records'] % 100 == 0:
                        logger.info(f"Processed {self.stats['total_records']} records...")
            
            # Process remaining records
            if current_batch:
                imported, failed = self.insert_batch(current_batch, batch_id)
                self.stats['imported_records'] += imported
                self.stats['failed_records'] += failed
        
        # Log import statistics
        self.stats['end_time'] = time.time()
        duration = self.stats['end_time'] - self.stats['start_time']
        
        logger.info("Import completed!")
        logger.info(f"Total records: {self.stats['total_records']}")
        logger.info(f"Imported: {self.stats['imported_records']}")
        logger.info(f"Failed: {self.stats['failed_records']}")
        logger.info(f"Duration: {duration:.2f} seconds")
        logger.info(f"Rate: {self.stats['total_records']/duration:.2f} records/second")
        
        # Log to database
        self.log_import(batch_id, file_path, checksum)

def main():
    """Main function to run the AnyROR import process."""
    parser = argparse.ArgumentParser(description='Import AnyROR data into PostgreSQL')
    parser.add_argument('--input', required=True, help='Input CSV file path')
    parser.add_argument('--batch-size', type=int, default=100, help='Batch size for processing')
    parser.add_argument('--host', default='localhost', help='Database host')
    parser.add_argument('--port', type=int, default=5432, help='Database port')
    parser.add_argument('--database', default='gujarat_landchain', help='Database name')
    parser.add_argument('--username', default='postgres', help='Database username')
    parser.add_argument('--password', default='', help='Database password')
    
    args = parser.parse_args()
    
    # Database configuration
    db_config = {
        'host': args.host,
        'port': args.port,
        'database': args.database,
        'user': args.username,
        'password': args.password
    }
    
    # Initialize importer
    importer = AnyRORImporter(db_config, args.batch_size)
    
    try:
        # Connect to database
        importer.connect()
        
        # Create tables
        importer.create_tables()
        
        # Import data
        importer.import_file(args.input)
        
        logger.info("AnyROR import completed successfully!")
        
    except Exception as e:
        logger.error(f"Import failed: {e}")
        sys.exit(1)
    finally:
        importer.disconnect()

if __name__ == "__main__":
    main() 