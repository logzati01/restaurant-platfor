import './globals.css';
import { LanguageProvider } from '@/components/LanguageContext';

export const metadata = {
  title: 'منصة إدارة المطاعم المتكاملة | Restaurant Management Platform',
  description: 'Smart multi-branch restaurant management system with live orders and QR ordering.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
