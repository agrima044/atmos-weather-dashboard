/**
 * ATMOS — Root Layout
 * Font loading, metadata, PWA manifest, theme bootstrap
 * Author: Agrima Vijayvargiya
 */
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0f6ff' },
    { media: '(prefers-color-scheme: dark)', color: '#071A2F' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'ATMOS — Weather, Air Quality & Forecasts',
  description: 'Real-time weather intelligence — current conditions, 7-day forecasts, air quality index, UV index, and smart recommendations. Built with Next.js and Open-Meteo.',
  keywords: ['weather', 'forecast', 'air quality', 'UV index', 'ATMOS', 'weather dashboard'],
  authors: [{ name: 'Agrima Vijayvargiya' }],
  creator: 'Agrima Vijayvargiya',
  manifest: '/manifest.json',
  openGraph: {
    title: 'ATMOS — Weather Dashboard',
    description: 'Real-time weather intelligence, beautifully designed.',
    type: 'website',
    siteName: 'ATMOS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATMOS — Weather Dashboard',
    description: 'Real-time weather intelligence, beautifully designed.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <link rel="apple-touch-icon" href="/icons/icon-192.png"/>
      </head>
      <body>
        {/* Theme initialization — prevents flash of wrong theme */}
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function() {
            try {
              var stored = localStorage.getItem('atmos-theme') || 'light';
              var theme = stored === 'auto'
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : stored;
              document.documentElement.setAttribute('data-theme', theme);
            } catch(e) {
              document.documentElement.setAttribute('data-theme', 'light');
            }
          })();
        `}</Script>
        {children}
      </body>
    </html>
  );
}
