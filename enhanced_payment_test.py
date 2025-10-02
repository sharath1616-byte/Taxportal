#!/usr/bin/env python3
"""
Enhanced Payment System Testing for TaxPortal Pro
Comprehensive testing of invoice payments, service payments, and payment gateway integration
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any

# Configuration
BASE_URL = "https://accountease-3.preview.emergentagent.com/api"

class EnhancedPaymentTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.tokens = {}
        self.users = {}
        self.test_results = []
        self.test_invoice_id = None
        self.payment_sessions = {}
        
    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, token: str = None) -> requests.Response:
        """Make HTTP request with optional authentication"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers)
            elif method.upper() == "POST":
                response = self.session.post(url, headers=headers, json=data)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            raise

    def setup_test_users(self):
        """Setup test users for payment testing"""
        import time
        timestamp = str(int(time.time()))
        
        # Create tax professional
        tax_pro_data = {
            "role": "tax_professional",
            "email": f"taxpro_payment_{timestamp}@testdomain.com",
            "password": "SecurePass123!",
            "profile": {
                "firstName": "Sarah",
                "lastName": "TaxProfessional",
                "phone": "(555) 123-4567",
                "company": "Elite Tax Services"
            }
        }
        
        # Create client
        client_data = {
            "role": "client", 
            "email": f"client_payment_{timestamp}@testdomain.com",
            "password": "ClientPass123!",
            "profile": {
                "firstName": "Michael",
                "lastName": "Johnson",
                "phone": "(555) 987-6543"
            }
        }
        
        users_to_create = [
            ("tax_professional", tax_pro_data),
            ("client", client_data)
        ]
        
        success_count = 0
        for role, user_data in users_to_create:
            try:
                response = self.make_request("POST", "/auth/register", user_data)
                if response.status_code == 200:
                    data = response.json()
                    self.tokens[role] = data["access_token"]
                    self.users[role] = data["user"]
                    self.log_test(f"Setup {role}", True, f"User created: {data['user']['email']}")
                    success_count += 1
                else:
                    self.log_test(f"Setup {role}", False, f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Setup {role}", False, f"Exception: {str(e)}")
                
        return success_count == len(users_to_create)

    def test_service_packages_availability(self):
        """Test 1: Verify all service packages are available"""
        try:
            response = self.make_request("GET", "/payments/services/packages")
            if response.status_code == 200:
                data = response.json()
                packages = data.get("packages", {})
                
                expected_packages = {
                    "tax_basic": 299.00,
                    "tax_premium": 599.00,
                    "bookkeeping_monthly": 150.00,
                    "bookkeeping_quarterly": 400.00,
                    "consultation": 125.00
                }
                
                all_packages_found = True
                for pkg_name, expected_price in expected_packages.items():
                    if pkg_name not in packages:
                        self.log_test("Service Packages Availability", False, f"Missing package: {pkg_name}")
                        return False
                    
                    if packages[pkg_name]["price"] != expected_price:
                        self.log_test("Service Packages Availability", False, 
                                    f"Wrong price for {pkg_name}: expected {expected_price}, got {packages[pkg_name]['price']}")
                        return False
                
                self.log_test("Service Packages Availability", True, 
                            f"All {len(expected_packages)} service packages available with correct pricing")
                return True
            else:
                self.log_test("Service Packages Availability", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Service Packages Availability", False, f"Exception: {str(e)}")
            return False

    def test_platform_subscription_payment(self):
        """Test 2: Create platform subscription payment (tax_premium service)"""
        if "tax_professional" not in self.tokens:
            self.log_test("Platform Subscription Payment", False, "No tax professional token")
            return False
            
        payment_data = {
            "service_package": "tax_premium",
            "origin_url": "https://accountease-3.preview.emergentagent.com",
            "metadata": {
                "subscription_type": "platform",
                "billing_cycle": "annual",
                "client_name": "Elite Tax Services"
            }
        }
        
        try:
            response = self.make_request("POST", "/payments/service/checkout", payment_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("checkout_url") and data.get("session_id"):
                    self.payment_sessions["platform_subscription"] = data["session_id"]
                    self.log_test("Platform Subscription Payment", True, 
                                f"Platform subscription checkout created: {data['session_id']}")
                    return True
                else:
                    self.log_test("Platform Subscription Payment", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Platform Subscription Payment", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Platform Subscription Payment", False, f"Exception: {str(e)}")
            return False

    def test_client_service_payment(self):
        """Test 3: Create client service payment (bookkeeping service)"""
        if "client" not in self.tokens:
            self.log_test("Client Service Payment", False, "No client token")
            return False
            
        payment_data = {
            "service_package": "bookkeeping_monthly",
            "origin_url": "https://accountease-3.preview.emergentagent.com",
            "metadata": {
                "service_type": "client_service",
                "business_name": "Johnson Consulting LLC",
                "start_month": "November 2024"
            }
        }
        
        try:
            response = self.make_request("POST", "/payments/service/checkout", payment_data,
                                       token=self.tokens["client"])
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("checkout_url") and data.get("session_id"):
                    self.payment_sessions["client_service"] = data["session_id"]
                    self.log_test("Client Service Payment", True, 
                                f"Client service checkout created: {data['session_id']}")
                    return True
                else:
                    self.log_test("Client Service Payment", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Client Service Payment", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Client Service Payment", False, f"Exception: {str(e)}")
            return False

    def create_test_invoice(self):
        """Create a test invoice for payment testing"""
        if "tax_professional" not in self.tokens:
            return False
            
        # First create a client relationship
        client_data = {
            "userId": self.users["client"]["id"],
            "taxProfessionalId": self.users["tax_professional"]["id"],
            "taxYear": 2024,
            "estimatedCompletion": (datetime.now() + timedelta(days=30)).isoformat(),
            "notes": "Payment testing client"
        }
        
        try:
            client_response = self.make_request("POST", "/clients/", client_data,
                                              token=self.tokens["tax_professional"])
            if client_response.status_code != 200:
                return False
                
            client_relationship = client_response.json()
            
            # Create invoice
            invoice_data = {
                "clientId": client_relationship["id"],
                "items": [
                    {
                        "description": "Individual Tax Return Preparation - 2024",
                        "quantity": 1,
                        "rate": 350.00,
                        "amount": 350.00
                    },
                    {
                        "description": "State Tax Return Filing",
                        "quantity": 1,
                        "rate": 85.00,
                        "amount": 85.00
                    }
                ],
                "dueDate": (datetime.now() + timedelta(days=30)).isoformat(),
                "taxAmount": 34.80,
                "notes": "Payment due within 30 days. Thank you for your business!"
            }
            
            invoice_response = self.make_request("POST", "/invoices/", invoice_data,
                                               token=self.tokens["tax_professional"])
            if invoice_response.status_code == 200:
                invoice = invoice_response.json()
                self.test_invoice_id = invoice["id"]
                return True
            return False
        except Exception:
            return False

    def test_invoice_payment_creation(self):
        """Test 4: Create invoice payment checkout session"""
        if not self.create_test_invoice():
            self.log_test("Invoice Payment Creation", False, "Failed to create test invoice")
            return False
            
        if "tax_professional" not in self.tokens:
            self.log_test("Invoice Payment Creation", False, "No tax professional token")
            return False
            
        payment_data = {
            "invoice_id": self.test_invoice_id,
            "origin_url": "https://accountease-3.preview.emergentagent.com"
        }
        
        try:
            response = self.make_request("POST", "/payments/invoice/checkout", payment_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("checkout_url") and data.get("session_id"):
                    self.payment_sessions["invoice_payment"] = data["session_id"]
                    self.log_test("Invoice Payment Creation", True, 
                                f"Invoice payment checkout created: {data['session_id']}")
                    return True
                else:
                    self.log_test("Invoice Payment Creation", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Invoice Payment Creation", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Invoice Payment Creation", False, f"Exception: {str(e)}")
            return False

    def test_client_invoice_payment_access(self):
        """Test 5: Verify client can access invoice payment"""
        if not self.test_invoice_id or "client" not in self.tokens:
            self.log_test("Client Invoice Payment Access", False, "Missing invoice or client token")
            return False
            
        payment_data = {
            "invoice_id": self.test_invoice_id,
            "origin_url": "https://accountease-3.preview.emergentagent.com"
        }
        
        try:
            response = self.make_request("POST", "/payments/invoice/checkout", payment_data,
                                       token=self.tokens["client"])
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("checkout_url"):
                    self.log_test("Client Invoice Payment Access", True, 
                                "Client can successfully create invoice payment checkout")
                    return True
                else:
                    self.log_test("Client Invoice Payment Access", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Client Invoice Payment Access", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Client Invoice Payment Access", False, f"Exception: {str(e)}")
            return False

    def test_payment_status_tracking(self):
        """Test 6: Verify payment status tracking for all payment types"""
        success_count = 0
        total_tests = 0
        
        for payment_type, session_id in self.payment_sessions.items():
            total_tests += 1
            # Determine which token to use based on payment type
            if payment_type == "client_service":
                token = self.tokens.get("client")
            else:
                token = self.tokens.get("tax_professional")
                
            if not token:
                continue
                
            try:
                response = self.make_request("GET", f"/payments/status/{session_id}", token=token)
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ["session_id", "status", "payment_status", "amount_total", "currency"]
                    if all(field in data for field in required_fields):
                        self.log_test(f"Payment Status - {payment_type}", True, 
                                    f"Status: {data['payment_status']} ({data['status']})")
                        success_count += 1
                    else:
                        self.log_test(f"Payment Status - {payment_type}", False, "Missing required fields")
                else:
                    self.log_test(f"Payment Status - {payment_type}", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Payment Status - {payment_type}", False, f"Exception: {str(e)}")
        
        overall_success = success_count == total_tests and total_tests > 0
        if overall_success:
            self.log_test("Payment Status Tracking", True, f"All {success_count} payment statuses tracked correctly")
        else:
            self.log_test("Payment Status Tracking", False, f"Only {success_count}/{total_tests} statuses tracked")
        return overall_success

    def test_payment_transaction_history(self):
        """Test 7: Verify payment transaction history retrieval"""
        test_cases = [
            ("tax_professional", "Tax Professional Transactions"),
            ("client", "Client Transactions")
        ]
        
        success_count = 0
        for role, test_name in test_cases:
            if role not in self.tokens:
                continue
                
            try:
                response = self.make_request("GET", "/payments/transactions", token=self.tokens[role])
                if response.status_code == 200:
                    data = response.json()
                    if "transactions" in data and "total" in data:
                        transactions = data["transactions"]
                        total = data["total"]
                        
                        # Verify transaction structure
                        if total > 0 and len(transactions) > 0:
                            transaction = transactions[0]
                            required_fields = ["id", "session_id", "user_id", "amount", "currency", "payment_status"]
                            if all(field in transaction for field in required_fields):
                                self.log_test(f"Transaction History - {test_name}", True, 
                                            f"Retrieved {total} transactions with correct structure")
                                success_count += 1
                            else:
                                self.log_test(f"Transaction History - {test_name}", False, 
                                            "Transaction missing required fields")
                        else:
                            self.log_test(f"Transaction History - {test_name}", True, 
                                        f"Retrieved {total} transactions (empty history is valid)")
                            success_count += 1
                    else:
                        self.log_test(f"Transaction History - {test_name}", False, 
                                    "Missing transactions or total in response")
                else:
                    self.log_test(f"Transaction History - {test_name}", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Transaction History - {test_name}", False, f"Exception: {str(e)}")
        
        return success_count == len(test_cases)

    def test_stripe_integration_webhook(self):
        """Test 8: Verify Stripe webhook endpoint is properly configured"""
        try:
            # Test webhook endpoint without signature (should fail with proper error)
            response = self.make_request("POST", "/payments/webhook/stripe", {"test": "data"})
            if response.status_code == 400:
                if "Missing Stripe signature" in response.text:
                    self.log_test("Stripe Webhook Integration", True, 
                                "Webhook endpoint properly configured and requires Stripe signature")
                    return True
                else:
                    self.log_test("Stripe Webhook Integration", False, 
                                f"Unexpected error message: {response.text}")
                    return False
            else:
                self.log_test("Stripe Webhook Integration", False, 
                            f"Expected 400, got {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Stripe Webhook Integration", False, f"Exception: {str(e)}")
            return False

    def test_payment_metadata_handling(self):
        """Test 9: Verify payment metadata is properly handled"""
        if "tax_professional" not in self.tokens:
            self.log_test("Payment Metadata Handling", False, "No tax professional token")
            return False
            
        # Test with complex metadata
        payment_data = {
            "service_package": "consultation",
            "origin_url": "https://accountease-3.preview.emergentagent.com",
            "metadata": {
                "consultation_type": "tax_planning",
                "client_business_type": "LLC",
                "estimated_duration": "60_minutes",
                "special_requirements": "Multi-state tax issues",
                "preferred_date": "2024-11-15",
                "contact_method": "video_call"
            }
        }
        
        try:
            response = self.make_request("POST", "/payments/service/checkout", payment_data,
                                       token=self.tokens["tax_professional"])
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("session_id"):
                    # Verify metadata is stored by checking payment status
                    status_response = self.make_request("GET", f"/payments/status/{data['session_id']}", 
                                                      token=self.tokens["tax_professional"])
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        if "metadata" in status_data and len(status_data["metadata"]) > 0:
                            self.log_test("Payment Metadata Handling", True, 
                                        f"Metadata properly stored and retrieved: {len(status_data['metadata'])} fields")
                            return True
                        else:
                            self.log_test("Payment Metadata Handling", False, "Metadata not found in payment status")
                            return False
                    else:
                        self.log_test("Payment Metadata Handling", False, "Could not retrieve payment status")
                        return False
                else:
                    self.log_test("Payment Metadata Handling", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Payment Metadata Handling", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Payment Metadata Handling", False, f"Exception: {str(e)}")
            return False

    def test_role_based_payment_restrictions(self):
        """Test 10: Verify role-based payment access restrictions"""
        if "client" not in self.tokens or "tax_professional" not in self.tokens:
            self.log_test("Role-Based Payment Restrictions", False, "Missing required tokens")
            return False
            
        # Test: Client trying to access tax professional's payment session
        if "platform_subscription" in self.payment_sessions:
            session_id = self.payment_sessions["platform_subscription"]
            
            try:
                response = self.make_request("GET", f"/payments/status/{session_id}", 
                                           token=self.tokens["client"])
                if response.status_code in [403, 404]:  # Both are valid - access denied or not found
                    self.log_test("Role-Based Payment Restrictions", True, 
                                f"Client correctly denied access to tax professional's payment (HTTP {response.status_code})")
                    return True
                else:
                    self.log_test("Role-Based Payment Restrictions", False, 
                                f"Expected 403 or 404, got {response.status_code}")
                    return False
            except Exception as e:
                self.log_test("Role-Based Payment Restrictions", False, f"Exception: {str(e)}")
                return False
        else:
            self.log_test("Role-Based Payment Restrictions", True, "No payment session to test (skipped)")
            return True

    def run_enhanced_payment_tests(self):
        """Run all enhanced payment system tests"""
        print("🚀 Starting Enhanced Payment System Tests for TaxPortal Pro")
        print("=" * 70)
        
        # Setup phase
        if not self.setup_test_users():
            print("❌ Failed to setup test users. Aborting tests.")
            return False
        
        test_methods = [
            self.test_service_packages_availability,
            self.test_platform_subscription_payment,
            self.test_client_service_payment,
            self.test_invoice_payment_creation,
            self.test_client_invoice_payment_access,
            self.test_payment_status_tracking,
            self.test_payment_transaction_history,
            self.test_stripe_integration_webhook,
            self.test_payment_metadata_handling,
            self.test_role_based_payment_restrictions
        ]
        
        passed = 0
        total = len(test_methods)
        
        for test_method in test_methods:
            try:
                if test_method():
                    passed += 1
            except Exception as e:
                print(f"❌ FAIL: {test_method.__name__} - Unexpected error: {str(e)}")
        
        print("\n" + "=" * 70)
        print(f"📊 Enhanced Payment Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All enhanced payment tests passed! Payment system is fully functional.")
        else:
            print(f"⚠️  {total - passed} tests failed. Check the logs above for details.")
            
        return passed == total

def main():
    """Main test execution"""
    tester = EnhancedPaymentTester()
    success = tester.run_enhanced_payment_tests()
    
    # Print summary
    print("\n" + "=" * 70)
    print("📋 ENHANCED PAYMENT SYSTEM TEST SUMMARY:")
    print("=" * 70)
    
    for result in tester.test_results:
        status = "✅" if result["success"] else "❌"
        print(f"{status} {result['test']}: {result['message']}")
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())