
'use client'; // Make it a client component to use usePathname

// import type { Metadata } from 'next'; // Metadata export is not directly used in client root layouts in the same way
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { SecondaryNavbar } from '@/components/layout/secondary-navbar';
import { Footer } from '@/components/layout/footer';
import { CartProvider } from '@/context/cart-context';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from 'next/navigation'; // Import usePathname
import type { ReactNode } from 'react';
import Head from 'next/head'; // Import Head for setting page title

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// For client root layouts, metadata is typically managed via <Head> or in specific page.tsx files.
// We can set a default title here.
const DEFAULT_TITLE = 'svsdmediplaza - Your Health Partner';
const DEFAULT_DESCRIPTION = 'Online pharmacy for all your healthcare needs. Buy medicines, book lab tests, and consult doctors online.';


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <title>{DEFAULT_TITLE}</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        {/* You can add more default meta tags here if needed */}
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <CartProvider> {/* CartProvider can remain global or be made conditional if cart is not needed in admin */}
            {isAdminRoute ? (
              <>
                {/* AdminLayout will provide its own structure and Toaster */}
                {children}
              </>
            ) : (
              <>
                <Navbar />
                <SecondaryNavbar />
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </main>
                <Footer />
                {/* This Toaster is for the customer portal */}
                <Toaster /> 
              </>
            )}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
