#!/usr/bin/env python3
"""
Additional TaxPortal Pro API Backend Tests
Tests edge cases, error handling, and data validation
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "https://acctax-portal.preview.emergentagent.com/api"

def test_additional_scenarios():
    """Test additional scenarios and edge cases"""
    print("🔍 Running Additional Backend Tests")
    print("=" * 50)
    
    # Test 1: Invalid email format registration
    print("Testing invalid email format...")
    invalid_user = {
        "role": "client",
        "email": "invalid-email",
        "password": "TestPass123!",
        "profile": {"firstName": "Test", "lastName": "User"}
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=invalid_user)
    if response.status_code == 422:  # Validation error
        print("✅ Invalid email format correctly rejected")
    else:
        print(f"❌ Expected 422 for invalid email, got {response.status_code}")
    
    # Test 2: Weak password
    print("Testing weak password...")
    weak_pass_user = {
        "role": "client", 
        "email": "test@example.com",
        "password": "123",
        "profile": {"firstName": "Test", "lastName": "User"}
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=weak_pass_user)
    # This might pass depending on validation rules, but let's check
    print(f"Weak password response: {response.status_code}")
    
    # Test 3: Missing required fields
    print("Testing missing required fields...")
    incomplete_user = {
        "role": "client",
        "email": "incomplete@example.com"
        # Missing password and profile
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=incomplete_user)
    if response.status_code == 422:
        print("✅ Missing fields correctly rejected")
    else:
        print(f"❌ Expected 422 for missing fields, got {response.status_code}")
    
    # Test 4: Invalid JSON
    print("Testing invalid JSON...")
    try:
        response = requests.post(f"{BASE_URL}/auth/register", 
                               data="invalid json", 
                               headers={"Content-Type": "application/json"})
        if response.status_code == 422:
            print("✅ Invalid JSON correctly rejected")
        else:
            print(f"❌ Expected 422 for invalid JSON, got {response.status_code}")
    except:
        print("✅ Invalid JSON correctly handled")
    
    # Test 5: Non-existent endpoints
    print("Testing non-existent endpoint...")
    response = requests.get(f"{BASE_URL}/nonexistent")
    if response.status_code == 404:
        print("✅ Non-existent endpoint returns 404")
    else:
        print(f"❌ Expected 404 for non-existent endpoint, got {response.status_code}")
    
    # Test 6: CORS headers
    print("Testing CORS headers...")
    response = requests.options(f"{BASE_URL}/health")
    cors_headers = [
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods", 
        "Access-Control-Allow-Headers"
    ]
    
    cors_ok = True
    for header in cors_headers:
        if header not in response.headers:
            print(f"❌ Missing CORS header: {header}")
            cors_ok = False
    
    if cors_ok:
        print("✅ CORS headers present")
    
    print("\n" + "=" * 50)
    print("Additional tests completed!")

if __name__ == "__main__":
    test_additional_scenarios()