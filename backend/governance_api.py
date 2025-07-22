# GL-0703: Governance API Backend
# Sprint 7: Dispute Resolution Agent
# Gujarat LandChain × Governance Backend

"""
Backend API for Governance Voting System
- Objective: Handle governance votes, case management, role verification
- Features: Multi-signature voting, audit trails, evidence linking
- Security: Role-based access, vote immutability, fraud detection
"""

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from functools import wraps
import sqlite3
import json
import hashlib
import secrets
from datetime import datetime, timedelta
from web3 import Web3
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Database configuration
DATABASE = 'governance.db'
SECRET_KEY = secrets.token_hex(32)  # In production, use environment variable

# Gujarat LandChain governance configuration
GOVERNANCE_CONFIG = {
    'roles': {
        'DISTRICT_COLLECTOR': {
            'level': 5,
            'voting_weight': 3,
            'permissions': ['final_approval', 'case_assignment', 'policy_override']
        },
        'TEHSILDAR': {
            'level': 4,
            'voting_weight': 2,
            'permissions': ['regional_approval', 'case_review', 'evidence_validation']
        },
        'PATWARI': {
            'level': 3,
            'voting_weight': 1,
            'permissions': ['local_verification', 'field_inspection', 'data_entry']
        },
        'LEGAL_ADVISOR': {
            'level': 3,
            'voting_weight': 2,
            'permissions': ['legal_review', 'document_validation', 'compliance_check']
        },
        'TECHNICAL_EXPERT': {
            'level': 2,
            'voting_weight': 1,
            'permissions': ['satellite_analysis', 'drone_validation', 'technical_review']
        }
    },
    'vote_thresholds': {
        'HIGH_PRIORITY': 80,  # Weighted percentage required
        'MEDIUM_PRIORITY': 70,
        'LOW_PRIORITY': 60
    },
    'case_escalation': {
        'timeout_hours': 72,
        'escalation_chain': ['PATWARI', 'TEHSILDAR', 'DISTRICT_COLLECTOR']
    }
}

# Database helper functions
def get_db():
    """Get database connection."""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_db(exception):
    """Close database connection."""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """Initialize database with governance tables."""
    with app.app_context():
        db = get_db()
        
        # Cases table
        db.execute('''
            CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                property_ulpin TEXT NOT NULL,
                status TEXT NOT NULL,
                priority TEXT NOT NULL,
                created_date TEXT NOT NULL,
                assigned_officials TEXT NOT NULL,
                evidence_bundle_id TEXT,
                evidence_completeness INTEGER DEFAULT 0,
                estimated_resolution TEXT,
                created_by TEXT NOT NULL,
                metadata TEXT
            )
        ''')
        
        # Votes table
        db.execute('''
            CREATE TABLE IF NOT EXISTS votes (
                id TEXT PRIMARY KEY,
                case_id TEXT NOT NULL,
                voter_role TEXT NOT NULL,
                voter_address TEXT NOT NULL,
                vote_type TEXT NOT NULL,
                reasoning TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                evidence_bundle_hash TEXT,
                tx_hash TEXT,
                weight INTEGER DEFAULT 1,
                FOREIGN KEY (case_id) REFERENCES cases (id)
            )
        ''')
        
        # Officials table (role verification)
        db.execute('''
            CREATE TABLE IF NOT EXISTS officials (
                wallet_address TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                district TEXT,
                verified BOOLEAN DEFAULT FALSE,
                verification_date TEXT,
                permissions TEXT,
                status TEXT DEFAULT 'ACTIVE'
            )
        ''')
        
        # Audit trail table
        db.execute('''
            CREATE TABLE IF NOT EXISTS audit_trail (
                id TEXT PRIMARY KEY,
                case_id TEXT NOT NULL,
                action TEXT NOT NULL,
                actor_address TEXT NOT NULL,
                actor_role TEXT,
                timestamp TEXT NOT NULL,
                details TEXT,
                ip_address TEXT
            )
        ''')
        
        # Evidence bundles linking table
        db.execute('''
            CREATE TABLE IF NOT EXISTS evidence_links (
                id TEXT PRIMARY KEY,
                case_id TEXT NOT NULL,
                bundle_id TEXT NOT NULL,
                bundle_hash TEXT NOT NULL,
                completeness_score INTEGER,
                confidence_rating TEXT,
                generated_timestamp TEXT NOT NULL,
                FOREIGN KEY (case_id) REFERENCES cases (id)
            )
        ''')
        
        db.commit()

