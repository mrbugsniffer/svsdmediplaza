
'use client';

import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { LayoutDashboard, Package, LogOut, Settings, Users, ShoppingCart, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/toaster";
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});


const ADMIN_AUTH_KEY = 'svsdmediplaza_admin_auth';

// SvsdMediPlazaLogo for Admin - simplified
const SvsdMediPlazaAdminLogo = () => (
  <svg width="24" height="24" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M68.3,20.3c-5.9-4.5-13.2-7.1-21-7.1c-12.5,0-23.8,6.3-30.4,15.9l-0.1,0.1C10.7,36.8,7,44.9,7,53.8 c0,9.1,3.9,17.3,10.2,23.1c6.6,6,15.3,9.5,24.8,9.5c7.8,0,15.1-2.6,21-7.1c6.1-4.7,10.4-11.3,12.4-18.9h-20 c-2.2,0-4-1.8-4-4s1.8-4,4-4h23.8c0.4-2.6,0.6-5.2,0.6-7.8c0-8.1-2.9-15.5-7.8-21.4C71.7,21.9,70,21,68.3,20.3z M54.8,68.4 c-3.6,2.8-8,4.4-12.8,4.4c-7.2,0-13.6-3.4-17.7-8.6c-4.4-5.2-6.7-11.6-6.7-18.4c0-6.6,2.2-12.8,6.4-17.9l0.1-0.1 c4.1-5.2,9.9-8.5,16.4-8.5c4.8,0,9.2,1.7,12.8,4.4c3.6,2.8,6.2,6.6,7.5,10.9H48.8c-2.2,0-4-1.8-4-4s1.8-4,4-4h17.1 C64.4,63.6,60.1,66.9,54.8,68.4z"/>
  </svg>
);


export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const isAdminAuthenticated = localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    if (!isAdminAuthenticated) {
      router.replace('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    router.push('/admin/login');
  };

  if (!isClient || (localStorage.getItem(ADMIN_AUTH_KEY) !== 'true' && pathname !== '/admin/login')) {
    // Show loading or redirecting state, or null if redirecting immediately
    return (
        <div className="flex justify-center items-center min-h-screen bg-muted">
            <p>Loading admin area...</p>
        </div>
    );
  }

  // If on login page, don't render the layout
  if (pathname === '/admin/login') {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-muted`}>
          {children}
          <Toaster />
        </body>
      </html>
    );
  }

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/users', label: 'Customers', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-muted`}>
        <SidebarProvider defaultOpen>
          <div className="flex min-h-screen">
            <Sidebar side="left" className="border-r bg-background text-foreground" collapsible="icon">
              <SidebarHeader className="p-4 border-b">
                 <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <SvsdMediPlazaAdminLogo />
                    <span className="group-data-[collapsible=icon]:hidden">svsd Admin</span>
                </Link>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="p-2 border-t">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                            <LogOut />
                            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>
            
            <div className="flex-1 flex flex-col">
                {/* The admin-specific header has been removed.
                    The SidebarTrigger for mobile will still be rendered if the sidebar is collapsible.
                    If you want to remove the trigger too, or have a minimal header, adjust below.
                */}
                <div className="flex h-14 items-center px-4 sm:px-6 border-b bg-background md:hidden"> {/* Minimal bar for mobile trigger */}
                    <SidebarTrigger/> 
                </div>
                <main className="flex-1 p-4 sm:p-6 bg-muted overflow-auto">
                 {children}
                </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
