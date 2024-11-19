import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import ActiveStatus from './components/ActiveStatus';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Messenger',
  description: 'The complete clone of messenger application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProviderWrapper>
          <ActiveStatus />
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
