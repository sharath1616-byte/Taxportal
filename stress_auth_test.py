#!/usr/bin/env python3
"""
TaxPortal Pro Authentication Stress Test
Tests authentication under various conditions to identify intermittent issues
"""

import requests
import json
import time
import threading
import concurrent.futures
from typing import Dict, Any, List

# Configuration
BASE_URL = "https://accountease-3.preview.emergentagent.com/api"

class AuthStressTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_results = []
        self.lock = threading.Lock()
        
    def log_test(self, test_name: str, success: bool, message: str = "", response_data: Any = None):
        """Thread-safe test logging"""
        with self.lock:
            result = {
                "test": test_name,
                "success": success,
                "message": message,
                "response_data": response_data,
                "timestamp": time.time()
            }
            self.test_results.append(result)
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{status}: {test_name} - {message}")
        
    def make_request(self, method: str, endpoint: str, data: Dict = None) -> requests.Response:
        """Make HTTP request with session per thread"""
        session = requests.Session()
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        try:
            if method.upper() == "POST":
                response = session.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "GET":
                response = session.get(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            raise

    def test_single_registration(self, thread_id: int, test_id: int):
        """Test single registration - used for concurrent testing"""
        timestamp = str(int(time.time() * 1000))  # More precise timestamp
        
        user_data = {
            "email": f"stress_test_{thread_id}_{test_id}_{timestamp}@example.com",
            "password": f"StressTest{thread_id}{test_id}!",
            "role": "client",
            "profile": {
                "firstName": f"Stress{thread_id}",
                "lastName": f"Test{test_id}"
            }
        }
        
        try:
            response = self.make_request("POST", "/auth/register", user_data)
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.log_test(f"Concurrent Registration T{thread_id}-{test_id}", True, 
                                f"User registered successfully")
                    return True
                else:
                    self.log_test(f"Concurrent Registration T{thread_id}-{test_id}", False, 
                                f"Missing token or user data: {data}")
                    return False
            else:
                self.log_test(f"Concurrent Registration T{thread_id}-{test_id}", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test(f"Concurrent Registration T{thread_id}-{test_id}", False, f"Exception: {str(e)}")
            return False

    def test_concurrent_registrations(self, num_threads=5, tests_per_thread=3):
        """Test concurrent registrations to identify race conditions"""
        print(f"🔄 Testing {num_threads} concurrent threads with {tests_per_thread} registrations each...")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = []
            for thread_id in range(num_threads):
                for test_id in range(tests_per_thread):
                    future = executor.submit(self.test_single_registration, thread_id, test_id)
                    futures.append(future)
            
            # Wait for all to complete
            results = []
            for future in concurrent.futures.as_completed(futures):
                try:
                    result = future.result(timeout=60)
                    results.append(result)
                except Exception as e:
                    print(f"Thread failed with exception: {e}")
                    results.append(False)
        
        success_count = sum(1 for r in results if r)
        total_count = len(results)
        
        print(f"📊 Concurrent Registration Results: {success_count}/{total_count} successful")
        return success_count == total_count

    def test_rapid_sequential_requests(self, count=20):
        """Test rapid sequential requests to identify timing issues"""
        print(f"⚡ Testing {count} rapid sequential registrations...")
        
        success_count = 0
        for i in range(count):
            timestamp = str(int(time.time() * 1000000))  # Microsecond precision
            
            user_data = {
                "email": f"rapid_test_{i}_{timestamp}@example.com",
                "password": f"RapidTest{i}!",
                "role": "client",
                "profile": {
                    "firstName": f"Rapid{i}",
                    "lastName": "Test"
                }
            }
            
            try:
                response = self.make_request("POST", "/auth/register", user_data)
                if response.status_code == 200:
                    data = response.json()
                    if "access_token" in data and "user" in data:
                        self.log_test(f"Rapid Registration {i+1}", True, 
                                    f"User registered successfully")
                        success_count += 1
                    else:
                        self.log_test(f"Rapid Registration {i+1}", False, 
                                    f"Missing token or user data: {data}")
                else:
                    self.log_test(f"Rapid Registration {i+1}", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    
                # Small delay to avoid overwhelming the server
                time.sleep(0.1)
                
            except Exception as e:
                self.log_test(f"Rapid Registration {i+1}", False, f"Exception: {str(e)}")
        
        print(f"📊 Rapid Sequential Results: {success_count}/{count} successful")
        return success_count >= count * 0.9  # Allow 10% failure rate

    def test_login_after_registration_stress(self, count=10):
        """Test login immediately after registration to identify timing issues"""
        print(f"🔐 Testing {count} registration-then-login sequences...")
        
        success_count = 0
        for i in range(count):
            timestamp = str(int(time.time() * 1000000))
            
            user_data = {
                "email": f"login_stress_{i}_{timestamp}@example.com",
                "password": f"LoginStress{i}!",
                "role": "tax_professional",
                "profile": {
                    "firstName": f"Login{i}",
                    "lastName": "Stress",
                    "company": f"Company{i}"
                }
            }
            
            try:
                # Register user
                reg_response = self.make_request("POST", "/auth/register", user_data)
                if reg_response.status_code != 200:
                    self.log_test(f"Login Stress {i+1} - Registration", False, 
                                f"Registration failed: HTTP {reg_response.status_code}: {reg_response.text}")
                    continue
                
                # Immediately try to login
                login_data = {
                    "email": user_data["email"],
                    "password": user_data["password"]
                }
                
                login_response = self.make_request("POST", "/auth/login", login_data)
                if login_response.status_code == 200:
                    data = login_response.json()
                    if "access_token" in data and "user" in data:
                        self.log_test(f"Login Stress {i+1}", True, 
                                    f"Registration and login successful")
                        success_count += 1
                    else:
                        self.log_test(f"Login Stress {i+1}", False, 
                                    f"Login missing token or user data: {data}")
                else:
                    self.log_test(f"Login Stress {i+1}", False, 
                                f"Login failed: HTTP {login_response.status_code}: {login_response.text}")
                
                time.sleep(0.2)  # Small delay between tests
                
            except Exception as e:
                self.log_test(f"Login Stress {i+1}", False, f"Exception: {str(e)}")
        
        print(f"📊 Login Stress Results: {success_count}/{count} successful")
        return success_count >= count * 0.9

    def test_various_data_sizes(self):
        """Test with various data sizes to identify payload issues"""
        print("📏 Testing various data sizes...")
        
        test_cases = [
            {
                "name": "Minimal Data",
                "data": {
                    "email": f"minimal_{int(time.time())}@example.com",
                    "password": "Min123!",
                    "role": "client",
                    "profile": {
                        "firstName": "A",
                        "lastName": "B"
                    }
                }
            },
            {
                "name": "Large Data",
                "data": {
                    "email": f"large_{int(time.time())}@example.com",
                    "password": "LargeDataTest123!" + "X" * 50,
                    "role": "tax_professional",
                    "profile": {
                        "firstName": "VeryLongFirstNameThatExceedsNormalLength" * 2,
                        "lastName": "VeryLongLastNameThatExceedsNormalLength" * 2,
                        "phone": "+1234567890123456789",
                        "company": "Very Long Company Name That Exceeds Normal Business Name Length Requirements" * 3
                    }
                }
            },
            {
                "name": "Special Characters",
                "data": {
                    "email": f"special_{int(time.time())}@example.com",
                    "password": "Special!@#$%^&*()123",
                    "role": "client",
                    "profile": {
                        "firstName": "José María",
                        "lastName": "García-López",
                        "phone": "+1 (555) 123-4567 ext. 890",
                        "company": "García & Associates, LLC"
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
                        self.log_test(f"Data Size - {test_case['name']}", True, 
                                    f"Successfully handled {test_case['name'].lower()}")
                        success_count += 1
                    else:
                        self.log_test(f"Data Size - {test_case['name']}", False, 
                                    f"Missing token or user data: {data}")
                else:
                    self.log_test(f"Data Size - {test_case['name']}", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Data Size - {test_case['name']}", False, f"Exception: {str(e)}")
        
        return success_count == len(test_cases)

    def run_stress_tests(self):
        """Run all stress tests"""
        print("🚀 Starting TaxPortal Pro Authentication Stress Tests")
        print("=" * 70)
        
        test_methods = [
            ("Concurrent Registrations", lambda: self.test_concurrent_registrations(5, 3)),
            ("Rapid Sequential Requests", lambda: self.test_rapid_sequential_requests(20)),
            ("Login After Registration Stress", lambda: self.test_login_after_registration_stress(10)),
            ("Various Data Sizes", self.test_various_data_sizes)
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
        print(f"📊 Stress Test Results: {passed}/{total} test categories passed")
        
        # Analyze failure patterns
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print(f"\n🔍 FAILURE ANALYSIS:")
            print(f"❌ Found {len(failed_tests)} failing test cases")
            
            # Group failures by error type
            error_patterns = {}
            for failed in failed_tests:
                error_key = failed['message'].split(':')[0] if ':' in failed['message'] else failed['message']
                if error_key not in error_patterns:
                    error_patterns[error_key] = []
                error_patterns[error_key].append(failed)
            
            for error_type, failures in error_patterns.items():
                print(f"   📋 {error_type}: {len(failures)} occurrences")
                if len(failures) <= 3:
                    for failure in failures:
                        print(f"      - {failure['test']}: {failure['message']}")
                else:
                    print(f"      - First 3 examples:")
                    for failure in failures[:3]:
                        print(f"        - {failure['test']}: {failure['message']}")
                    print(f"      - ... and {len(failures) - 3} more similar failures")
        else:
            print("\n✅ All stress tests passed! No authentication issues detected.")
            
        return passed == total

def main():
    """Main stress test execution"""
    tester = AuthStressTester()
    success = tester.run_stress_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())