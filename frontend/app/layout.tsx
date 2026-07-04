import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'News Pulse | Real-Time News Clustering & Timelines',
  description: 'Track news timelines, clusters, and aggregations parsed from multiple RSS sources with premium micro-interactions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
