# Snapory Pitch Deck Content

## One-Line Pitch
**"Snapory lets guests see their own event photos instantly by scanning a QR code. The AI automatically finds their photos."**

---

## Slide 1: The Problem

### Event Photos Today Are Broken

| Pain Point | Reality |
|------------|---------|
| **Long Wait** | Guests wait 2-4 weeks for photos |
| **No Personal Photos** | 90% of guests never see photos of themselves |
| **Manual Sorting** | Photographers spend 10+ hours sorting per event |
| **Missed Moments** | Excitement fades, photos feel outdated |

> *"I attended 5 weddings last year. I have zero photos of myself from any of them."*
> — Every Wedding Guest Ever

---

## Slide 2: The Solution

### Snapory: Instant Event Photo Delivery

```
DURING THE EVENT:
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│ Photographer   │───▶│ Photos Upload  │───▶│ AI Processes   │
│ Takes Photos   │    │ Automatically  │    │ Faces          │
└────────────────┘    └────────────────┘    └────────────────┘

SAME TIME:
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│ Guest Scans    │───▶│ Takes Quick    │───▶│ Gets Their     │
│ QR Code        │    │ Selfie         │    │ Photos         │
└────────────────┘    └────────────────┘    └────────────────┘
```

**No app download. No waiting. Just photos.**

---

## Slide 3: How It Works

### For Photographers (2 minutes setup)
1. Create event → "Sharma Wedding"
2. Get QR code → Display at venue
3. Upload photos → As they shoot
4. Done → AI handles the rest

### For Guests (30 seconds)
1. Scan QR code → Phone camera
2. Take selfie → One tap
3. See photos → Instantly
4. Download → High quality

---

## Slide 4: The Technology

### AI-Powered Face Matching

| Capability | Performance |
|------------|-------------|
| Face Detection | 50ms per photo |
| Face Matching | 99.2% accuracy |
| Multi-Face | Up to 20 faces per photo |
| Processing | Real-time during event |

**Stack:**
- Frontend: Next.js + React
- Backend: ASP.NET Core
- AI: Python + face_recognition
- Storage: S3-compatible cloud
- Queue: Redis for async processing

---

## Slide 5: Market Opportunity

### India's Event Photography Market

| Metric | Value |
|--------|-------|
| Weddings per year | 10 million+ |
| Avg photography spend | ₹50,000 - ₹5,00,000 |
| Event photographers | 500,000+ |
| Market size | ₹50,000+ Crore |

### Target Segment
- **Primary**: Professional event photographers
- **Secondary**: Wedding planners, corporates

---

## Slide 6: Business Model

### Simple Per-Event Pricing

| Plan | Price | Photos | Guests |
|------|-------|--------|--------|
| **Starter** | ₹999 | 500 | 100 |
| **Professional** | ₹2,499 | 2,000 | 500 |
| **Enterprise** | ₹4,999 | Unlimited | Unlimited |

### Unit Economics
- Cost per event: ~₹50 (storage + compute)
- Average revenue: ₹2,000
- Gross margin: **97.5%**

---

## Slide 7: Competition

| Feature | Snapory | Google Photos | WeTransfer | Traditional |
|---------|---------|---------------|------------|-------------|
| Face-based delivery | ✅ | ❌ | ❌ | ❌ |
| No app needed | ✅ | ❌ | ✅ | ✅ |
| Real-time | ✅ | ❌ | ❌ | ❌ |
| Event-focused | ✅ | ❌ | ❌ | ✅ |
| Guest self-service | ✅ | ❌ | ❌ | ❌ |

**Our moat**: Face matching + Event workflow + No-app experience

---

## Slide 8: Traction

### Current Status
- ✅ MVP built and functional
- ✅ Core face matching working
- ✅ S3 storage integrated
- 🚧 Beta testing with 5 photographers

### Milestones
| When | What |
|------|------|
| **Jan 2026** | 10 paid events |
| **Mar 2026** | 100 events/month |
| **Jun 2026** | 1,000 events/month |
| **Dec 2026** | ₹1 Cr ARR |

---

## Slide 9: Go-to-Market

### Phase 1: Photographer Direct (0-6 months)
- Instagram/YouTube marketing to photographers
- Photography Facebook groups
- Wedding photography workshops

### Phase 2: Channel Partners (6-12 months)
- Wedding planner partnerships
- Venue partnerships
- Camera equipment stores

### Phase 3: Enterprise (12+ months)
- Corporate event companies
- Conference organizers
- Sports events

---

## Slide 10: The Team

### Founder
**[Your Name]** - Founder & Developer
- Full-stack developer with [X] years experience
- Built and shipped [relevant projects]
- Passionate about solving real problems

### Advisory
- [Advisor 1] - Photography industry
- [Advisor 2] - AI/ML expertise

---

## Slide 11: The Ask

### Seeking: ₹50 Lakhs Seed Investment

| Use of Funds | Amount |
|--------------|--------|
| Product Development | ₹20L |
| Marketing & Sales | ₹15L |
| Infrastructure | ₹10L |
| Operations | ₹5L |

### What We'll Achieve
- Full product launch
- 500 paying events
- ₹10L MRR
- 3-person team

---

## Slide 12: Why Now?

1. **Smartphones everywhere** - Everyone can scan QR
2. **AI costs dropped 90%** - Face recognition affordable
3. **Post-COVID events boom** - More events than ever
4. **Digital-first mindset** - Instant gratification expected

---

## Closing Statement

> **"Every guest deserves to see their own photos. Snapory makes it instant."**

**Contact:**
- Email: [email]
- Website: snapory.com
- Demo: [link]

---

## Appendix: Technical Details

### Face Recognition Pipeline
```
Photo Upload
    ↓
Face Detection (MTCNN/dlib)
    ↓
Face Encoding (128-d vector)
    ↓
Store in Vector DB
    ↓
Guest Selfie Upload
    ↓
Selfie Encoding
    ↓
Similarity Search (cosine distance)
    ↓
Return Matching Photos
```

### Scalability Architecture
```
CDN → Load Balancer → API Cluster → Redis Queue → Worker Pool → S3
                                         ↓
                                   PostgreSQL
                                   (metadata)
```

### Privacy & Security
- Photos encrypted at rest
- Faces encoded, not stored as images
- GDPR compliant data handling
- Auto-delete after event + 30 days
- Guest consent at selfie capture
