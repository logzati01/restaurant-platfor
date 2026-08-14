import './globals.css';
import { LanguageProvider } from '@/components/LanguageContext';
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata = {
  title: 'منصة إدارة المطاعم المتكاملة | RestoManager',
  description: 'Smart multi-branch restaurant management system with live orders and QR ordering.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cairo.variable}>
      <body className={cairo.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
