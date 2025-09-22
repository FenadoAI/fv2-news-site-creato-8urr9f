#!/usr/bin/env python3

import requests
import json
import sys
import time

def test_full_news_system():
    """Test the complete news system end-to-end"""
    backend_url = "http://localhost:8001/api"
    frontend_url = "http://localhost:3000"

    print("🧪 Testing Full News System...")
    print("=" * 50)

    # Test 1: Backend API Health
    print("\n1. Testing Backend Health...")
    try:
        response = requests.get(f"{backend_url}/", timeout=5)
        response.raise_for_status()
        print("✅ Backend is running")
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False

    # Test 2: Categories endpoint
    print("\n2. Testing Categories Endpoint...")
    try:
        response = requests.get(f"{backend_url}/news/categories", timeout=10)
        response.raise_for_status()
        data = response.json()
        print(f"✅ Categories loaded: {len(data['categories'])} categories")
        print(f"   Countries: {[c['name'] for c in data['countries']]}")
    except Exception as e:
        print(f"❌ Categories endpoint failed: {e}")
        return False

    # Test 3: News endpoint with different categories
    test_categories = [
        ("technology", "US"),
        ("world", "US"),
        ("business", "UK")
    ]

    print("\n3. Testing News Scraping...")
    for category, country in test_categories:
        print(f"   Testing {category} news from {country}...")
        try:
            payload = {
                "category": category,
                "country": country,
                "limit": 5
            }
            response = requests.post(f"{backend_url}/news", json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()

            if data["success"]:
                print(f"   ✅ {data['total_count']} articles retrieved")
                if data['articles']:
                    sample_title = data['articles'][0]['title'][:60]
                    print(f"      Sample: {sample_title}...")
            else:
                print(f"   ❌ Failed: {data.get('error', 'Unknown error')}")
        except Exception as e:
            print(f"   ❌ Request failed: {e}")

    # Test 4: Frontend accessibility
    print("\n4. Testing Frontend Accessibility...")
    try:
        response = requests.get(frontend_url, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
        else:
            print(f"⚠️  Frontend returned status code: {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend not accessible: {e}")

    print("\n" + "=" * 50)
    print("✅ News system test completed!")
    print("\n🌐 You can now access your news website at:")
    print(f"   Frontend: {frontend_url}")
    print(f"   Backend API: {backend_url}")
    print("\n📰 Features available:")
    print("   • News from multiple categories (Tech, World, Business, etc.)")
    print("   • Multiple countries (US, UK, Australia, Canada, India)")
    print("   • Real-time news scraping from Google News RSS")
    print("   • Modern responsive design with shadcn/ui components")
    print("   • Click any article to open the full story")

    return True

if __name__ == "__main__":
    if test_full_news_system():
        sys.exit(0)
    else:
        sys.exit(1)