#!/usr/bin/env python3
"""
TaxPortal Pro API Backend Test Suite
Tests all API endpoints comprehensively including authentication, role-based access control,
CRUD operations, file uploads, and error handling.
"""

import requests
import json
import os
import tempfile
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import uuid

# Configuration
BASE_URL = "https://taxpro-hub.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class TaxPortalAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.tokens = {}  # Store tokens for different users
        self.users = {}   # Store user data
        self.clients = {} # Store client data
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    files: Dict = None, token: str = None, params: Dict = None) -> requests.Response:
        """Make HTTP request with optional authentication"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        if files is None and data is not None:
            headers["Content-Type"] = "application/json"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=params)
            elif method.upper() == "POST":
                if files:
                    response = self.session.post(url, headers=headers, data=data, files=files)
                else:
                    response = self.session.post(url, headers=headers, json=data)
            elif method.upper() == "PUT":
                response = self.session.put(url, headers=headers, json=data)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            raise

    def test_health_check(self):
        """Test API health check endpoint"""
        try:
            response = self.make_request("GET", "/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Health Check", True, "API is healthy")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected health status: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_user_registration(self):
        """Test user registration for different roles"""
        import time
        timestamp = str(int(time.time()))
        
        test_users = [
            {
                "role": "tax_professional",
                "email": f"taxpro{timestamp}@example.com",
                "password": "SecurePass123!",
                "profile": {
                    "firstName": "John",
                    "lastName": "Smith",
                    "phone": "+1234567890",
                    "company": "Smith Tax Services"
                }
            },
            {
                "role": "client", 
                "email": f"client{timestamp}@example.com",
                "password": "ClientPass123!",
                "profile": {
                    "firstName": "Jane",
                    "lastName": "Doe",
                    "phone": "+1987654321"
                }
            },
            {
                "role": "admin",
                "email": f"admin{timestamp}@example.com", 
                "password": "AdminPass123!",
                "profile": {
                    "firstName": "Admin",
                    "lastName": "User",
                    "company": "TaxPortal Pro"
                }
            }
        ]
        
        success_count = 0
        for user_data in test_users:
            try:
                response = self.make_request("POST", "/auth/register", user_data)
                if response.status_code == 200:
                    data = response.json()
                    if "access_token" in data and "user" in data:
                        self.tokens[user_data["role"]] = data["access_token"]
                        self.users[user_data["role"]] = data["user"]
                        self.log_test(f"Register {user_data['role']}", True, 
                                    f"User registered successfully with ID: {data['user']['id']}")
                        success_count += 1
                    else:
                        self.log_test(f"Register {user_data['role']}", False, 
                                    f"Missing token or user data in response: {data}")
                elif response.status_code == 400 and "already registered" in response.text:
                    # Try to login instead
                    login_data = {
                        "email": user_data["email"],
                        "password": user_data["password"]
                    }
                    login_response = self.make_request("POST", "/auth/login", login_data)
                    if login_response.status_code == 200:
                        data = login_response.json()
                        self.tokens[user_data["role"]] = data["access_token"]
                        self.users[user_data["role"]] = data["user"]
                        self.log_test(f"Register {user_data['role']}", True, 
                                    f"User already exists, logged in with ID: {data['user']['id']}")
                        success_count += 1
                    else:
                        self.log_test(f"Register {user_data['role']}", False, 
                                    f"User exists but login failed: {login_response.text}")
                else:
                    self.log_test(f"Register {user_data['role']}", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Register {user_data['role']}", False, f"Exception: {str(e)}")
                
        return success_count == len(test_users)

    def test_user_login(self):
        """Test user login"""
        if "tax_professional" not in self.users:
            self.log_test("User Login", False, "No tax professional user available for login test")
            return False
            
        login_data = {
            "email": self.users["tax_professional"]["email"],
            "password": "SecurePass123!"
        }
        
        try:
            response = self.make_request("POST", "/auth/login", login_data)
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    # Update token (should be same as registration)
                    self.tokens["login_test"] = data["access_token"]
                    self.log_test("User Login", True, "Login successful")
                    return True
                else:
                    self.log_test("User Login", False, f"Missing access token: {data}")
                    return False
            else:
                self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Login", False, f"Exception: {str(e)}")
            return False

    def test_get_current_user(self):
        """Test getting current user profile"""
        if "tax_professional" not in self.tokens:
            self.log_test("Get Current User", False, "No tax professional token available")
            return False
            
        try:
            response = self.make_request("GET", "/auth/me", token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "email" in data:
                    self.log_test("Get Current User", True, f"Retrieved user profile for: {data['email']}")
                    return True
                else:
                    self.log_test("Get Current User", False, f"Invalid user data: {data}")
                    return False
            else:
                self.log_test("Get Current User", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Current User", False, f"Exception: {str(e)}")
            return False

    def test_create_client_relationship(self):
        """Test creating client relationships"""
        if "tax_professional" not in self.tokens or "client" not in self.users:
            self.log_test("Create Client Relationship", False, "Missing required tokens/users")
            return False
            
        client_data = {
            "userId": self.users["client"]["id"],
            "taxProfessionalId": self.users["tax_professional"]["id"],
            "taxYear": 2024,
            "estimatedCompletion": (datetime.now() + timedelta(days=30)).isoformat(),
            "notes": "New client for 2024 tax year"
        }
        
        try:
            response = self.make_request("POST", "/clients/", client_data, 
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.clients["main"] = data
                    self.log_test("Create Client Relationship", True, 
                                f"Client relationship created with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Create Client Relationship", False, f"Missing client ID: {data}")
                    return False
            else:
                self.log_test("Create Client Relationship", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Client Relationship", False, f"Exception: {str(e)}")
            return False

    def test_get_clients(self):
        """Test getting clients with different user roles"""
        test_cases = [
            ("tax_professional", "Tax Professional View"),
            ("client", "Client View"),
            ("admin", "Admin View")
        ]
        
        success_count = 0
        for role, test_name in test_cases:
            if role not in self.tokens:
                self.log_test(f"Get Clients - {test_name}", False, f"No {role} token available")
                continue
                
            try:
                response = self.make_request("GET", "/clients/", token=self.tokens[role])
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_test(f"Get Clients - {test_name}", True, 
                                    f"Retrieved {len(data)} clients")
                        success_count += 1
                    else:
                        self.log_test(f"Get Clients - {test_name}", False, 
                                    f"Expected list, got: {type(data)}")
                else:
                    self.log_test(f"Get Clients - {test_name}", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Get Clients - {test_name}", False, f"Exception: {str(e)}")
                
        return success_count == len(test_cases)

    def test_document_upload(self):
        """Test document upload functionality"""
        if "main" not in self.clients or "tax_professional" not in self.tokens:
            self.log_test("Document Upload", False, "Missing client or token")
            return False
            
        # Create a temporary test file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write("This is a test document for TaxPortal Pro API testing.")
            temp_file_path = f.name
            
        try:
            with open(temp_file_path, 'rb') as f:
                files = {'file': ('test_document.txt', f, 'text/plain')}
                data = {
                    'client_id': self.clients["main"]["id"],
                    'category': 'other',
                    'description': 'Test document upload'
                }
                
                response = self.make_request("POST", "/documents/upload", data=data, files=files,
                                           token=self.tokens["tax_professional"])
                
            if response.status_code == 200:
                doc_data = response.json()
                if "id" in doc_data and "fileName" in doc_data:
                    self.log_test("Document Upload", True, 
                                f"Document uploaded with ID: {doc_data['id']}")
                    return True
                else:
                    self.log_test("Document Upload", False, f"Invalid document data: {doc_data}")
                    return False
            else:
                self.log_test("Document Upload", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Document Upload", False, f"Exception: {str(e)}")
            return False
        finally:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    def test_create_task(self):
        """Test task creation"""
        if "main" not in self.clients or "tax_professional" not in self.tokens:
            self.log_test("Create Task", False, "Missing client or token")
            return False
            
        task_data = {
            "clientId": self.clients["main"]["id"],
            "title": "Gather W-2 Forms",
            "description": "Please collect all W-2 forms for 2024 tax year",
            "priority": "high",
            "dueDate": (datetime.now() + timedelta(days=7)).isoformat(),
            "createdBy": self.users["tax_professional"]["id"]
        }
        
        try:
            response = self.make_request("POST", "/tasks/", task_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.log_test("Create Task", True, f"Task created with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Create Task", False, f"Missing task ID: {data}")
                    return False
            else:
                self.log_test("Create Task", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Task", False, f"Exception: {str(e)}")
            return False

    def test_send_message(self):
        """Test sending messages"""
        if "main" not in self.clients or "tax_professional" not in self.tokens:
            self.log_test("Send Message", False, "Missing client or token")
            return False
            
        message_data = {
            "clientId": self.clients["main"]["id"],
            "receiverId": self.users["client"]["id"],
            "subject": "Welcome to TaxPortal Pro",
            "message": "Welcome! I'll be handling your 2024 tax return. Please upload your documents when ready.",
            "attachments": []
        }
        
        try:
            response = self.make_request("POST", "/messages/", message_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.log_test("Send Message", True, f"Message sent with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Send Message", False, f"Missing message ID: {data}")
                    return False
            else:
                self.log_test("Send Message", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Send Message", False, f"Exception: {str(e)}")
            return False

    def test_create_invoice(self):
        """Test invoice creation"""
        if "main" not in self.clients or "tax_professional" not in self.tokens:
            self.log_test("Create Invoice", False, "Missing client or token")
            return False
            
        invoice_data = {
            "clientId": self.clients["main"]["id"],
            "items": [
                {
                    "description": "Individual Tax Return Preparation",
                    "quantity": 1,
                    "rate": 250.00,
                    "amount": 250.00
                },
                {
                    "description": "State Tax Return",
                    "quantity": 1,
                    "rate": 75.00,
                    "amount": 75.00
                }
            ],
            "dueDate": (datetime.now() + timedelta(days=30)).isoformat(),
            "taxAmount": 26.00,
            "notes": "Payment due within 30 days"
        }
        
        try:
            response = self.make_request("POST", "/invoices/", invoice_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "invoiceNumber" in data:
                    # Store invoice ID for payment testing
                    self.test_invoice_id = data["id"]
                    self.log_test("Create Invoice", True, 
                                f"Invoice created: {data['invoiceNumber']} (ID: {data['id']})")
                    return True
                else:
                    self.log_test("Create Invoice", False, f"Missing invoice data: {data}")
                    return False
            else:
                self.log_test("Create Invoice", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Invoice", False, f"Exception: {str(e)}")
            return False

    def test_role_based_access_control(self):
        """Test role-based access control"""
        if "client" not in self.tokens:
            self.log_test("RBAC Test", False, "No client token available")
            return False
            
        # Test: Client trying to create another client (should fail)
        client_data = {
            "userId": str(uuid.uuid4()),
            "taxProfessionalId": self.users["tax_professional"]["id"],
            "taxYear": 2024
        }
        
        try:
            response = self.make_request("POST", "/clients/", client_data,
                                       token=self.tokens["client"])
            if response.status_code == 403:
                self.log_test("RBAC Test - Client Create Client", True, 
                            "Client correctly denied access to create client")
                return True
            else:
                self.log_test("RBAC Test - Client Create Client", False, 
                            f"Expected 403, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("RBAC Test - Client Create Client", False, f"Exception: {str(e)}")
            return False

    def test_authentication_required(self):
        """Test that authentication is required for protected endpoints"""
        try:
            response = self.make_request("GET", "/clients/")  # No token
            if response.status_code in [401, 403]:  # Both are valid for missing auth
                self.log_test("Auth Required Test", True, 
                            f"Correctly requires authentication (HTTP {response.status_code})")
                return True
            else:
                self.log_test("Auth Required Test", False, 
                            f"Expected 401 or 403, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Auth Required Test", False, f"Exception: {str(e)}")
            return False

    def test_invalid_token(self):
        """Test handling of invalid tokens"""
        try:
            response = self.make_request("GET", "/clients/", token="invalid_token_here")
            if response.status_code == 401:
                self.log_test("Invalid Token Test", True, "Correctly rejects invalid token")
                return True
            else:
                self.log_test("Invalid Token Test", False, 
                            f"Expected 401, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Invalid Token Test", False, f"Exception: {str(e)}")
            return False

    def test_logout(self):
        """Test user logout"""
        if "tax_professional" not in self.tokens:
            self.log_test("Logout Test", False, "No token available")
            return False
            
        try:
            response = self.make_request("POST", "/auth/logout", 
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Logout Test", True, "Logout successful")
                    return True
                else:
                    self.log_test("Logout Test", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Logout Test", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Logout Test", False, f"Exception: {str(e)}")
            return False

    # EMAIL INTEGRATION TESTS
    def test_send_client_invitation_email(self):
        """Test sending client invitation email"""
        if "tax_professional" not in self.tokens:
            self.log_test("Send Client Invitation Email", False, "No tax professional token available")
            return False
            
        invitation_data = {
            "client_email": "newclient@example.com",
            "client_first_name": "Sarah",
            "client_last_name": "Johnson",
            "personal_message": "Welcome to our tax services! I look forward to working with you.",
            "provider": "sendgrid"
        }
        
        try:
            response = self.make_request("POST", "/emails/send-client-invitation", invitation_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "queued for delivery" in data.get("message", ""):
                    self.log_test("Send Client Invitation Email", True, 
                                f"Invitation email queued successfully: {data['message']}")
                    return True
                else:
                    self.log_test("Send Client Invitation Email", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Send Client Invitation Email", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Send Client Invitation Email", False, f"Exception: {str(e)}")
            return False

    def test_send_test_email(self):
        """Test sending test email"""
        if "tax_professional" not in self.tokens:
            self.log_test("Send Test Email", False, "No tax professional token available")
            return False
            
        test_email_data = {
            "to_email": "test@example.com",
            "subject": "TaxPortal Pro Email Integration Test",
            "content": "<h1>Test Email</h1><p>This is a test email from TaxPortal Pro API.</p>",
            "content_type": "html",
            "provider": "sendgrid"
        }
        
        try:
            response = self.make_request("POST", "/emails/send-test-email", test_email_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "queued for delivery" in data.get("message", ""):
                    self.log_test("Send Test Email", True, 
                                f"Test email queued successfully: {data['message']}")
                    return True
                else:
                    self.log_test("Send Test Email", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Send Test Email", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Send Test Email", False, f"Exception: {str(e)}")
            return False

    def test_send_notification_email(self):
        """Test sending notification email"""
        if "tax_professional" not in self.tokens:
            self.log_test("Send Notification Email", False, "No tax professional token available")
            return False
            
        notification_data = {
            "to_email": "client@example.com",
            "notification_type": "document_uploaded",
            "data": {
                "message": "A new document has been uploaded to your tax portal.",
                "portal_link": "https://taxportal.com/dashboard"
            },
            "provider": "sendgrid"
        }
        
        try:
            response = self.make_request("POST", "/emails/send-notification", notification_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "queued for delivery" in data.get("message", ""):
                    self.log_test("Send Notification Email", True, 
                                f"Notification email queued successfully: {data['message']}")
                    return True
                else:
                    self.log_test("Send Notification Email", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Send Notification Email", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Send Notification Email", False, f"Exception: {str(e)}")
            return False

    def test_get_sent_invitations(self):
        """Test retrieving sent invitations"""
        if "tax_professional" not in self.tokens:
            self.log_test("Get Sent Invitations", False, "No tax professional token available")
            return False
            
        try:
            response = self.make_request("GET", "/emails/invitations", 
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "invitations" in data and "total" in data:
                    self.log_test("Get Sent Invitations", True, 
                                f"Retrieved {data['total']} invitations successfully")
                    return True
                else:
                    self.log_test("Get Sent Invitations", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_test("Get Sent Invitations", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Sent Invitations", False, f"Exception: {str(e)}")
            return False

    def test_email_authentication_required(self):
        """Test that email endpoints require authentication"""
        test_cases = [
            ("/emails/send-client-invitation", "POST"),
            ("/emails/send-test-email", "POST"),
            ("/emails/send-notification", "POST"),
            ("/emails/invitations", "GET")
        ]
        
        success_count = 0
        for endpoint, method in test_cases:
            try:
                response = self.make_request(method, endpoint, {})  # No token
                if response.status_code in [401, 403]:
                    self.log_test(f"Email Auth Required - {endpoint}", True, 
                                f"Correctly requires authentication (HTTP {response.status_code})")
                    success_count += 1
                else:
                    self.log_test(f"Email Auth Required - {endpoint}", False, 
                                f"Expected 401/403, got {response.status_code}")
            except Exception as e:
                self.log_test(f"Email Auth Required - {endpoint}", False, f"Exception: {str(e)}")
                
        return success_count == len(test_cases)

    def test_email_role_based_access(self):
        """Test role-based access control for email endpoints"""
        if "client" not in self.tokens:
            self.log_test("Email RBAC Test", False, "No client token available")
            return False
            
        # Test: Client trying to send invitation (should fail - requires tax_professional/admin)
        invitation_data = {
            "client_email": "test@example.com",
            "client_first_name": "Test",
            "client_last_name": "User",
            "personal_message": "Test message"
        }
        
        try:
            response = self.make_request("POST", "/emails/send-client-invitation", invitation_data,
                                       token=self.tokens["client"])
            if response.status_code == 403:
                self.log_test("Email RBAC Test - Client Send Invitation", True, 
                            "Client correctly denied access to send invitations")
                return True
            else:
                self.log_test("Email RBAC Test - Client Send Invitation", False, 
                            f"Expected 403, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Email RBAC Test - Client Send Invitation", False, f"Exception: {str(e)}")
            return False

    def test_email_validation(self):
        """Test email validation and error handling"""
        if "tax_professional" not in self.tokens:
            self.log_test("Email Validation Test", False, "No tax professional token available")
            return False
            
        # Test with invalid email format
        invalid_invitation_data = {
            "client_email": "invalid-email-format",
            "client_first_name": "Test",
            "client_last_name": "User"
        }
        
        try:
            response = self.make_request("POST", "/emails/send-client-invitation", invalid_invitation_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 422:  # Pydantic validation error
                self.log_test("Email Validation Test - Invalid Email", True, 
                            "Invalid email format correctly rejected")
                return True
            else:
                self.log_test("Email Validation Test - Invalid Email", False, 
                            f"Expected 422, got {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Email Validation Test - Invalid Email", False, f"Exception: {str(e)}")
            return False

    def test_resend_invitation_nonexistent(self):
        """Test resending non-existent invitation"""
        if "tax_professional" not in self.tokens:
            self.log_test("Resend Nonexistent Invitation", False, "No tax professional token available")
            return False
            
        fake_invitation_id = str(uuid.uuid4())
        
        try:
            response = self.make_request("POST", f"/emails/resend-invitation/{fake_invitation_id}",
                                       token=self.tokens["tax_professional"])
            if response.status_code == 404:
                self.log_test("Resend Nonexistent Invitation", True, 
                            "Non-existent invitation correctly returns 404")
                return True
            else:
                self.log_test("Resend Nonexistent Invitation", False, 
                            f"Expected 404, got {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Resend Nonexistent Invitation", False, f"Exception: {str(e)}")
            return False

    def test_resend_existing_invitation(self):
        """Test resending an existing invitation"""
        if "tax_professional" not in self.tokens:
            self.log_test("Resend Existing Invitation", False, "No tax professional token available")
            return False
            
        # First get the invitations to find an existing one
        try:
            response = self.make_request("GET", "/emails/invitations", 
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if data.get("total", 0) > 0:
                    invitation_id = data["invitations"][0]["id"]
                    
                    # Now try to resend it
                    resend_response = self.make_request("POST", f"/emails/resend-invitation/{invitation_id}",
                                                      token=self.tokens["tax_professional"])
                    if resend_response.status_code == 200:
                        resend_data = resend_response.json()
                        if "message" in resend_data and "resent successfully" in resend_data["message"]:
                            self.log_test("Resend Existing Invitation", True, 
                                        f"Invitation resent successfully: {resend_data['message']}")
                            return True
                        else:
                            self.log_test("Resend Existing Invitation", False, 
                                        f"Unexpected response: {resend_data}")
                            return False
                    else:
                        self.log_test("Resend Existing Invitation", False, 
                                    f"HTTP {resend_response.status_code}: {resend_response.text}")
                        return False
                else:
                    self.log_test("Resend Existing Invitation", True, 
                                "No invitations to resend (test skipped)")
                    return True
            else:
                self.log_test("Resend Existing Invitation", False, 
                            f"Failed to get invitations: HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Resend Existing Invitation", False, f"Exception: {str(e)}")
            return False

    # PAYMENT INTEGRATION TESTS
    def test_get_service_packages(self):
        """Test retrieving available service packages"""
        try:
            response = self.make_request("GET", "/payments/services/packages")
            if response.status_code == 200:
                data = response.json()
                if "packages" in data:
                    packages = data["packages"]
                    expected_packages = ["tax_basic", "tax_premium", "bookkeeping_monthly", "bookkeeping_quarterly", "consultation"]
                    
                    # Check if all expected packages are present
                    missing_packages = [pkg for pkg in expected_packages if pkg not in packages]
                    if not missing_packages:
                        # Verify package structure
                        for pkg_name, pkg_info in packages.items():
                            required_fields = ["name", "price", "currency", "description", "features"]
                            missing_fields = [field for field in required_fields if field not in pkg_info]
                            if missing_fields:
                                self.log_test("Get Service Packages", False, 
                                            f"Package {pkg_name} missing fields: {missing_fields}")
                                return False
                        
                        self.log_test("Get Service Packages", True, 
                                    f"Retrieved {len(packages)} service packages successfully")
                        return True
                    else:
                        self.log_test("Get Service Packages", False, 
                                    f"Missing expected packages: {missing_packages}")
                        return False
                else:
                    self.log_test("Get Service Packages", False, f"Missing 'packages' key in response: {data}")
                    return False
            else:
                self.log_test("Get Service Packages", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Service Packages", False, f"Exception: {str(e)}")
            return False

    def test_create_service_payment_checkout(self):
        """Test creating service payment checkout session"""
        if "tax_professional" not in self.tokens:
            self.log_test("Create Service Payment Checkout", False, "No tax professional token available")
            return False
            
        payment_data = {
            "service_package": "tax_basic",
            "origin_url": "https://taxpro-hub.preview.emergentagent.com",
            "metadata": {
                "client_name": "John Smith",
                "tax_year": "2024"
            }
        }
        
        try:
            response = self.make_request("POST", "/payments/service/checkout", payment_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                required_fields = ["success", "checkout_url", "session_id", "message"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    if data["success"] and data["checkout_url"] and data["session_id"]:
                        # Store session_id for status testing
                        self.payment_session_id = data["session_id"]
                        self.log_test("Create Service Payment Checkout", True, 
                                    f"Service payment session created: {data['session_id']}")
                        return True
                    else:
                        self.log_test("Create Service Payment Checkout", False, 
                                    f"Invalid response values: {data}")
                        return False
                else:
                    self.log_test("Create Service Payment Checkout", False, 
                                f"Missing required fields: {missing_fields}")
                    return False
            else:
                self.log_test("Create Service Payment Checkout", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Service Payment Checkout", False, f"Exception: {str(e)}")
            return False

    def test_create_invoice_payment_checkout(self):
        """Test creating invoice payment checkout session"""
        if "tax_professional" not in self.tokens:
            self.log_test("Create Invoice Payment Checkout", False, "No tax professional token available")
            return False
            
        # Use existing invoice from previous test if available
        if hasattr(self, 'test_invoice_id'):
            invoice_id = self.test_invoice_id
        else:
            # Create a new invoice for testing
            invoice_data = {
                "clientId": self.clients.get("main", {}).get("id") if "main" in self.clients else str(uuid.uuid4()),
                "items": [
                    {
                        "description": "Tax Return Preparation",
                        "quantity": 1,
                        "rate": 300.00,
                        "amount": 300.00
                    }
                ],
                "dueDate": (datetime.now() + timedelta(days=30)).isoformat(),
                "taxAmount": 24.00,
                "notes": "Payment for tax services"
            }
            
            try:
                # Create invoice first
                invoice_response = self.make_request("POST", "/invoices/", invoice_data,
                                                   token=self.tokens["tax_professional"])
                if invoice_response.status_code != 200:
                    self.log_test("Create Invoice Payment Checkout", False, 
                                f"Failed to create test invoice: {invoice_response.text}")
                    return False
                    
                invoice = invoice_response.json()
                invoice_id = invoice["id"]
                self.test_invoice_id = invoice_id
            except Exception as e:
                self.log_test("Create Invoice Payment Checkout", False, f"Exception creating invoice: {str(e)}")
                return False
        
        try:
            # Now create payment checkout
            payment_data = {
                "invoice_id": invoice_id,
                "origin_url": "https://taxpro-hub.preview.emergentagent.com"
            }
            
            response = self.make_request("POST", "/payments/invoice/checkout", payment_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                required_fields = ["success", "checkout_url", "session_id", "message"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    if data["success"] and data["checkout_url"] and data["session_id"]:
                        # Store session_id for status testing
                        self.invoice_payment_session_id = data["session_id"]
                        self.log_test("Create Invoice Payment Checkout", True, 
                                    f"Invoice payment session created: {data['session_id']}")
                        return True
                    else:
                        self.log_test("Create Invoice Payment Checkout", False, 
                                    f"Invalid response values: {data}")
                        return False
                else:
                    self.log_test("Create Invoice Payment Checkout", False, 
                                f"Missing required fields: {missing_fields}")
                    return False
            else:
                self.log_test("Create Invoice Payment Checkout", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Invoice Payment Checkout", False, f"Exception: {str(e)}")
            return False

    def test_get_payment_status(self):
        """Test getting payment status"""
        if "tax_professional" not in self.tokens:
            self.log_test("Get Payment Status", False, "No tax professional token available")
            return False
            
        # Use session_id from previous test if available
        session_id = getattr(self, 'payment_session_id', None)
        if not session_id:
            self.log_test("Get Payment Status", True, "No payment session available (test skipped)")
            return True
            
        try:
            response = self.make_request("GET", f"/payments/status/{session_id}",
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                required_fields = ["session_id", "status", "payment_status", "amount_total", "currency", "metadata"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    if data["session_id"] == session_id:
                        self.log_test("Get Payment Status", True, 
                                    f"Payment status retrieved: {data['payment_status']} ({data['status']})")
                        return True
                    else:
                        self.log_test("Get Payment Status", False, 
                                    f"Session ID mismatch: expected {session_id}, got {data['session_id']}")
                        return False
                else:
                    self.log_test("Get Payment Status", False, 
                                f"Missing required fields: {missing_fields}")
                    return False
            else:
                self.log_test("Get Payment Status", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Payment Status", False, f"Exception: {str(e)}")
            return False

    def test_get_user_payment_transactions(self):
        """Test retrieving user payment transactions"""
        if "tax_professional" not in self.tokens:
            self.log_test("Get User Payment Transactions", False, "No tax professional token available")
            return False
            
        try:
            response = self.make_request("GET", "/payments/transactions",
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "transactions" in data and "total" in data:
                    transactions = data["transactions"]
                    total = data["total"]
                    
                    # Verify transaction structure if any exist
                    if total > 0 and len(transactions) > 0:
                        transaction = transactions[0]
                        required_fields = ["id", "session_id", "user_id", "amount", "currency", "payment_status"]
                        missing_fields = [field for field in required_fields if field not in transaction]
                        
                        if missing_fields:
                            self.log_test("Get User Payment Transactions", False, 
                                        f"Transaction missing fields: {missing_fields}")
                            return False
                    
                    self.log_test("Get User Payment Transactions", True, 
                                f"Retrieved {total} payment transactions")
                    return True
                else:
                    self.log_test("Get User Payment Transactions", False, 
                                f"Missing required keys in response: {data}")
                    return False
            else:
                self.log_test("Get User Payment Transactions", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get User Payment Transactions", False, f"Exception: {str(e)}")
            return False

    def test_payment_authentication_required(self):
        """Test that payment endpoints require authentication"""
        test_cases = [
            ("/payments/service/checkout", "POST"),
            ("/payments/invoice/checkout", "POST"),
            ("/payments/transactions", "GET")
        ]
        
        success_count = 0
        for endpoint, method in test_cases:
            try:
                test_data = {"service_package": "tax_basic", "origin_url": "https://example.com"} if method == "POST" else {}
                response = self.make_request(method, endpoint, test_data)  # No token
                if response.status_code in [401, 403]:
                    self.log_test(f"Payment Auth Required - {endpoint}", True, 
                                f"Correctly requires authentication (HTTP {response.status_code})")
                    success_count += 1
                else:
                    self.log_test(f"Payment Auth Required - {endpoint}", False, 
                                f"Expected 401/403, got {response.status_code}")
            except Exception as e:
                self.log_test(f"Payment Auth Required - {endpoint}", False, f"Exception: {str(e)}")
                
        return success_count == len(test_cases)

    def test_invalid_service_package(self):
        """Test creating payment with invalid service package"""
        if "tax_professional" not in self.tokens:
            self.log_test("Invalid Service Package Test", False, "No tax professional token available")
            return False
            
        payment_data = {
            "service_package": "invalid_package_name",
            "origin_url": "https://taxpro-hub.preview.emergentagent.com"
        }
        
        try:
            response = self.make_request("POST", "/payments/service/checkout", payment_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 400:
                self.log_test("Invalid Service Package Test", True, 
                            "Invalid service package correctly rejected")
                return True
            else:
                self.log_test("Invalid Service Package Test", False, 
                            f"Expected 400, got {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Invalid Service Package Test", False, f"Exception: {str(e)}")
            return False

    def test_payment_status_access_control(self):
        """Test payment status access control"""
        if "client" not in self.tokens or "tax_professional" not in self.tokens:
            self.log_test("Payment Status Access Control", False, "Missing required tokens")
            return False
            
        # Use session_id from previous test if available
        session_id = getattr(self, 'payment_session_id', None)
        if not session_id:
            self.log_test("Payment Status Access Control", True, "No payment session available (test skipped)")
            return True
            
        try:
            # Try to access payment status with different user (should fail)
            response = self.make_request("GET", f"/payments/status/{session_id}",
                                       token=self.tokens["client"])
            if response.status_code == 403:
                self.log_test("Payment Status Access Control", True, 
                            "Payment status access correctly restricted")
                return True
            elif response.status_code == 404:
                self.log_test("Payment Status Access Control", True, 
                            "Payment session not found for different user (correct behavior)")
                return True
            else:
                self.log_test("Payment Status Access Control", False, 
                            f"Expected 403 or 404, got {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Payment Status Access Control", False, f"Exception: {str(e)}")
            return False

    def test_stripe_webhook_endpoint(self):
        """Test Stripe webhook endpoint (basic structure test)"""
        try:
            # Test webhook endpoint without signature (should fail)
            response = self.make_request("POST", "/payments/webhook/stripe", {"test": "data"})
            if response.status_code == 400:
                if "Missing Stripe signature" in response.text:
                    self.log_test("Stripe Webhook Endpoint", True, 
                                "Webhook correctly requires Stripe signature")
                    return True
                else:
                    self.log_test("Stripe Webhook Endpoint", False, 
                                f"Unexpected error message: {response.text}")
                    return False
            else:
                self.log_test("Stripe Webhook Endpoint", False, 
                            f"Expected 400, got {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Stripe Webhook Endpoint", False, f"Exception: {str(e)}")
            return False

    # BOOKKEEPING MANAGEMENT TESTS
    def test_create_bookkeeping_service(self):
        """Test creating a bookkeeping service"""
        if "tax_professional" not in self.tokens or "client" not in self.users:
            self.log_test("Create Bookkeeping Service", False, "Missing required tokens/users")
            return False
            
        from datetime import date, timedelta
        
        service_data = {
            "client_id": self.users["client"]["id"],
            "service_type": "monthly_bookkeeping",
            "frequency": "monthly",
            "service_name": "Monthly Bookkeeping Service",
            "description": "Complete monthly bookkeeping including reconciliation and reporting",
            "monthly_fee": 500.00,
            "hourly_rate": 75.00,
            "estimated_hours": 8,
            "start_date": date.today().isoformat(),
            "auto_invoice": True,
            "include_reports": True,
            "client_access_level": "view_only",
            "notes": "New client setup for monthly bookkeeping"
        }
        
        try:
            response = self.make_request("POST", "/bookkeeping/services", service_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["service_name"] == service_data["service_name"]:
                    self.bookkeeping_service_id = data["id"]
                    self.log_test("Create Bookkeeping Service", True, 
                                f"Service created with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Create Bookkeeping Service", False, f"Invalid service data: {data}")
                    return False
            else:
                self.log_test("Create Bookkeeping Service", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Bookkeeping Service", False, f"Exception: {str(e)}")
            return False

    def test_get_bookkeeping_services(self):
        """Test retrieving bookkeeping services"""
        if "tax_professional" not in self.tokens:
            self.log_test("Get Bookkeeping Services", False, "No tax professional token available")
            return False
            
        try:
            response = self.make_request("GET", "/bookkeeping/services", 
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Bookkeeping Services", True, 
                                f"Retrieved {len(data)} bookkeeping services")
                    return True
                else:
                    self.log_test("Get Bookkeeping Services", False, 
                                f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Get Bookkeeping Services", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Bookkeeping Services", False, f"Exception: {str(e)}")
            return False

    def test_get_specific_bookkeeping_service(self):
        """Test retrieving a specific bookkeeping service"""
        if "tax_professional" not in self.tokens:
            self.log_test("Get Specific Bookkeeping Service", False, "No tax professional token available")
            return False
            
        service_id = getattr(self, 'bookkeeping_service_id', None)
        if not service_id:
            self.log_test("Get Specific Bookkeeping Service", True, "No service ID available (test skipped)")
            return True
            
        try:
            response = self.make_request("GET", f"/bookkeeping/services/{service_id}",
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["id"] == service_id:
                    self.log_test("Get Specific Bookkeeping Service", True, 
                                f"Retrieved service: {data['service_name']}")
                    return True
                else:
                    self.log_test("Get Specific Bookkeeping Service", False, 
                                f"Service ID mismatch or invalid data: {data}")
                    return False
            else:
                self.log_test("Get Specific Bookkeeping Service", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Specific Bookkeeping Service", False, f"Exception: {str(e)}")
            return False

    def test_create_bookkeeping_task(self):
        """Test creating a bookkeeping task"""
        if "tax_professional" not in self.tokens:
            self.log_test("Create Bookkeeping Task", False, "No tax professional token available")
            return False
            
        service_id = getattr(self, 'bookkeeping_service_id', None)
        if not service_id:
            self.log_test("Create Bookkeeping Task", True, "No service ID available (test skipped)")
            return True
            
        from datetime import date, timedelta
        
        task_data = {
            "service_id": service_id,
            "task_name": "Monthly Bank Reconciliation",
            "description": "Reconcile all bank accounts for the month",
            "task_type": "bank_reconciliation",
            "priority": "high",
            "estimated_hours": 3.0,
            "due_date": (date.today() + timedelta(days=7)).isoformat(),
            "notes": "Include all business accounts"
        }
        
        try:
            response = self.make_request("POST", "/bookkeeping/tasks", task_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["task_name"] == task_data["task_name"]:
                    self.bookkeeping_task_id = data["id"]
                    self.log_test("Create Bookkeeping Task", True, 
                                f"Task created with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Create Bookkeeping Task", False, f"Invalid task data: {data}")
                    return False
            else:
                self.log_test("Create Bookkeeping Task", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Bookkeeping Task", False, f"Exception: {str(e)}")
            return False

    def test_get_bookkeeping_tasks(self):
        """Test retrieving bookkeeping tasks"""
        if "tax_professional" not in self.tokens:
            self.log_test("Get Bookkeeping Tasks", False, "No tax professional token available")
            return False
            
        try:
            response = self.make_request("GET", "/bookkeeping/tasks", 
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Bookkeeping Tasks", True, 
                                f"Retrieved {len(data)} bookkeeping tasks")
                    return True
                else:
                    self.log_test("Get Bookkeeping Tasks", False, 
                                f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Get Bookkeeping Tasks", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Bookkeeping Tasks", False, f"Exception: {str(e)}")
            return False

    def test_create_time_entry(self):
        """Test creating a time entry"""
        if "tax_professional" not in self.tokens or "client" not in self.users:
            self.log_test("Create Time Entry", False, "Missing required tokens/users")
            return False
            
        from datetime import date
        
        time_entry_data = {
            "client_id": self.users["client"]["id"],
            "date": date.today().isoformat(),
            "hours": 2.5,
            "description": "Bank reconciliation and expense categorization",
            "notes": "Completed monthly reconciliation for checking account",
            "billable": True,
            "hourly_rate": 75.00
        }
        
        # Add service_id if available
        service_id = getattr(self, 'bookkeeping_service_id', None)
        if service_id:
            time_entry_data["service_id"] = service_id
            
        try:
            response = self.make_request("POST", "/bookkeeping/time-entries", time_entry_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["hours"] == time_entry_data["hours"]:
                    self.time_entry_id = data["id"]
                    self.log_test("Create Time Entry", True, 
                                f"Time entry created with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Create Time Entry", False, f"Invalid time entry data: {data}")
                    return False
            else:
                self.log_test("Create Time Entry", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Time Entry", False, f"Exception: {str(e)}")
            return False

    def test_get_time_entries(self):
        """Test retrieving time entries"""
        if "tax_professional" not in self.tokens:
            self.log_test("Get Time Entries", False, "No tax professional token available")
            return False
            
        try:
            response = self.make_request("GET", "/bookkeeping/time-entries", 
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Time Entries", True, 
                                f"Retrieved {len(data)} time entries")
                    return True
                else:
                    self.log_test("Get Time Entries", False, 
                                f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Get Time Entries", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Time Entries", False, f"Exception: {str(e)}")
            return False

    def test_bookkeeping_dashboard(self):
        """Test bookkeeping dashboard analytics"""
        if "tax_professional" not in self.tokens:
            self.log_test("Bookkeeping Dashboard", False, "No tax professional token available")
            return False
            
        try:
            response = self.make_request("GET", "/bookkeeping/dashboard", 
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                required_keys = ["service_stats", "task_stats", "recent_time_entries", "total_hours_this_month"]
                missing_keys = [key for key in required_keys if key not in data]
                
                if not missing_keys:
                    service_stats = data["service_stats"]
                    task_stats = data["task_stats"]
                    self.log_test("Bookkeeping Dashboard", True, 
                                f"Dashboard data retrieved: {service_stats['total_services']} services, {task_stats['total_tasks']} tasks")
                    return True
                else:
                    self.log_test("Bookkeeping Dashboard", False, 
                                f"Missing required keys: {missing_keys}")
                    return False
            else:
                self.log_test("Bookkeeping Dashboard", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Bookkeeping Dashboard", False, f"Exception: {str(e)}")
            return False

    def test_bookkeeping_role_based_access(self):
        """Test role-based access control for bookkeeping endpoints"""
        if "client" not in self.tokens:
            self.log_test("Bookkeeping RBAC Test", False, "No client token available")
            return False
            
        # Test: Client trying to create bookkeeping service (should fail)
        service_data = {
            "client_id": self.users["client"]["id"],
            "service_type": "monthly_bookkeeping",
            "frequency": "monthly",
            "service_name": "Test Service",
            "start_date": "2024-01-01"
        }
        
        try:
            response = self.make_request("POST", "/bookkeeping/services", service_data,
                                       token=self.tokens["client"])
            if response.status_code == 403:
                self.log_test("Bookkeeping RBAC Test", True, 
                            "Client correctly denied access to create bookkeeping service")
                return True
            else:
                self.log_test("Bookkeeping RBAC Test", False, 
                            f"Expected 403, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Bookkeeping RBAC Test", False, f"Exception: {str(e)}")
            return False

    # SECURITY (2FA + reCAPTCHA) TESTS
    def test_2fa_setup(self):
        """Test 2FA setup with TOTP generation"""
        if "tax_professional" not in self.tokens:
            self.log_test("2FA Setup", False, "No tax professional token available")
            return False
            
        setup_data = {
            "app_name": "TaxPortal Pro Test"
        }
        
        try:
            response = self.make_request("POST", "/security/2fa/setup", setup_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                required_keys = ["secret", "qr_code", "provisioning_uri", "backup_codes"]
                missing_keys = [key for key in required_keys if key not in data]
                
                if not missing_keys:
                    # Store secret for verification test
                    self.totp_secret = data["secret"]
                    self.log_test("2FA Setup", True, 
                                f"2FA setup successful with secret and QR code generated")
                    return True
                else:
                    self.log_test("2FA Setup", False, f"Missing required keys: {missing_keys}")
                    return False
            else:
                self.log_test("2FA Setup", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("2FA Setup", False, f"Exception: {str(e)}")
            return False

    def test_2fa_verify_and_enable(self):
        """Test 2FA verification and enabling"""
        if "tax_professional" not in self.tokens:
            self.log_test("2FA Verify and Enable", False, "No tax professional token available")
            return False
            
        totp_secret = getattr(self, 'totp_secret', None)
        if not totp_secret:
            self.log_test("2FA Verify and Enable", True, "No TOTP secret available (test skipped)")
            return True
            
        try:
            import pyotp
            totp = pyotp.TOTP(totp_secret)
            current_token = totp.now()
            
            verify_data = {
                "token": current_token
            }
            
            response = self.make_request("POST", "/security/2fa/verify", verify_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "enabled successfully" in data["message"]:
                    self.log_test("2FA Verify and Enable", True, 
                                f"2FA verification successful: {data['message']}")
                    return True
                else:
                    self.log_test("2FA Verify and Enable", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("2FA Verify and Enable", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("2FA Verify and Enable", False, f"Exception: {str(e)}")
            return False

    def test_2fa_status_check(self):
        """Test checking 2FA status"""
        if "tax_professional" not in self.tokens:
            self.log_test("2FA Status Check", False, "No tax professional token available")
            return False
            
        try:
            response = self.make_request("GET", "/security/2fa/status", 
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "enabled" in data:
                    self.log_test("2FA Status Check", True, 
                                f"2FA status retrieved: enabled={data['enabled']}")
                    return True
                else:
                    self.log_test("2FA Status Check", False, f"Missing 'enabled' key: {data}")
                    return False
            else:
                self.log_test("2FA Status Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("2FA Status Check", False, f"Exception: {str(e)}")
            return False

    def test_2fa_disable(self):
        """Test disabling 2FA"""
        if "tax_professional" not in self.tokens:
            self.log_test("2FA Disable", False, "No tax professional token available")
            return False
            
        try:
            response = self.make_request("POST", "/security/2fa/disable", 
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "disabled" in data["message"]:
                    self.log_test("2FA Disable", True, f"2FA disabled: {data['message']}")
                    return True
                else:
                    self.log_test("2FA Disable", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("2FA Disable", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("2FA Disable", False, f"Exception: {str(e)}")
            return False

    def test_recaptcha_verify_endpoint(self):
        """Test reCAPTCHA verification endpoint"""
        # This test checks the endpoint structure, not actual reCAPTCHA verification
        recaptcha_data = {
            "token": "test_token_for_structure_check",
            "action": "login"
        }
        
        try:
            response = self.make_request("POST", "/security/recaptcha/verify", recaptcha_data)
            if response.status_code == 503:
                if "not configured" in response.text:
                    self.log_test("reCAPTCHA Verify Endpoint", True, 
                                "reCAPTCHA endpoint correctly reports not configured")
                    return True
                else:
                    self.log_test("reCAPTCHA Verify Endpoint", False, 
                                f"Unexpected error message: {response.text}")
                    return False
            elif response.status_code == 200:
                # If configured, check response structure
                data = response.json()
                required_keys = ["success", "score", "action"]
                if all(key in data for key in required_keys):
                    self.log_test("reCAPTCHA Verify Endpoint", True, 
                                "reCAPTCHA endpoint working with proper response structure")
                    return True
                else:
                    self.log_test("reCAPTCHA Verify Endpoint", False, 
                                f"Missing required keys in response: {data}")
                    return False
            else:
                self.log_test("reCAPTCHA Verify Endpoint", False, 
                            f"Unexpected status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("reCAPTCHA Verify Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_security_authentication_required(self):
        """Test that security endpoints require authentication"""
        test_cases = [
            ("/security/2fa/setup", "POST"),
            ("/security/2fa/verify", "POST"),
            ("/security/2fa/status", "GET"),
            ("/security/2fa/disable", "POST")
        ]
        
        success_count = 0
        for endpoint, method in test_cases:
            try:
                test_data = {"app_name": "Test"} if "setup" in endpoint else {"token": "test"}
                response = self.make_request(method, endpoint, test_data)  # No token
                if response.status_code in [401, 403]:
                    self.log_test(f"Security Auth Required - {endpoint}", True, 
                                f"Correctly requires authentication (HTTP {response.status_code})")
                    success_count += 1
                else:
                    self.log_test(f"Security Auth Required - {endpoint}", False, 
                                f"Expected 401/403, got {response.status_code}")
            except Exception as e:
                self.log_test(f"Security Auth Required - {endpoint}", False, f"Exception: {str(e)}")
                
        return success_count == len(test_cases)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting TaxPortal Pro API Backend Tests")
        print("=" * 60)
        
        test_methods = [
            self.test_health_check,
            self.test_user_registration,
            self.test_user_login,
            self.test_get_current_user,
            self.test_authentication_required,
            self.test_invalid_token,
            self.test_create_client_relationship,
            self.test_get_clients,
            self.test_role_based_access_control,
            self.test_document_upload,
            self.test_create_task,
            self.test_send_message,
            self.test_create_invoice,
            # Email Integration Tests
            self.test_send_client_invitation_email,
            self.test_send_test_email,
            self.test_send_notification_email,
            self.test_get_sent_invitations,
            self.test_email_authentication_required,
            self.test_email_role_based_access,
            self.test_email_validation,
            self.test_resend_invitation_nonexistent,
            self.test_resend_existing_invitation,
            # Payment Integration Tests
            self.test_get_service_packages,
            self.test_create_service_payment_checkout,
            self.test_create_invoice_payment_checkout,
            self.test_get_payment_status,
            self.test_get_user_payment_transactions,
            self.test_payment_authentication_required,
            self.test_invalid_service_package,
            self.test_payment_status_access_control,
            self.test_stripe_webhook_endpoint,
            self.test_logout
        ]
        
        passed = 0
        total = len(test_methods)
        
        for test_method in test_methods:
            try:
                if test_method():
                    passed += 1
            except Exception as e:
                print(f"❌ FAIL: {test_method.__name__} - Unexpected error: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! TaxPortal Pro API is working correctly.")
        else:
            print(f"⚠️  {total - passed} tests failed. Check the logs above for details.")
            
        return passed == total

def main():
    """Main test execution"""
    tester = TaxPortalAPITester()
    success = tester.run_all_tests()
    
    # Print detailed results
    print("\n" + "=" * 60)
    print("📋 DETAILED TEST RESULTS:")
    print("=" * 60)
    
    for result in tester.test_results:
        status = "✅" if result["success"] else "❌"
        print(f"{status} {result['test']}: {result['message']}")
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())