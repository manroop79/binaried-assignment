import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'X Clone - A Full-Stack Social Media Platform',
  description: 'A feature-rich Twitter/X clone built with Next.js, TypeScript, Express, and MongoDB',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className={`${inter.className} ${inter.variable} antialiased`}>
        <AuthProvider>
          {/* Single root background with grid */}
          <div className="min-h-screen bg-white dark:bg-transparent">
            <Header />
            <main className="w-full max-w-full sm:max-w-4xl mx-auto px-0 sm:px-4">
              {children}
            </main>
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#363636',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                padding: '12px 20px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
