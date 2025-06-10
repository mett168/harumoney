import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '@/components/Providers';
import Script from 'next/script'; // ✅ 추가

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HaruReward',
  description: '하루리워드',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* ✅ AdSense 코드 삽입 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4831216892677024"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.className} bg-gray-100`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
