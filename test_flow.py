import httpx
import asyncio
import os
import json

API_URL = "http://localhost:5000"
# Use absolute path to the generated image artifact
SELFIE_PATH = r"C:\Users\karth\.gemini\antigravity\brain\388a6e54-4df3-438e-b1a8-ba95cca6e444\test_selfie_1769335268710.png" 

async def main():
    async with httpx.AsyncClient() as client:
        print(f"Checking health...")
        resp = await client.get(f"{API_URL}/health")
        print(f"Health: {resp.status_code} {resp.text}")

        # 1. Register
        print("\n1. Registering Photographer...")
        email = f"test_{os.urandom(4).hex()}@example.com"
        password = "Password123!"
        reg_data = {
            "name": "Test Photographer",
            "email": email,
            "password": password
        }
        resp = await client.post(f"{API_URL}/auth/register", json=reg_data)
        if resp.status_code != 200:
            print(f"Registration failed: {resp.text}")
            return
        token = resp.json()["token"]
        print(f"Registered! Token: {token[:10]}...")

        # 2. Create Event
        print("\n2. Creating Event...")
        headers = {"Authorization": f"Bearer {token}"}
        event_data = {
            "name": "Test Wedding",
            "eventDate": "2024-12-01T10:00:00Z",
            "location": "Test Venue",
            "type": "Wedding"
        }
        resp = await client.post(f"{API_URL}/events", json=event_data, headers=headers)
        if resp.status_code != 201 and resp.status_code != 200:
            print(f"Create event failed: {resp.text}")
            return
        event = resp.json()
        access_code = event["guestAccessCode"]
        print(f"Event Created! Access Code: {access_code}")

        # 3. Join Event as Guest
        print("\n3. Joining Event (Guest)...")
        resp = await client.post(f"{API_URL}/guests/join/{access_code}")
        if resp.status_code != 200:
            print(f"Join failed: {resp.text}")
            return
        guest_data = resp.json()
        session_id = guest_data["sessionId"]
        print(f"Joined! Session ID: {session_id}")

        # 4. Upload Selfie
        print("\n4. Uploading Selfie...")
        if not os.path.exists(SELFIE_PATH):
            print(f"Error: Selfie file not found at {SELFIE_PATH}")
            return
            
        with open(SELFIE_PATH, "rb") as f:
            files = {"selfie": ("selfie.png", f, "image/png")}
            resp = await client.post(f"{API_URL}/guests/{session_id}/selfie", files=files)
            
        if resp.status_code == 200:
            print(f"Selfie Upload Success: {resp.json()}")
        else:
            print(f"Selfie Upload Failed: {resp.status_code} {resp.text}")
            if resp.status_code == 500:
                print("Note: 500 implies Server Error (likely S3 credentials missing or AI service issue)")

if __name__ == "__main__":
    asyncio.run(main())