# Authentication and authorization decorators
def require_auth(f):
    """Require wallet authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401
        
        wallet_address = auth_header.split(' ')[1]
        
        # Verify wallet address format (simplified)
        if not wallet_address or len(wallet_address) < 26:
            return jsonify({'error': 'Invalid wallet address'}), 401
        
        # Get user role from database
        db = get_db()
        official = db.execute(
            'SELECT * FROM officials WHERE wallet_address = ? AND status = "ACTIVE"',
            (wallet_address,)
        ).fetchone()
        
        if not official:
            return jsonify({'error': 'Unauthorized wallet address'}), 403
        
        g.current_user = {
            'wallet_address': wallet_address,
            'name': official['name'],
            'role': official['role'],
            'district': official['district'],
            'verified': bool(official['verified'])
        }
        
        return f(*args, **kwargs)
    return decorated_function

def require_role(required_permissions):
    """Require specific role permissions."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'current_user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            user_role = g.current_user['role']
            user_permissions = GOVERNANCE_CONFIG['roles'].get(user_role, {}).get('permissions', [])
            
            if not any(perm in user_permissions for perm in required_permissions):
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def log_action(case_id, action, details=None):
    """Log action to audit trail."""
    if not hasattr(g, 'current_user'):
        return
    
    db = get_db()
    audit_id = f"audit_{secrets.token_hex(8)}"
    
    db.execute('''
        INSERT INTO audit_trail 
        (id, case_id, action, actor_address, actor_role, timestamp, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        audit_id,
        case_id,
        action,
        g.current_user['wallet_address'],
        g.current_user['role'],
        datetime.utcnow().isoformat(),
        json.dumps(details) if details else None,
        request.remote_addr
    ))
    db.commit()

# API Endpoints

@app.route('/api/governance/cases', methods=['GET'])
@require_auth
def get_cases():
    """Get active cases for current user role."""
    try:
        db = get_db()
        user_role = g.current_user['role']
        
        # Get cases where user role is assigned
        cases = db.execute('''
            SELECT * FROM cases 
            WHERE assigned_officials LIKE ? 
            ORDER BY 
                CASE priority 
                    WHEN 'HIGH' THEN 1 
                    WHEN 'MEDIUM' THEN 2 
                    WHEN 'LOW' THEN 3 
                END,
                created_date DESC
        ''', (f'%{user_role}%',)).fetchall()
        
        result = []
        for case in cases:
            # Get vote count for this case
            vote_count = db.execute(
                'SELECT COUNT(*) as count FROM votes WHERE case_id = ?',
                (case['id'],)
            ).fetchone()['count']
            
            # Calculate required votes based on assigned officials
            assigned_officials = json.loads(case['assigned_officials'])
            total_required_votes = len(assigned_officials)
            
            case_data = {
                'id': case['id'],
                'title': case['title'],
                'property_ulpin': case['property_ulpin'],
                'status': case['status'],
                'priority': case['priority'],
                'created_date': case['created_date'],
                'assigned_officials': assigned_officials,
                'evidence_completeness': case['evidence_completeness'],
                'votes_cast': vote_count,
                'total_required_votes': total_required_votes,
                'estimated_resolution': case['estimated_resolution']
            }
            result.append(case_data)
        
        return jsonify({'cases': result})
        
    except Exception as e:
        logger.error(f"Error fetching cases: {str(e)}")
        return jsonify({'error': 'Failed to fetch cases'}), 500

@app.route('/api/governance/cases/<case_id>/evidence', methods=['GET'])
@require_auth
def get_case_evidence(case_id):
    """Get evidence bundle for a specific case."""
    try:
        db = get_db()
        
        # Verify user has access to this case
        case = db.execute(
            'SELECT * FROM cases WHERE id = ?',
            (case_id,)
        ).fetchone()
        
        if not case:
            return jsonify({'error': 'Case not found'}), 404
        
        assigned_officials = json.loads(case['assigned_officials'])
        if g.current_user['role'] not in assigned_officials:
            return jsonify({'error': 'Access denied to this case'}), 403
        
        # Get evidence bundle information
        evidence = db.execute(
            'SELECT * FROM evidence_links WHERE case_id = ?',
            (case_id,)
        ).fetchone()
        
        if not evidence:
            return jsonify({'error': 'Evidence bundle not found'}), 404
        
        # Mock evidence bundle data (in real implementation, fetch from evidence system)
        evidence_bundle = {
            'bundle_id': evidence['bundle_id'],
            'case_id': case_id,
            'completeness_score': evidence['completeness_score'],
            'confidence_rating': evidence['confidence_rating'],
            'evidence_sources': {
                'blockchain': 3,
                'satellite': 2,
                'drone': 1,
                'legal': 2,
                'government': 1
            },
            'summary': {
                'total_transactions': 5,
                'ownership_history': 'Clear title transfer documented',
                'satellite_analysis': 'No unauthorized construction detected',
                'legal_status': 'Valid property deed on record'
            },
            'timeline': [
                {'date': '2024-01-15', 'event': 'Property purchased by current owner'},
                {'date': '2024-06-20', 'event': 'Boundary dispute filed by neighbor'},
                {'date': '2025-07-25', 'event': 'Case opened for resolution'}
            ]
        }
        
        log_action(case_id, 'EVIDENCE_VIEWED')
        
        return jsonify({'evidence_bundle': evidence_bundle})
        
    except Exception as e:
        logger.error(f"Error fetching evidence: {str(e)}")
        return jsonify({'error': 'Failed to fetch evidence'}), 500

@app.route('/api/governance/cases/<case_id>/vote', methods=['POST'])
@require_auth
def cast_vote(case_id):
    """Cast a vote on a case."""
    try:
        data = request.get_json()
        vote_type = data.get('vote_type')
        reasoning = data.get('reasoning')
        evidence_bundle_hash = data.get('evidence_bundle_hash')
        
        # Validate input
        if not vote_type or not reasoning:
            return jsonify({'error': 'Vote type and reasoning are required'}), 400
        
        valid_votes = ['APPROVE', 'REJECT', 'NEEDS_MORE_INFO', 'ABSTAIN']
        if vote_type not in valid_votes:
            return jsonify({'error': 'Invalid vote type'}), 400
        
        db = get_db()
        
        # Verify case exists and user has access
        case = db.execute('SELECT * FROM cases WHERE id = ?', (case_id,)).fetchone()
        if not case:
            return jsonify({'error': 'Case not found'}), 404
        
        assigned_officials = json.loads(case['assigned_officials'])
        if g.current_user['role'] not in assigned_officials:
            return jsonify({'error': 'Access denied to this case'}), 403
        
        # Check if user has already voted
        existing_vote = db.execute(
            'SELECT * FROM votes WHERE case_id = ? AND voter_address = ?',
            (case_id, g.current_user['wallet_address'])
        ).fetchone()
        
        if existing_vote:
            return jsonify({'error': 'You have already voted on this case'}), 400
        
        # Generate vote ID and record vote
        vote_id = f"vote_{secrets.token_hex(8)}"
        vote_weight = GOVERNANCE_CONFIG['roles'][g.current_user['role']]['voting_weight']
        
        db.execute('''
            INSERT INTO votes 
            (id, case_id, voter_role, voter_address, vote_type, reasoning, 
             timestamp, evidence_bundle_hash, weight)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            vote_id,
            case_id,
            g.current_user['role'],
            g.current_user['wallet_address'],
            vote_type,
            reasoning,
            datetime.utcnow().isoformat(),
            evidence_bundle_hash,
            vote_weight
        ))
        
        # Check if voting threshold is reached
        votes = db.execute(
            'SELECT vote_type, weight FROM votes WHERE case_id = ?',
            (case_id,)
        ).fetchall()
        
        total_weight = sum(vote['weight'] for vote in votes)
        approve_weight = sum(vote['weight'] for vote in votes if vote['vote_type'] == 'APPROVE')
        
        threshold = GOVERNANCE_CONFIG['vote_thresholds'][case['priority'] + '_PRIORITY']
        approval_percentage = (approve_weight / total_weight * 100) if total_weight > 0 else 0
        
        # Update case status if threshold reached
        new_status = case['status']
        if len(votes) >= len(assigned_officials):  # All officials have voted
            if approval_percentage >= threshold:
                new_status = 'CONSENSUS_REACHED'
            else:
                new_status = 'REJECTED'
        
        if new_status != case['status']:
            db.execute(
                'UPDATE cases SET status = ? WHERE id = ?',
                (new_status, case_id)
            )
        
        db.commit()
        
        # Log the vote action
        log_action(case_id, 'VOTE_CAST', {
            'vote_type': vote_type,
            'weight': vote_weight,
            'approval_percentage': approval_percentage
        })
        
        return jsonify({
            'message': 'Vote cast successfully',
            'vote_id': vote_id,
            'new_status': new_status,
            'approval_percentage': approval_percentage
        })
        
    except Exception as e:
        logger.error(f"Error casting vote: {str(e)}")
        return jsonify({'error': 'Failed to cast vote'}), 500

