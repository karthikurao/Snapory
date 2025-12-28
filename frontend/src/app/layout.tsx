import './globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Snapory - Instant Event Photos for Every Guest',
  description: 'Guests see their own event photos instantly by scanning a QR code. AI automatically finds their photos. No app needed.',
  keywords: ['event photos', 'wedding photography', 'face recognition', 'QR code photos', 'instant photo delivery'],
  authors: [{ name: 'Snapory' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var validThemes = ['light', 'dark'];
                  if (theme && validThemes.includes(theme)) {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <nav className="navbar">
          <div className="container navbar-inner">
            <Link href="/" className="navbar-brand">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
              Snapory
            </Link>
            <div className="flex gap-4 items-center">
              <Link href="/#features" className="nav-link" style={{ color: 'var(--muted-foreground)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Features</Link>
              <Link href="/dashboard/demo" className="nav-link" style={{ color: 'var(--muted-foreground)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Dashboard</Link>
              <ThemeToggle />
              <Link href="/create-event" className="btn btn-primary" style={{ height: '2.25rem', padding: '0 1rem', fontSize: '0.8rem' }}>Create Event</Link>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

