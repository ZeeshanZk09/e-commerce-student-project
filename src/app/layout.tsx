import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';
import Layout from '@/components/layout/Layout';

// Font optimization with proper display strategy
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // improves performance (prevents FOIT)
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

// Comprehensive SEO metadata
export const metadata: Metadata = {
  title: {
    default: 'e-com | Modern E-commerce Platform',
    template: '%s | e-com',
  },
  description: 'A fast, accessible, and SEO-optimized e-commerce platform built with Next.js.',
  keywords: ['e-commerce', 'Next.js', 'online store', 'shopping', 'React'],
  authors: [{ name: 'Your Name', url: 'https://your-portfolio-link.com' }],
  creator: 'Your Name',
  openGraph: {
    title: 'e-com | Modern E-commerce Platform',
    description: 'Shop smarter with e-com — a modern, fast, and accessible e-commerce experience.',
    url: 'https://yourdomain.com',
    siteName: 'e-com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'e-com preview image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'e-com | Modern E-commerce Platform',
    description: 'Experience lightning-fast shopping with e-com.',
    images: ['/og-image.jpg'],
    creator: '@yourhandle',
  },
  icons: {
    icon: '/globe.svg',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

// Mobile-first viewport optimization
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='scroll-smooth'>
      <head>
        {/* Accessible fallback titles */}
        <meta name='robots' content='index, follow' />
        <meta name='theme-color' content='#0f172a' />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100`}
      >
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