@app.route('/api/governance/cases/<case_id>/votes', methods=['GET'])
@require_auth
def get_case_votes(case_id):
    """Get votes for a specific case."""
    try:
        db = get_db()
        
        # Verify user has access to case
        case = db.execute('SELECT * FROM cases WHERE id = ?', (case_id,)).fetchone()
        if not case:
            return jsonify({'error': 'Case not found'}), 404
        
        assigned_officials = json.loads(case['assigned_officials'])
        if g.current_user['role'] not in assigned_officials:
            return jsonify({'error': 'Access denied to this case'}), 403
        
        # Get all votes for the case
        votes = db.execute('''
            SELECT voter_role, vote_type, reasoning, timestamp, weight
            FROM votes 
            WHERE case_id = ? 
            ORDER BY timestamp ASC
        ''', (case_id,)).fetchall()
        
        vote_summary = {
            'total_votes': len(votes),
            'vote_breakdown': {},
            'votes': [dict(vote) for vote in votes]
        }
        
        # Calculate vote breakdown
        for vote in votes:
            vote_type = vote['vote_type']
            if vote_type not in vote_summary['vote_breakdown']:
                vote_summary['vote_breakdown'][vote_type] = {'count': 0, 'weight': 0}
            vote_summary['vote_breakdown'][vote_type]['count'] += 1
            vote_summary['vote_breakdown'][vote_type]['weight'] += vote['weight']
        
        return jsonify(vote_summary)
        
    except Exception as e:
        logger.error(f"Error fetching votes: {str(e)}")
        return jsonify({'error': 'Failed to fetch votes'}), 500

