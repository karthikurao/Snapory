'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <main style={{ paddingTop: '64px' }}>
      {/* Hero Section */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem',
        background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          fontWeight: '700',
          marginBottom: '1.5rem',
          lineHeight: '1.1'
        }}>
          Find Your Photos
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Instantly
          </span>
        </h1>
        
        <p style={{
          fontSize: 'clamp(1rem, 3vw, 1.25rem)',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          marginBottom: '2.5rem',
          lineHeight: '1.6'
        }}>
          Snapory uses AI face recognition to help event guests find all their photos 
          with a single selfie. Perfect for weddings, parties, and corporate events.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {isLoading ? (
            <div style={{ height: '48px' }}></div>
          ) : isAuthenticated ? (
            <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }}>
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }}>
                Get Started Free
              </Link>
              <Link href="/login" className="btn btn-secondary" style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }}>
                Login
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'var(--background-secondary)'
      }}>
        <div className="container">
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            How It Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Upload Event Photos</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Photographers upload all event photos. Our AI automatically detects and indexes every face.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Share QR Code</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Share a unique QR code or link with guests. No app download required.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤳</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Take a Selfie</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Guests take a quick selfie. Our AI matches their face against all event photos.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⬇️</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Download Photos</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Instantly view and download all photos featuring their face. It&apos;s that simple!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section style={{ padding: '4rem 2rem' }}>
        <div className="container">
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Perfect For
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {['💒 Weddings', '🎂 Birthday Parties', '🏢 Corporate Events', '🎓 Graduations', '🎉 Celebrations', '📷 Photo Booths'].map((item) => (
              <div
                key={item}
                style={{
                  background: 'var(--background-secondary)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  fontSize: '1.125rem'
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            color: 'var(--text-muted)',
            marginBottom: '2rem',
            fontSize: '1.125rem'
          }}>
            Create your first event in minutes. No credit card required.
          </p>
          {!isLoading && !isAuthenticated && (
            <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }}>
              Start Free Trial
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: '0.875rem'
      }}>
        <p>Built with Next.js, ASP.NET Core, and Python AI</p>
        <p style={{ marginTop: '0.5rem' }}>© 2024 Snapory. All rights reserved.</p>
      </footer>
    </main>
  );
}
