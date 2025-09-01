import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Harumoney',
  description: '하루머니',
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