@app.route('/api/governance/notifications', methods=['GET'])
@require_auth
def get_notifications():
    """Get notifications for current user."""
    try:
        db = get_db()
        user_role = g.current_user['role']
        
        # Mock notifications (in real implementation, generate based on case activity)
        notifications = [
            {
                'id': 'notif_1',
                'type': 'NEW_CASE',
                'message': f'New case assigned requiring {user_role} review',
                'timestamp': datetime.utcnow().isoformat(),
                'read': False
            },
            {
                'id': 'notif_2',
                'type': 'VOTE_REQUIRED',
                'message': 'Your vote is required for pending case',
                'timestamp': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                'read': False
            }
        ]
        
        return jsonify({'notifications': notifications})
        
    except Exception as e:
        logger.error(f"Error fetching notifications: {str(e)}")
        return jsonify({'error': 'Failed to fetch notifications'}), 500

@app.route('/api/governance/audit/<case_id>', methods=['GET'])
@require_auth
@require_role(['final_approval', 'case_review'])
def get_audit_trail(case_id):
    """Get audit trail for a case."""
    try:
        db = get_db()
        
        audit_records = db.execute('''
            SELECT action, actor_address, actor_role, timestamp, details
            FROM audit_trail 
            WHERE case_id = ? 
            ORDER BY timestamp DESC
        ''', (case_id,)).fetchall()
        
        return jsonify({
            'case_id': case_id,
            'audit_trail': [dict(record) for record in audit_records]
        })
        
    except Exception as e:
        logger.error(f"Error fetching audit trail: {str(e)}")
        return jsonify({'error': 'Failed to fetch audit trail'}), 500

