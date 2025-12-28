import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Snapory - Instant Event Photos for Every Guest',
  description: 'Guests see their own event photos instantly by scanning a QR code. AI automatically finds their photos. No app needed.',
  keywords: ['event photos', 'wedding photography', 'face recognition', 'QR code photos', 'instant photo delivery'],
  authors: [{ name: 'Snapory' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

