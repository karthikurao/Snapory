import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Snapory | AI Event Photography',
  description: 'The premium platform for instant event photo delivery. AI-powered face matching, secure galleries, and seamless guest experience.',
  keywords: ['event photos', 'wedding photography', 'face recognition', 'QR code photos', 'instant photo delivery', 'photo sharing'],
  authors: [{ name: 'Snapory' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030712',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Font loaded via globals.css @import, but preconnect helps */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

