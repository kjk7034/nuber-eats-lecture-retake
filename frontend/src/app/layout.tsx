import '@/styles/styles.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/shared/lib/providers/Providers';
import Header from '@/widgets/Header/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nuber',
  description: 'Uber Eats Clone Coding',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
