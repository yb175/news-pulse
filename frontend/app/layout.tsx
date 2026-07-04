import type { Metadata } from 'next';
import { Inter, Libre_Baskerville, JetBrains_Mono } from 'next/font/google';
import QueryProvider from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-libre-baskerville',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

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
    <html lang="en" className={`${inter.variable} ${libreBaskerville.variable} ${jetbrainsMono.variable}`}>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
