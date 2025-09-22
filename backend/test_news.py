#!/usr/bin/env python3

import requests
import json
import sys

def test_news_api():
    """Test the news API endpoints"""
    base_url = "http://localhost:8001/api"

    print("Testing News API...")

    # Test categories endpoint
    print("\n1. Testing /news/categories endpoint...")
    try:
        response = requests.get(f"{base_url}/news/categories")
        response.raise_for_status()
        data = response.json()
        print(f"✓ Categories endpoint: {len(data['categories'])} categories, {len(data['countries'])} countries")
    except Exception as e:
        print(f"✗ Categories endpoint failed: {e}")
        return False

    # Test news endpoint
    print("\n2. Testing /news endpoint...")
    try:
        payload = {
            "category": "technology",
            "country": "US",
            "limit": 5
        }
        response = requests.post(f"{base_url}/news", json=payload)
        response.raise_for_status()
        data = response.json()

        if data["success"]:
            print(f"✓ News endpoint: {data['total_count']} articles retrieved")
            if data['articles']:
                print(f"  Sample article: {data['articles'][0]['title'][:50]}...")
        else:
            print(f"✗ News endpoint failed: {data.get('error', 'Unknown error')}")
            return False

    except Exception as e:
        print(f"✗ News endpoint failed: {e}")
        return False

    print("\n✓ All tests passed!")
    return True

if __name__ == "__main__":
    if test_news_api():
        sys.exit(0)
    else:
        sys.exit(1)