# Snapory - Testing Face Recognition

## Overview

This document describes how to test the face recognition functionality added to Snapory.

## Prerequisites

- Backend API running (with database initialized)
- Python AI Service running
- Test images with faces

## Testing the Complete Workflow

### 1. Register a Photographer

```bash
curl -X POST http://localhost/api/photographers/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "photographer@example.com",
    "password": "TestPassword123",
    "name": "Test Photographer",
    "phoneNumber": "+1234567890"
  }'
```

### 2. Create an Event

```bash
curl -X POST http://localhost/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Wedding",
    "description": "John and Jane Wedding"
  }'
```

Save the `eventId` and `qrCodeData` from the response.

### 3. Upload Photos to the Event

```bash
curl -X POST http://localhost/api/photos/upload \
  -F "file=@/path/to/photo.jpg" \
  -F "eventId=YOUR_EVENT_ID"
```

### 4. Guest - Send OTP

```bash
curl -X POST http://localhost/api/guests/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "eventId": "YOUR_EVENT_ID"
  }'
```

Check the logs for the OTP code (since SMS integration is not implemented in MVP).

### 5. Guest - Verify OTP and Upload Selfie

```bash
curl -X POST http://localhost/api/guests/verify-and-register \
  -F "phoneNumber=+1234567890" \
  -F "eventId=YOUR_EVENT_ID" \
  -F "otpCode=123456" \
  -F "selfie=@/path/to/selfie.jpg"
```

Save the `guestId` from the response.

### 6. Get Guest Photos

```bash
curl http://localhost/api/guests/YOUR_EVENT_ID/photos/GUEST_ID
```

This will return only photos where the guest's face was detected.

## Testing Face Recognition Directly

### Test Face Detection

```bash
curl -X POST http://localhost/ai/api/face/detect \
  -F "file=@/path/to/photo.jpg"
```

### Test Face Embedding Extraction

```bash
curl -X POST http://localhost/ai/api/face/extract-embedding \
  -F "file=@/path/to/selfie.jpg"
```

## Database Files

The SQLite database is stored at:
- Backend: `./snapory.db` (in the backend directory when running locally)
- Container: `/data/snapory.db` (when running in Docker)

You can inspect the database using:
```bash
sqlite3 snapory.db
.tables
SELECT * FROM Events;
SELECT * FROM Photos;
SELECT * FROM Guests;
```

## Notes

### Face Recognition Model

- Uses DeepFace with Facenet512 model
- First run will download the model (may take a few minutes)
- Face matching threshold: 0.6 (configurable in code)

### OTP System

- OTPs are logged to console (check backend logs)
- In production, integrate with Twilio or AWS SNS for SMS
- OTPs expire in 10 minutes
- Max 3 verification attempts

### QR Code

- Generated automatically when creating an event
- Base64-encoded PNG image
- Can be displayed directly in browser using data URI

## Known Limitations (MVP)

1. **No actual SMS sending** - OTPs are logged to console
2. **Face processing is synchronous** - Should be moved to background job
3. **No photographer JWT authentication** - Uses temporary photographer ID
4. **Simple cosine similarity** - Could be improved with better matching algorithm

## Next Steps

To complete the implementation:

1. **Background Processing**: Move face detection to background jobs
2. **SMS Integration**: Add Twilio/AWS SNS for OTP delivery
3. **JWT Authentication**: Implement proper photographer authentication
4. **Frontend**: Build React components for all workflows
5. **Testing**: Add unit and integration tests
