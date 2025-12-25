import './globals.css';
import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
