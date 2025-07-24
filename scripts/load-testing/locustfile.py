#!/usr/bin/env python3
"""
Locust Load Testing Configuration
Gujarat LandChain - Sprint 11

This script defines load testing scenarios for the Gujarat LandChain system.
Tests include property viewing, transfers, and administrative functions.

Usage:
    locust -f locustfile.py --host=http://localhost:3000
"""

import json
import random
import time
from locust import HttpUser, task, between, events
from typing import Dict, List

class LandChainUser(HttpUser):
    """Simulates a user interacting with the Gujarat LandChain system."""
    
    wait_time = between(1, 3)  # Wait 1-3 seconds between requests
    
    def on_start(self):
        """Initialize user session."""
        self.user_id = f"user_{random.randint(1000, 9999)}"
        self.properties_viewed = []
        self.session_data = {}
        
        # Login simulation
        self.login()
    
    def login(self):
        """Simulate user login."""
        login_data = {
            "aadhaar": f"123456789{random.randint(100, 999)}",
            "otp": "123456"
        }
        
        try:
            response = self.client.post("/api/auth/login", json=login_data)
            if response.status_code == 200:
                self.session_data = response.json()
                self.client.headers.update({
                    "Authorization": f"Bearer {self.session_data.get('token', '')}"
                })
        except Exception as e:
            print(f"Login failed: {e}")
    
    @task(3)
    def view_property_list(self):
        """View list of properties (most common action)."""
        try:
            response = self.client.get("/api/properties", params={
                "page": random.randint(1, 10),
                "limit": 20,
                "village": random.choice(["Ahmedabad", "Surat", "Vadodara", "Rajkot"])
            })
            
            if response.status_code == 200:
                properties = response.json().get("properties", [])
                if properties:
                    self.properties_viewed.extend([p["id"] for p in properties[:5]])
        except Exception as e:
            print(f"Property list view failed: {e}")
    
    @task(2)
    def view_property_details(self):
        """View specific property details."""
        if not self.properties_viewed:
            return
        
        property_id = random.choice(self.properties_viewed)
        
        try:
            response = self.client.get(f"/api/properties/{property_id}")
            
            if response.status_code == 200:
                property_data = response.json()
                # Simulate user reading property details
                time.sleep(random.uniform(0.5, 2.0))
        except Exception as e:
            print(f"Property details view failed: {e}")
    
    @task(1)
    def view_property_map(self):
        """View property on map."""
        if not self.properties_viewed:
            return
        
        property_id = random.choice(self.properties_viewed)
        
        try:
            response = self.client.get(f"/api/properties/{property_id}/map")
            
            if response.status_code == 200:
                # Simulate map interaction
                time.sleep(random.uniform(1.0, 3.0))
        except Exception as e:
            print(f"Property map view failed: {e}")
    
    @task(1)
    def initiate_transfer(self):
        """Initiate property transfer process."""
        if not self.properties_viewed:
            return
        
        property_id = random.choice(self.properties_viewed)
        
        transfer_data = {
            "property_id": property_id,
            "new_owner_aadhaar": f"987654321{random.randint(100, 999)}",
            "transfer_reason": random.choice([
                "Sale", "Gift", "Inheritance", "Partition"
            ])
        }
        
        try:
            response = self.client.post("/api/transfers/initiate", json=transfer_data)
            
            if response.status_code == 200:
                transfer_id = response.json().get("transfer_id")
                # Simulate transfer approval process
                time.sleep(random.uniform(2.0, 5.0))
        except Exception as e:
            print(f"Transfer initiation failed: {e}")
    
    @task(1)
    def check_transfer_status(self):
        """Check transfer status."""
        try:
            response = self.client.get("/api/transfers/status", params={
                "user_id": self.user_id
            })
            
            if response.status_code == 200:
                transfers = response.json().get("transfers", [])
                # Simulate user reviewing transfer status
                time.sleep(random.uniform(0.5, 1.5))
        except Exception as e:
            print(f"Transfer status check failed: {e}")

