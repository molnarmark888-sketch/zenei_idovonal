import type { Metadata } from 'next';
import { Audiowide } from 'next/font/google';
import './globals.css';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';

const audiowide = Audiowide({
  variable: '--font-audiowide',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Chrono Boom',
  description: 'Rap-történelem időutazás — Molnár Márk',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu" className={audiowide.variable}>
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
