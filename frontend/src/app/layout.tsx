import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Snapory - Real-time Event Photos',
  description: 'Upload and share event photos instantly',
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