class AdminUser(HttpUser):
    """Simulates an administrative user."""
    
    wait_time = between(2, 5)  # Longer wait times for admin actions
    
    def on_start(self):
        """Initialize admin session."""
        self.admin_id = f"admin_{random.randint(100, 999)}"
        self.login()
    
    def login(self):
        """Simulate admin login."""
        login_data = {
            "username": f"admin{random.randint(1, 5)}",
            "password": "admin123",
            "role": "admin"
        }
        
        try:
            response = self.client.post("/api/admin/login", json=login_data)
            if response.status_code == 200:
                self.session_data = response.json()
                self.client.headers.update({
                    "Authorization": f"Bearer {self.session_data.get('token', '')}"
                })
        except Exception as e:
            print(f"Admin login failed: {e}")
    
    @task(2)
    def view_approval_queue(self):
        """View batch approval queue."""
        try:
            response = self.client.get("/api/admin/approval-queue", params={
                "status": "pending",
                "limit": 50
            })
            
            if response.status_code == 200:
                queue_data = response.json()
                # Simulate admin reviewing queue
                time.sleep(random.uniform(1.0, 3.0))
        except Exception as e:
            print(f"Approval queue view failed: {e}")
    
    @task(1)
    def batch_approve_transfers(self):
        """Perform batch approval of transfers."""
        try:
            # Get pending transfers
            response = self.client.get("/api/admin/approval-queue", params={
                "status": "pending",
                "limit": 10
            })
            
            if response.status_code == 200:
                transfers = response.json().get("transfers", [])
                if transfers:
                    transfer_ids = [t["id"] for t in transfers[:5]]
                    
                    approval_data = {
                        "transfer_ids": transfer_ids,
                        "action": "approve",
                        "notes": "Batch approved by load test"
                    }
                    
                    response = self.client.post("/api/admin/batch-approve", json=approval_data)
                    
                    if response.status_code == 200:
                        # Simulate processing time
                        time.sleep(random.uniform(2.0, 4.0))
        except Exception as e:
            print(f"Batch approval failed: {e}")
    
    @task(1)
    def view_audit_logs(self):
        """View audit logs."""
        try:
            response = self.client.get("/api/admin/audit-logs", params={
                "start_date": "2025-01-01",
                "end_date": "2025-01-27",
                "action_type": random.choice(["transfer", "approval", "login"])
            })
            
            if response.status_code == 200:
                # Simulate admin reviewing logs
                time.sleep(random.uniform(1.0, 2.0))
        except Exception as e:
            print(f"Audit log view failed: {e}")
    
    @task(1)
    def export_reports(self):
        """Export reports."""
        try:
            response = self.client.get("/api/admin/export", params={
                "report_type": random.choice(["transfers", "properties", "users"]),
                "format": "csv"
            })
            
            if response.status_code == 200:
                # Simulate report generation time
                time.sleep(random.uniform(3.0, 6.0))
        except Exception as e:
            print(f"Report export failed: {e}")

class DisputeUser(HttpUser):
    """Simulates a user involved in dispute resolution."""
    
    wait_time = between(3, 8)  # Longer wait times for dispute actions
    
    def on_start(self):
        """Initialize dispute user session."""
        self.dispute_id = f"dispute_{random.randint(1000, 9999)}"
        self.login()
    
    def login(self):
        """Simulate dispute user login."""
        login_data = {
            "aadhaar": f"555666777{random.randint(100, 999)}",
            "otp": "123456"
        }
        
        try:
            response = self.client.post("/api/auth/login", json=login_data)
            if response.status_code == 200:
                self.session_data = response.json()
                self.client.headers.update({
                    "Authorization": f"Bearer {self.session_data.get('token', '')}"
                })
        except Exception as e:
            print(f"Dispute user login failed: {e}")
    
    @task(2)
    def view_dispute_status(self):
        """View dispute resolution status."""
        try:
            response = self.client.get(f"/api/disputes/{self.dispute_id}/status")
            
            if response.status_code == 200:
                dispute_data = response.json()
                # Simulate user reviewing dispute
                time.sleep(random.uniform(1.0, 2.0))
        except Exception as e:
            print(f"Dispute status view failed: {e}")
    
    @task(1)
    def submit_evidence(self):
        """Submit evidence for dispute."""
        evidence_data = {
            "dispute_id": self.dispute_id,
            "evidence_type": random.choice(["document", "image", "witness_statement"]),
            "description": "Load test evidence submission"
        }
        
        try:
            response = self.client.post("/api/disputes/evidence", json=evidence_data)
            
            if response.status_code == 200:
                # Simulate evidence processing
                time.sleep(random.uniform(2.0, 4.0))
        except Exception as e:
            print(f"Evidence submission failed: {e}")
    
    @task(1)
    def participate_in_voting(self):
        """Participate in governance voting."""
        vote_data = {
            "dispute_id": self.dispute_id,
            "vote": random.choice(["approve", "reject", "abstain"]),
            "reason": "Load test participation"
        }
        
        try:
            response = self.client.post("/api/disputes/vote", json=vote_data)
            
            if response.status_code == 200:
                # Simulate voting process
                time.sleep(random.uniform(1.0, 2.0))
        except Exception as e:
            print(f"Voting failed: {e}")

# Event handlers for monitoring
@events.request.add_listener
def my_request_handler(request_type, name, response_time, response_length, response, context, exception, start_time, url, **kwargs):
    """Log request details for monitoring."""
    if exception:
        print(f"Request failed: {name} - {exception}")
    else:
        print(f"Request: {name} - {response_time}ms - {response.status_code}")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Called when a test is starting."""
    print("Load test starting for Gujarat LandChain...")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Called when a test is ending."""
    print("Load test completed for Gujarat LandChain.") 