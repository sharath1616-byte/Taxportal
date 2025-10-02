#!/usr/bin/env python3
"""
Debug script to check invoice lookup
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "https://accountease-3.preview.emergentagent.com/api"

def test_invoice_lookup():
    # First, register and login
    import time
    timestamp = str(int(time.time()))
    
    user_data = {
        "role": "tax_professional",
        "email": f"debug{timestamp}@example.com",
        "password": "DebugPass123!",
        "profile": {
            "firstName": "Debug",
            "lastName": "User",
            "phone": "+1234567890",
            "company": "Debug Tax Services"
        }
    }
    
    # Register user
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    if response.status_code != 200:
        print(f"Registration failed: {response.text}")
        return
        
    data = response.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    
    print(f"User registered: {user_id}")
    
    # Create a client relationship
    client_data = {
        "userId": user_id,  # Use same user as client for simplicity
        "taxProfessionalId": user_id,
        "taxYear": 2024,
        "estimatedCompletion": (datetime.now() + timedelta(days=30)).isoformat(),
        "notes": "Debug client"
    }
    
    response = requests.post(f"{BASE_URL}/clients/", json=client_data, 
                           headers={"Authorization": f"Bearer {token}"})
    if response.status_code != 200:
        print(f"Client creation failed: {response.text}")
        return
        
    client = response.json()
    client_id = client["id"]
    print(f"Client created: {client_id}")
    
    # Create an invoice
    invoice_data = {
        "clientId": client_id,
        "items": [
            {
                "description": "Debug Tax Return",
                "quantity": 1,
                "rate": 300.00,
                "amount": 300.00
            }
        ],
        "dueDate": (datetime.now() + timedelta(days=30)).isoformat(),
        "taxAmount": 24.00,
        "notes": "Debug invoice"
    }
    
    response = requests.post(f"{BASE_URL}/invoices/", json=invoice_data,
                           headers={"Authorization": f"Bearer {token}"})
    if response.status_code != 200:
        print(f"Invoice creation failed: {response.text}")
        return
        
    invoice = response.json()
    invoice_id = invoice["id"]
    print(f"Invoice created: {invoice_id}")
    print(f"Invoice data: {json.dumps(invoice, indent=2)}")
    
    # Now try to create payment checkout
    payment_data = {
        "invoice_id": invoice_id,
        "origin_url": "https://accountease-3.preview.emergentagent.com"
    }
    
    response = requests.post(f"{BASE_URL}/payments/invoice/checkout", json=payment_data,
                           headers={"Authorization": f"Bearer {token}"})
    
    print(f"Payment checkout response: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Invoice payment checkout successful!")
    else:
        print("❌ Invoice payment checkout failed!")

if __name__ == "__main__":
    test_invoice_lookup()