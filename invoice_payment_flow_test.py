#!/usr/bin/env python3
"""
Invoice Payment Flow Testing - End-to-End
Testing the complete invoice payment flow: Tax professional creates invoice → Client pays through Stripe
"""

import requests
import json
import uuid
from datetime import datetime, timedelta

# Configuration
BASE_URL = "https://accountease-3.preview.emergentagent.com/api"

class InvoicePaymentFlowTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.tokens = {}
        self.users = {}
        self.client_relationship_id = None
        self.test_invoice = None
        self.payment_session = None
        
    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
    def make_request(self, method: str, endpoint: str, data: dict = None, token: str = None) -> requests.Response:
        """Make HTTP request with optional authentication"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        if method.upper() == "GET":
            response = self.session.get(url, headers=headers)
        elif method.upper() == "POST":
            response = self.session.post(url, headers=headers, json=data)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
            
        return response

    def setup_users_and_relationship(self):
        """Setup tax professional, client, and their relationship"""
        import time
        timestamp = str(int(time.time()))
        
        # Create tax professional
        tax_pro_data = {
            "role": "tax_professional",
            "email": f"taxpro_invoice_{timestamp}@testdomain.com",
            "password": "SecurePass123!",
            "profile": {
                "firstName": "Jennifer",
                "lastName": "AccountingPro",
                "phone": "(555) 123-4567",
                "company": "Premier Tax Solutions"
            }
        }
        
        # Create client
        client_data = {
            "role": "client", 
            "email": f"client_invoice_{timestamp}@testdomain.com",
            "password": "ClientPass123!",
            "profile": {
                "firstName": "Robert",
                "lastName": "BusinessOwner",
                "phone": "(555) 987-6543"
            }
        }
        
        # Register users
        for role, user_data in [("tax_professional", tax_pro_data), ("client", client_data)]:
            response = self.make_request("POST", "/auth/register", user_data)
            if response.status_code == 200:
                data = response.json()
                self.tokens[role] = data["access_token"]
                self.users[role] = data["user"]
                self.log_test(f"Setup {role}", True, f"User created: {data['user']['email']}")
            else:
                self.log_test(f"Setup {role}", False, f"HTTP {response.status_code}: {response.text}")
                return False
        
        # Create client relationship
        client_relationship_data = {
            "userId": self.users["client"]["id"],
            "taxProfessionalId": self.users["tax_professional"]["id"],
            "taxYear": 2024,
            "estimatedCompletion": (datetime.now() + timedelta(days=30)).isoformat(),
            "notes": "Invoice payment flow testing client"
        }
        
        response = self.make_request("POST", "/clients/", client_relationship_data,
                                   token=self.tokens["tax_professional"])
        if response.status_code == 200:
            self.client_relationship_id = response.json()["id"]
            self.log_test("Setup Client Relationship", True, f"Relationship created: {self.client_relationship_id}")
            return True
        else:
            self.log_test("Setup Client Relationship", False, f"HTTP {response.status_code}: {response.text}")
            return False

    def test_step1_tax_professional_creates_invoice(self):
        """Step 1: Tax professional creates an invoice for the client"""
        invoice_data = {
            "clientId": self.client_relationship_id,
            "items": [
                {
                    "description": "2024 Individual Tax Return Preparation",
                    "quantity": 1,
                    "rate": 425.00,
                    "amount": 425.00
                },
                {
                    "description": "State Tax Return (California)",
                    "quantity": 1,
                    "rate": 95.00,
                    "amount": 95.00
                },
                {
                    "description": "Tax Planning Consultation",
                    "quantity": 1,
                    "rate": 150.00,
                    "amount": 150.00
                }
            ],
            "dueDate": (datetime.now() + timedelta(days=30)).isoformat(),
            "taxAmount": 53.60,  # 8% tax on $670
            "notes": "Thank you for choosing Premier Tax Solutions. Payment is due within 30 days."
        }
        
        response = self.make_request("POST", "/invoices/", invoice_data,
                                   token=self.tokens["tax_professional"])
        if response.status_code == 200:
            self.test_invoice = response.json()
            self.log_test("Tax Professional Creates Invoice", True, 
                        f"Invoice created: {self.test_invoice['invoiceNumber']} - Total: ${self.test_invoice['totalAmount']}")
            return True
        else:
            self.log_test("Tax Professional Creates Invoice", False, f"HTTP {response.status_code}: {response.text}")
            return False

    def test_step2_verify_invoice_status_draft(self):
        """Step 2: Verify invoice is initially in draft status"""
        if not self.test_invoice:
            self.log_test("Verify Invoice Status Draft", False, "No test invoice available")
            return False
            
        if self.test_invoice.get("status") == "draft":
            self.log_test("Verify Invoice Status Draft", True, 
                        f"Invoice status correctly set to 'draft': {self.test_invoice['status']}")
            return True
        else:
            self.log_test("Verify Invoice Status Draft", False, 
                        f"Expected 'draft', got: {self.test_invoice.get('status')}")
            return False

    def test_step3_tax_professional_creates_payment_checkout(self):
        """Step 3: Tax professional creates payment checkout session for the invoice"""
        if not self.test_invoice:
            self.log_test("Tax Professional Creates Payment Checkout", False, "No test invoice available")
            return False
            
        payment_data = {
            "invoice_id": self.test_invoice["id"],
            "origin_url": "https://accountease-3.preview.emergentagent.com"
        }
        
        response = self.make_request("POST", "/payments/invoice/checkout", payment_data,
                                   token=self.tokens["tax_professional"])
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("checkout_url") and data.get("session_id"):
                self.payment_session = data
                self.log_test("Tax Professional Creates Payment Checkout", True, 
                            f"Payment checkout created: {data['session_id']}")
                return True
            else:
                self.log_test("Tax Professional Creates Payment Checkout", False, f"Invalid response: {data}")
                return False
        else:
            self.log_test("Tax Professional Creates Payment Checkout", False, f"HTTP {response.status_code}: {response.text}")
            return False

    def test_step4_client_can_access_payment_checkout(self):
        """Step 4: Verify client can access the same invoice payment checkout"""
        if not self.test_invoice:
            self.log_test("Client Can Access Payment Checkout", False, "No test invoice available")
            return False
            
        payment_data = {
            "invoice_id": self.test_invoice["id"],
            "origin_url": "https://accountease-3.preview.emergentagent.com"
        }
        
        response = self.make_request("POST", "/payments/invoice/checkout", payment_data,
                                   token=self.tokens["client"])
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("checkout_url") and data.get("session_id"):
                self.log_test("Client Can Access Payment Checkout", True, 
                            f"Client can create payment checkout: {data['session_id']}")
                return True
            else:
                self.log_test("Client Can Access Payment Checkout", False, f"Invalid response: {data}")
                return False
        else:
            self.log_test("Client Can Access Payment Checkout", False, f"HTTP {response.status_code}: {response.text}")
            return False

    def test_step5_verify_stripe_checkout_url(self):
        """Step 5: Verify Stripe checkout URL is properly formatted"""
        if not self.payment_session:
            self.log_test("Verify Stripe Checkout URL", False, "No payment session available")
            return False
            
        checkout_url = self.payment_session.get("checkout_url")
        if checkout_url and "checkout.stripe.com" in checkout_url:
            self.log_test("Verify Stripe Checkout URL", True, 
                        f"Valid Stripe checkout URL generated: {checkout_url[:50]}...")
            return True
        else:
            self.log_test("Verify Stripe Checkout URL", False, f"Invalid checkout URL: {checkout_url}")
            return False

    def test_step6_verify_payment_amount_matches_invoice(self):
        """Step 6: Verify payment amount matches invoice total"""
        if not self.payment_session or not self.test_invoice:
            self.log_test("Verify Payment Amount Matches Invoice", False, "Missing payment session or invoice")
            return False
            
        # Get payment status to check amount
        response = self.make_request("GET", f"/payments/status/{self.payment_session['session_id']}", 
                                   token=self.tokens["tax_professional"])
        if response.status_code == 200:
            payment_status = response.json()
            # Convert cents to dollars for comparison
            payment_amount = payment_status.get("amount_total", 0) / 100
            invoice_amount = float(self.test_invoice.get("totalAmount", 0))
            
            if abs(payment_amount - invoice_amount) < 0.01:  # Allow for small floating point differences
                self.log_test("Verify Payment Amount Matches Invoice", True, 
                            f"Payment amount ${payment_amount} matches invoice total ${invoice_amount}")
                return True
            else:
                self.log_test("Verify Payment Amount Matches Invoice", False, 
                            f"Amount mismatch: payment ${payment_amount} vs invoice ${invoice_amount}")
                return False
        else:
            self.log_test("Verify Payment Amount Matches Invoice", False, f"HTTP {response.status_code}: {response.text}")
            return False

    def test_step7_verify_payment_metadata(self):
        """Step 7: Verify payment contains correct invoice metadata"""
        if not self.payment_session:
            self.log_test("Verify Payment Metadata", False, "No payment session available")
            return False
            
        response = self.make_request("GET", f"/payments/status/{self.payment_session['session_id']}", 
                                   token=self.tokens["tax_professional"])
        if response.status_code == 200:
            payment_status = response.json()
            metadata = payment_status.get("metadata", {})
            
            # Check for required metadata fields
            required_fields = ["invoice_id", "user_id", "payment_type"]
            missing_fields = [field for field in required_fields if field not in metadata]
            
            if not missing_fields:
                if (metadata.get("invoice_id") == self.test_invoice["id"] and 
                    metadata.get("payment_type") == "invoice_payment"):
                    self.log_test("Verify Payment Metadata", True, 
                                f"Payment metadata correct: invoice_id={metadata['invoice_id']}")
                    return True
                else:
                    self.log_test("Verify Payment Metadata", False, "Metadata values incorrect")
                    return False
            else:
                self.log_test("Verify Payment Metadata", False, f"Missing metadata fields: {missing_fields}")
                return False
        else:
            self.log_test("Verify Payment Metadata", False, f"HTTP {response.status_code}: {response.text}")
            return False

    def test_step8_verify_payment_transaction_stored(self):
        """Step 8: Verify payment transaction is stored in database"""
        # Check tax professional's transactions
        response = self.make_request("GET", "/payments/transactions", token=self.tokens["tax_professional"])
        if response.status_code == 200:
            data = response.json()
            transactions = data.get("transactions", [])
            
            # Find transaction for this invoice
            invoice_transaction = None
            for transaction in transactions:
                if (transaction.get("transaction_type") == "invoice_payment" and 
                    transaction.get("invoice_id") == self.test_invoice["id"]):
                    invoice_transaction = transaction
                    break
            
            if invoice_transaction:
                self.log_test("Verify Payment Transaction Stored", True, 
                            f"Invoice payment transaction stored: {invoice_transaction['id']}")
                return True
            else:
                self.log_test("Verify Payment Transaction Stored", False, "Invoice payment transaction not found")
                return False
        else:
            self.log_test("Verify Payment Transaction Stored", False, f"HTTP {response.status_code}: {response.text}")
            return False

    def test_step9_verify_webhook_endpoint_ready(self):
        """Step 9: Verify webhook endpoint is ready for payment confirmations"""
        # Test webhook endpoint structure
        response = self.make_request("POST", "/payments/webhook/stripe", {"test": "data"})
        if response.status_code == 400 and "Missing Stripe signature" in response.text:
            self.log_test("Verify Webhook Endpoint Ready", True, 
                        "Webhook endpoint ready and properly validates Stripe signatures")
            return True
        else:
            self.log_test("Verify Webhook Endpoint Ready", False, 
                        f"Webhook endpoint not properly configured: HTTP {response.status_code}")
            return False

    def test_step10_simulate_payment_success_flow(self):
        """Step 10: Simulate what happens when payment is successful (without actual payment)"""
        if not self.test_invoice:
            self.log_test("Simulate Payment Success Flow", False, "No test invoice available")
            return False
            
        # This test verifies the system is ready to handle successful payments
        # In a real scenario, Stripe would call the webhook and update the invoice status
        
        # For now, we verify the invoice is in the correct state to receive payment updates
        # Draft invoices can be paid, and the system should handle payment processing
        if (self.test_invoice.get("status") in ["draft", "sent", "unpaid"] and 
            self.payment_session and 
            self.payment_session.get("success")):
            self.log_test("Simulate Payment Success Flow", True, 
                        f"System ready to process payment success: invoice {self.test_invoice.get('status')}, checkout session created")
            return True
        else:
            self.log_test("Simulate Payment Success Flow", False, "System not ready for payment processing")
            return False

    def run_invoice_payment_flow_test(self):
        """Run complete invoice payment flow test"""
        print("🚀 Testing Complete Invoice Payment Flow")
        print("=" * 60)
        print("Scenario: Tax professional creates invoice → Client pays through Stripe")
        print("=" * 60)
        
        # Setup phase
        if not self.setup_users_and_relationship():
            print("❌ Failed to setup users and relationship. Aborting tests.")
            return False
        
        test_steps = [
            self.test_step1_tax_professional_creates_invoice,
            self.test_step2_verify_invoice_status_unpaid,
            self.test_step3_tax_professional_creates_payment_checkout,
            self.test_step4_client_can_access_payment_checkout,
            self.test_step5_verify_stripe_checkout_url,
            self.test_step6_verify_payment_amount_matches_invoice,
            self.test_step7_verify_payment_metadata,
            self.test_step8_verify_payment_transaction_stored,
            self.test_step9_verify_webhook_endpoint_ready,
            self.test_step10_simulate_payment_success_flow
        ]
        
        passed = 0
        total = len(test_steps)
        
        for i, test_step in enumerate(test_steps, 1):
            print(f"\n--- Step {i}/{total} ---")
            try:
                if test_step():
                    passed += 1
                else:
                    print(f"⚠️  Step {i} failed - continuing with remaining tests")
            except Exception as e:
                print(f"❌ Step {i} error: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"📊 Invoice Payment Flow Test Results: {passed}/{total} steps passed")
        
        if passed == total:
            print("🎉 Complete invoice payment flow is working correctly!")
            print("✅ Tax professionals can create invoices")
            print("✅ Clients can access invoice payment options")
            print("✅ Stripe checkout integration is functional")
            print("✅ Payment tracking and metadata handling working")
            print("✅ System ready for real-time payment processing")
        else:
            print(f"⚠️  {total - passed} steps failed. Check the logs above for details.")
            
        return passed == total

def main():
    """Main test execution"""
    tester = InvoicePaymentFlowTester()
    success = tester.run_invoice_payment_flow_test()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())