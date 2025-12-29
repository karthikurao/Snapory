import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';

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
                  const VALID_THEME_VALUES = ['light', 'dark'];
                  var theme = localStorage.getItem('theme');
                  if (theme && VALID_THEME_VALUES.includes(theme)) {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
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

