#!/usr/bin/env python3
"""
TaxPortal Pro Authentication Diagnostic Test
Focused testing to identify specific authentication issues causing 400/401 errors
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
BASE_URL = "https://accountease-3.preview.emergentagent.com/api"

class AuthDiagnosticTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
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
        
    def make_request(self, method: str, endpoint: str, data: Dict = None) -> requests.Response:
        """Make HTTP request"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        try:
            if method.upper() == "POST":
                response = self.session.post(url, headers=headers, json=data)
            elif method.upper() == "GET":
                response = self.session.get(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            raise

    def test_registration_valid_data_formats(self):
        """Test registration with various valid data formats"""
        timestamp = str(int(time.time()))
        
        test_cases = [
            {
                "name": "Complete Tax Professional Profile",
                "data": {
                    "email": f"taxpro_complete_{timestamp}@example.com",
                    "password": "SecurePass123!",
                    "role": "tax_professional",
                    "profile": {
                        "firstName": "John",
                        "lastName": "Smith",
                        "phone": "+1234567890",
                        "company": "Smith Tax Services"
                    }
                }
            },
            {
                "name": "Minimal Client Profile",
                "data": {
                    "email": f"client_minimal_{timestamp}@example.com",
                    "password": "ClientPass123!",
                    "role": "client",
                    "profile": {
                        "firstName": "Jane",
                        "lastName": "Doe"
                    }
                }
            },
            {
                "name": "Admin with Optional Fields",
                "data": {
                    "email": f"admin_optional_{timestamp}@example.com",
                    "password": "AdminPass123!",
                    "role": "admin",
                    "profile": {
                        "firstName": "Admin",
                        "lastName": "User",
                        "phone": "+1987654321",
                        "company": "TaxPortal Pro"
                    }
                }
            },
            {
                "name": "Client with Phone Only",
                "data": {
                    "email": f"client_phone_{timestamp}@example.com",
                    "password": "ClientPass456!",
                    "role": "client",
                    "profile": {
                        "firstName": "Bob",
                        "lastName": "Johnson",
                        "phone": "+1555123456"
                    }
                }
            }
        ]
        
        success_count = 0
        for test_case in test_cases:
            try:
                response = self.make_request("POST", "/auth/register", test_case["data"])
                if response.status_code == 200:
                    data = response.json()
                    if "access_token" in data and "user" in data:
                        self.log_test(f"Registration - {test_case['name']}", True, 
                                    f"User registered successfully with ID: {data['user']['id']}")
                        success_count += 1
                    else:
                        self.log_test(f"Registration - {test_case['name']}", False, 
                                    f"Missing token or user data in response: {data}")
                else:
                    self.log_test(f"Registration - {test_case['name']}", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    print(f"Request data: {json.dumps(test_case['data'], indent=2)}")
            except Exception as e:
                self.log_test(f"Registration - {test_case['name']}", False, f"Exception: {str(e)}")
                
        return success_count == len(test_cases)

    def test_registration_invalid_data(self):
        """Test registration with invalid data to check validation"""
        timestamp = str(int(time.time()))
        
        test_cases = [
            {
                "name": "Invalid Email Format",
                "data": {
                    "email": "invalid-email-format",
                    "password": "SecurePass123!",
                    "role": "client",
                    "profile": {
                        "firstName": "Test",
                        "lastName": "User"
                    }
                },
                "expected_status": 422
            },
            {
                "name": "Missing Profile",
                "data": {
                    "email": f"missing_profile_{timestamp}@example.com",
                    "password": "SecurePass123!",
                    "role": "client"
                },
                "expected_status": 422
            },
            {
                "name": "Invalid Role",
                "data": {
                    "email": f"invalid_role_{timestamp}@example.com",
                    "password": "SecurePass123!",
                    "role": "invalid_role",
                    "profile": {
                        "firstName": "Test",
                        "lastName": "User"
                    }
                },
                "expected_status": 422
            },
            {
                "name": "Missing Required Profile Fields",
                "data": {
                    "email": f"missing_fields_{timestamp}@example.com",
                    "password": "SecurePass123!",
                    "role": "client",
                    "profile": {
                        "firstName": "Test"
                        # Missing lastName
                    }
                },
                "expected_status": 422
            },
            {
                "name": "Empty Password",
                "data": {
                    "email": f"empty_password_{timestamp}@example.com",
                    "password": "",
                    "role": "client",
                    "profile": {
                        "firstName": "Test",
                        "lastName": "User"
                    }
                },
                "expected_status": 422
            }
        ]
        
        success_count = 0
        for test_case in test_cases:
            try:
                response = self.make_request("POST", "/auth/register", test_case["data"])
                if response.status_code == test_case["expected_status"]:
                    self.log_test(f"Validation - {test_case['name']}", True, 
                                f"Correctly rejected with HTTP {response.status_code}")
                    success_count += 1
                else:
                    self.log_test(f"Validation - {test_case['name']}", False, 
                                f"Expected {test_case['expected_status']}, got {response.status_code}: {response.text}")
                    print(f"Request data: {json.dumps(test_case['data'], indent=2)}")
            except Exception as e:
                self.log_test(f"Validation - {test_case['name']}", False, f"Exception: {str(e)}")
                
        return success_count == len(test_cases)

    def test_duplicate_registration(self):
        """Test duplicate email registration"""
        timestamp = str(int(time.time()))
        
        user_data = {
            "email": f"duplicate_test_{timestamp}@example.com",
            "password": "SecurePass123!",
            "role": "client",
            "profile": {
                "firstName": "Duplicate",
                "lastName": "Test"
            }
        }
        
        try:
            # First registration
            response1 = self.make_request("POST", "/auth/register", user_data)
            if response1.status_code != 200:
                self.log_test("Duplicate Registration", False, 
                            f"First registration failed: HTTP {response1.status_code}: {response1.text}")
                return False
            
            # Second registration with same email
            response2 = self.make_request("POST", "/auth/register", user_data)
            if response2.status_code == 400:
                if "already registered" in response2.text.lower():
                    self.log_test("Duplicate Registration", True, 
                                "Correctly rejected duplicate email registration")
                    return True
                else:
                    self.log_test("Duplicate Registration", False, 
                                f"Wrong error message: {response2.text}")
                    return False
            else:
                self.log_test("Duplicate Registration", False, 
                            f"Expected 400, got {response2.status_code}: {response2.text}")
                return False
        except Exception as e:
            self.log_test("Duplicate Registration", False, f"Exception: {str(e)}")
            return False

    def test_login_scenarios(self):
        """Test various login scenarios"""
        timestamp = str(int(time.time()))
        
        # First create a test user
        user_data = {
            "email": f"login_test_{timestamp}@example.com",
            "password": "LoginTest123!",
            "role": "tax_professional",
            "profile": {
                "firstName": "Login",
                "lastName": "Test",
                "company": "Test Company"
            }
        }
        
        try:
            # Register user
            reg_response = self.make_request("POST", "/auth/register", user_data)
            if reg_response.status_code != 200:
                self.log_test("Login Test Setup", False, 
                            f"Failed to create test user: HTTP {reg_response.status_code}: {reg_response.text}")
                return False
            
            # Test valid login
            login_data = {
                "email": user_data["email"],
                "password": user_data["password"]
            }
            
            login_response = self.make_request("POST", "/auth/login", login_data)
            if login_response.status_code == 200:
                data = login_response.json()
                if "access_token" in data and "user" in data:
                    self.log_test("Valid Login", True, 
                                f"Login successful for user: {data['user']['email']}")
                else:
                    self.log_test("Valid Login", False, 
                                f"Missing token or user data: {data}")
                    return False
            else:
                self.log_test("Valid Login", False, 
                            f"HTTP {login_response.status_code}: {login_response.text}")
                return False
            
            # Test invalid password
            invalid_login_data = {
                "email": user_data["email"],
                "password": "WrongPassword123!"
            }
            
            invalid_response = self.make_request("POST", "/auth/login", invalid_login_data)
            if invalid_response.status_code == 401:
                self.log_test("Invalid Password Login", True, 
                            "Correctly rejected invalid password")
            else:
                self.log_test("Invalid Password Login", False, 
                            f"Expected 401, got {invalid_response.status_code}: {invalid_response.text}")
                return False
            
            # Test non-existent user
            nonexistent_login_data = {
                "email": f"nonexistent_{timestamp}@example.com",
                "password": "SomePassword123!"
            }
            
            nonexistent_response = self.make_request("POST", "/auth/login", nonexistent_login_data)
            if nonexistent_response.status_code == 401:
                self.log_test("Non-existent User Login", True, 
                            "Correctly rejected non-existent user")
                return True
            else:
                self.log_test("Non-existent User Login", False, 
                            f"Expected 401, got {nonexistent_response.status_code}: {nonexistent_response.text}")
                return False
                
        except Exception as e:
            self.log_test("Login Scenarios", False, f"Exception: {str(e)}")
            return False

    def test_edge_cases(self):
        """Test edge cases that might cause issues"""
        timestamp = str(int(time.time()))
        
        test_cases = [
            {
                "name": "Very Long Password",
                "data": {
                    "email": f"long_password_{timestamp}@example.com",
                    "password": "A" * 100 + "123!",  # Very long password
                    "role": "client",
                    "profile": {
                        "firstName": "Long",
                        "lastName": "Password"
                    }
                }
            },
            {
                "name": "Special Characters in Name",
                "data": {
                    "email": f"special_chars_{timestamp}@example.com",
                    "password": "SpecialChars123!",
                    "role": "client",
                    "profile": {
                        "firstName": "José",
                        "lastName": "O'Connor-Smith"
                    }
                }
            },
            {
                "name": "Unicode Characters",
                "data": {
                    "email": f"unicode_{timestamp}@example.com",
                    "password": "Unicode123!",
                    "role": "client",
                    "profile": {
                        "firstName": "测试",
                        "lastName": "用户"
                    }
                }
            }
        ]
        
        success_count = 0
        for test_case in test_cases:
            try:
                response = self.make_request("POST", "/auth/register", test_case["data"])
                if response.status_code == 200:
                    data = response.json()
                    if "access_token" in data and "user" in data:
                        self.log_test(f"Edge Case - {test_case['name']}", True, 
                                    f"Successfully handled edge case")
                        success_count += 1
                    else:
                        self.log_test(f"Edge Case - {test_case['name']}", False, 
                                    f"Missing token or user data: {data}")
                else:
                    self.log_test(f"Edge Case - {test_case['name']}", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    print(f"Request data: {json.dumps(test_case['data'], indent=2)}")
            except Exception as e:
                self.log_test(f"Edge Case - {test_case['name']}", False, f"Exception: {str(e)}")
                
        return success_count >= len(test_cases) * 0.8  # Allow some edge cases to fail

    def run_diagnostic_tests(self):
        """Run all diagnostic tests"""
        print("🔍 Starting TaxPortal Pro Authentication Diagnostic Tests")
        print("=" * 70)
        
        test_methods = [
            ("Valid Data Formats", self.test_registration_valid_data_formats),
            ("Invalid Data Validation", self.test_registration_invalid_data),
            ("Duplicate Registration", self.test_duplicate_registration),
            ("Login Scenarios", self.test_login_scenarios),
            ("Edge Cases", self.test_edge_cases)
        ]
        
        passed = 0
        total = len(test_methods)
        
        for test_name, test_method in test_methods:
            print(f"\n🧪 Running {test_name} Tests...")
            try:
                if test_method():
                    passed += 1
                    print(f"✅ {test_name} Tests: PASSED")
                else:
                    print(f"❌ {test_name} Tests: FAILED")
            except Exception as e:
                print(f"❌ {test_name} Tests: FAILED with exception: {str(e)}")
        
        print("\n" + "=" * 70)
        print(f"📊 Diagnostic Results: {passed}/{total} test categories passed")
        
        # Analyze results
        print("\n🔍 ANALYSIS:")
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print(f"❌ Found {len(failed_tests)} failing test cases:")
            for failed in failed_tests[:10]:  # Show first 10 failures
                print(f"   - {failed['test']}: {failed['message']}")
            if len(failed_tests) > 10:
                print(f"   ... and {len(failed_tests) - 10} more failures")
        else:
            print("✅ All authentication tests passed!")
            
        return passed == total

def main():
    """Main diagnostic execution"""
    tester = AuthDiagnosticTester()
    success = tester.run_diagnostic_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())