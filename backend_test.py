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
BASE_URL = "https://acctax-portal.preview.emergentagent.com/api"
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
        test_users = [
            {
                "role": "tax_professional",
                "email": "taxpro@example.com",
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
                "email": "client@example.com",
                "password": "ClientPass123!",
                "profile": {
                    "firstName": "Jane",
                    "lastName": "Doe",
                    "phone": "+1987654321"
                }
            },
            {
                "role": "admin",
                "email": "admin@example.com", 
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
                else:
                    self.log_test(f"Register {user_data['role']}", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Register {user_data['role']}", False, f"Exception: {str(e)}")
                
        return success_count == len(test_users)

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": "taxpro@example.com",
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
            if response.status_code == 401:
                self.log_test("Auth Required Test", True, "Correctly requires authentication")
                return True
            else:
                self.log_test("Auth Required Test", False, 
                            f"Expected 401, got {response.status_code}")
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