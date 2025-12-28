import Link from 'next/link';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero container animate-fade-in">
        <div className="badge mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.375rem' }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          AI-Powered Face Matching
        </div>
        <h1 className="hero-title">
          Guests Get Their<br />Event Photos Instantly
        </h1>
        <p className="hero-subtitle">
          Scan a QR code. Take a selfie. See every photo you appear in.
          <br />
          No app needed. No waiting. Just your memories.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/create-event" className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Create Event
          </Link>
          <Link href="/event/DEMO24" className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M7 7h.01M7 12h.01M7 17h.01M12 7h.01M12 12h.01M12 17h.01M17 7h.01M17 12h.01M17 17h.01"/>
            </svg>
            Try Demo
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '0.75rem' }}>How It Works</h2>
          <p style={{ maxWidth: '32rem', margin: '0 auto', fontSize: '1rem', color: 'var(--muted-foreground)' }}>
            Three simple steps to deliver photos to every guest
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {/* Step 1 */}
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 700
            }}>1</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Photographer Creates Event
            </h3>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', margin: 0 }}>
              Create an event, get a QR code. Display it at your venue.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 700
            }}>2</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Upload Photos Live
            </h3>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', margin: 0 }}>
              Photos are uploaded and AI detects all faces automatically.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 700
            }}>3</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Guests Find Their Photos
            </h3>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', margin: 0 }}>
              Scan QR, take selfie, instantly see every photo they appear in.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container" style={{ marginBottom: '4rem' }}>
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '0.75rem' }}>Why Photographers Love Snapory</h2>
          <p style={{ maxWidth: '32rem', margin: '0 auto', fontSize: '1rem', color: 'var(--muted-foreground)' }}>
            Deliver more value. Save hours of work.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
              </svg>
            </div>
            <h3 className="feature-title">AI Face Detection</h3>
            <p className="feature-description">Every face detected and encoded. No manual tagging needed.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M7 7h.01M7 12h.01M7 17h.01M12 7h.01M12 12h.01M12 17h.01M17 7h.01M17 12h.01M17 17h.01"/>
              </svg>
            </div>
            <h3 className="feature-title">QR Code Access</h3>
            <p className="feature-description">One QR code per event. Guests scan with any phone camera.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h3 className="feature-title">Instant Delivery</h3>
            <p className="feature-description">Guests see their photos during the event. No waiting days.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="feature-title">Auto-Sorted Albums</h3>
            <p className="feature-description">Photos grouped by person. Download albums per guest.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <h3 className="feature-title">Charge Premium</h3>
            <p className="feature-description">Offer instant delivery as a premium add-on service.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 className="feature-title">Secure & Private</h3>
            <p className="feature-description">Photos only visible to matched faces. Full privacy control.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        padding: '4rem 1rem',
        textAlign: 'center',
        marginBottom: '0'
      }}>
        <div className="container">
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', 
            color: 'white', 
            marginBottom: '1rem',
            fontWeight: 700
          }}>
            Ready to Delight Your Clients?
          </h2>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: '2rem',
            fontSize: '1.125rem',
            maxWidth: '500px',
            margin: '0 auto 2rem'
          }}>
            Create your first event in 2 minutes. No credit card required.
          </p>
          <Link 
            href="/create-event" 
            className="btn"
            style={{ 
              backgroundColor: 'white', 
              color: '#3b82f6',
              padding: '1rem 2rem',
              fontSize: '1.0625rem'
            }}
          >
            Create Your First Event →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Snapory</span>
            <span style={{ color: 'var(--muted-foreground)', marginLeft: '0.5rem', fontSize: '0.875rem' }}>
              — Instant event photos for every guest
            </span>
          </div>
          <div className="footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/help">Help</Link>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', margin: 0 }}>
            © {new Date().getFullYear()} Snapory. Built for Indian events.
          </p>
        </div>
      </footer>
    </div>
  );
}