# Initialize sample data
def init_sample_data():
    """Initialize sample governance data."""
    with app.app_context():
        db = get_db()
        
        # Sample officials
        sample_officials = [
            {
                'wallet_address': '0x1234567890123456789012345678901234567890',
                'name': 'Rajesh Patel',
                'role': 'DISTRICT_COLLECTOR',
                'district': 'Gandhinagar',
                'verified': True
            },
            {
                'wallet_address': '0x2345678901234567890123456789012345678901',
                'name': 'Priya Shah',
                'role': 'TEHSILDAR',
                'district': 'Ahmedabad',
                'verified': True
            },
            {
                'wallet_address': '0x3456789012345678901234567890123456789012',
                'name': 'Amit Kumar',
                'role': 'PATWARI',
                'district': 'Surat',
                'verified': True
            }
        ]
        
        for official in sample_officials:
            db.execute('''
                INSERT OR REPLACE INTO officials 
                (wallet_address, name, role, district, verified, verification_date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                official['wallet_address'],
                official['name'],
                official['role'],
                official['district'],
                official['verified'],
                datetime.utcnow().isoformat(),
                'ACTIVE'
            ))
        
        # Sample cases
        sample_cases = [
            {
                'id': 'CASE_2025_001',
                'title': 'Property Boundary Dispute - Village Bavla',
                'property_ulpin': 'GJ01AA1234567890',
                'status': 'UNDER_REVIEW',
                'priority': 'HIGH',
                'created_date': '2025-07-25',
                'assigned_officials': ['DISTRICT_COLLECTOR', 'TEHSILDAR', 'PATWARI'],
                'evidence_completeness': 85
            }
        ]
        
        for case in sample_cases:
            db.execute('''
                INSERT OR REPLACE INTO cases 
                (id, title, property_ulpin, status, priority, created_date, 
                 assigned_officials, evidence_completeness, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                case['id'],
                case['title'],
                case['property_ulpin'],
                case['status'],
                case['priority'],
                case['created_date'],
                json.dumps(case['assigned_officials']),
                case['evidence_completeness'],
                'system'
            ))
            
            # Link evidence bundle
            db.execute('''
                INSERT OR REPLACE INTO evidence_links
                (id, case_id, bundle_id, bundle_hash, completeness_score, 
                 confidence_rating, generated_timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                f"evidence_{case['id']}",
                case['id'],
                f"bundle_{case['id']}",
                hashlib.sha256(f"bundle_{case['id']}".encode()).hexdigest(),
                case['evidence_completeness'],
                'HIGH',
                datetime.utcnow().isoformat()
            ))
        
        db.commit()

if __name__ == '__main__':
    init_db()
    init_sample_data()
    app.run(debug=True, host='0.0.0.0', port=5003)
