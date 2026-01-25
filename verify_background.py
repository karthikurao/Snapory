import sqlite3
import time
import uuid
import os
from datetime import datetime

# Path to the database
DB_PATH = r"d:\Projects\Snapory\Snapory\src\SnaporyIngest\snapory.db"

def verify_background_processing():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    print(f"Connecting to database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Create a Dummy Event
    event_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4()) # Dummy user ID, hoping no FK constraint on User or we ignore it (Event has FK to User)
    
    # We need a user first?
    # Let's check table schema or just try. Event usually needs a registered user.
    # Actually, we can just look for an EXISTING event from previous tests to be safe.
    
    cursor.execute("SELECT EventId FROM Events LIMIT 1")
    row = cursor.fetchone()
    
    if row:
        event_id = row[0]
        print(f"Using existing EventId: {event_id}")
    else:
        print("No events found. Creating dummy User and Event...")
        # Start transaction
        try:
            # Create User
            user_id = str(uuid.uuid4())
            cursor.execute("INSERT INTO Users (UserId, Email, PasswordHash, Name, Role, IsEmailVerified, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                           (user_id, f"test_bg_{user_id[:4]}@example.com", "hash", "BG Tester", 0, 0, datetime.utcnow()))
            
            # Create Event
            cursor.execute("""
                INSERT INTO Events (EventId, UserId, Name, EventDate, Location, GuestAccessCode, UploadToken, IsActive, CreatedAt, TotalPhotos, ProcessedPhotos, TotalFacesDetected, IsProcessingComplete)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0)
            """, (event_id, user_id, "Background Test Event", datetime.utcnow(), "Test Loc", "BGTEST", str(uuid.uuid4()), 1, datetime.utcnow()))
            
            conn.commit()
            print(f"Created EventId: {event_id}")
        except Exception as e:
            print(f"Failed to create dummy data: {e}")
            return

    # 2. Insert Dummy Photo
    photo_id = str(uuid.uuid4())
    print(f"Inserting dummy photo {photo_id} with Status=0 (Pending)...")
    
    cursor.execute("""
        INSERT INTO Photos (PhotoId, EventId, FileName, S3Key, FileSize, ContentType, UploadedAt, ProcessingStatus, FaceCount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (photo_id, event_id, "test_bg.jpg", "dummy/path/test_bg.jpg", 1024, "image/jpeg", datetime.utcnow(), 0, 0))
    
    conn.commit()

    # 3. Poll for Status Change
    print("Waiting for Background Service to process...")
    for i in range(15): # Wait up to 15 seconds (poll is 5s)
        time.sleep(1)
        cursor.execute("SELECT ProcessingStatus, ProcessingError FROM Photos WHERE PhotoId = ?", (photo_id,))
        row = cursor.fetchone()
        status = row[0]
        error = row[1]
        
        print(f"Time {i+1}s: Status={status}")
        
        if status != 0: # 0 is Pending
            print(f"\nSUCCESS: Status changed from Pending (0) to {status}!")
            print(f"Processing Error: {error}")
            if status == 3: # Failed
                print("Note: Status 3 (Failed) is EXPECTED because S3 credentials are placeholders.")
                # We verified the service TRIED to process it.
            break
    else:
        print("\nFAILURE: Status did not change after 15 seconds. Service might not be running.")

    conn.close()

if __name__ == "__main__":
    verify_background_processing()
