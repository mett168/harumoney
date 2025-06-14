import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'HaruReward',
  description: '하루리워드',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-100">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}