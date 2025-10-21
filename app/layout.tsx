import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RootProviders } from '@/components/providers/root-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Core Procurement Management',
  description: 'Procurement platform for requisitions, approvals, RFQs, POs, and vendors.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
