'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navigation() {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show navigation on guest event pages
  if (pathname.startsWith('/event/')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(15, 15, 15, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px'
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textDecoration: 'none'
        }}>
          Snapory
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {isLoading ? (
            <div style={{ width: '80px' }}></div>
          ) : isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                style={{
                  color: pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
              >
                Dashboard
              </Link>
              <Link
                href="/create-event"
                style={{
                  color: pathname === '/create-event' ? 'var(--text-primary)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
              >
                New Event
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu"
          style={{
            display: 'none',
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            background: 'var(--background-primary)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem'
          }}
        >
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.5rem 0' }}>
                Signed in as {user?.name || user?.email}
              </span>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.5rem 0'
                }}
              >
                Dashboard
              </Link>
              <Link
                href="/create-event"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.5rem 0'
                }}
              >
                New Event
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.5rem 0'
                }}
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ textAlign: 'center' }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: block !important;
          }
          .mobile-menu {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
