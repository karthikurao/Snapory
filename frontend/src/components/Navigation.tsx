'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navigation() {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname.startsWith('/event/')) {
    return null;
  }

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const navLinkClass = (href: string) => `nav-link${pathname === href ? ' active' : ''}`;

  return (
    <nav className="app-nav">
      <div className="container app-nav__inner">
        <Link href="/" className="app-logo" onClick={closeMenu}>
          Snapory
        </Link>

        <div className="desktop-nav nav-links">
          {isLoading ? (
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading...</span>
          ) : isAuthenticated ? (
            <>
              <Link href="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
              <Link href="/create-event" className={navLinkClass('/create-event')}>New Event</Link>
              <span className="text-sm" style={{ color: 'var(--muted-foreground)', marginInline: '0.35rem' }}>
                {user?.name || user?.email}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass('/login')}>Login</Link>
              <Link href="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>

        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen((value) => !value)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)', paddingBottom: '0.3rem' }}>
                Signed in as {user?.name || user?.email}
              </span>
              <Link href="/dashboard" className="nav-link active" onClick={closeMenu}>Dashboard</Link>
              <Link href="/create-event" className="nav-link" onClick={closeMenu}>New Event</Link>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ marginTop: '0.4rem' }}>Logout</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" className="nav-link" onClick={closeMenu}>Login</Link>
              <Link href="/register" className="btn btn-primary" onClick={closeMenu}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
