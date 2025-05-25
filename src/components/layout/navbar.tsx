'use client';

import Link from 'next/link';
import { MapPin, ChevronDown, Percent, ShoppingCart, UserCircle2, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';
import { Input } from '@/components/ui/input';

const ApolloLogo = () => (
  <svg width="30" height="30" viewBox="0 0 100 100" fill="hsl(var(--primary))" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5C25.16 5 5 25.16 5 50s20.16 45 45 45 45-20.16 45-45S74.84 5 50 5zm0 82.73c-20.82 0-37.73-16.9-37.73-37.73S29.18 12.27 50 12.27s37.73 16.91 37.73 37.73S70.82 87.73 50 87.73z"/>
    <path d="M50 27.27c-12.55 0-22.73 10.18-22.73 22.73S37.45 72.73 50 72.73s22.73-10.18 22.73-22.73S62.55 27.27 50 27.27zm0 37.73c-8.28 0-15-6.72-15-15s6.72-15 15-15 15 6.72 15 15-6.72 15-15 15z"/>
  </svg>
);

const mainNavLinks = [
  { href: '#', label: 'Buy Medicines' },
  { href: '#', label: 'Find Doctors' },
  { href: '#', label: 'Lab Tests' },
  { href: '#', label: 'Circle Membership' },
  { href: '/track-order', label: 'Health Records' }, // Existing page, re-purposed label
  { href: '#', label: 'Credit Card', new: true },
  { href: '#', label: 'Buy Insurance', new: true },
];

export function Navbar() {
  const { cartCount } = useCart ? useCart() : { cartCount: 0 };
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const userActions = (
    <>
      <Button variant="ghost" className="text-xs sm:text-sm px-2 sm:px-3 text-foreground hover:text-primary">
        <Percent size={isMobile ? 16 : 18} className="mr-1" /> Offers
      </Button>
      <Button variant="ghost" asChild className="relative text-xs sm:text-sm px-2 sm:px-3 text-foreground hover:text-primary">
        <Link href="/cart">
          <ShoppingCart size={isMobile ? 18 : 20} className="mr-1" /> Cart
          {isClient && cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
              {cartCount}
            </span>
          )}
        </Link>
      </Button>
      <Button variant="outline" asChild className="text-xs sm:text-sm px-2 sm:px-3 text-foreground hover:text-primary hover:border-primary">
        <Link href="#">
          <UserCircle2 size={isMobile ? 18 : 20} className="mr-1" /> Login
        </Link>
      </Button>
    </>
  );
  
  const mainNavigationLinks = (
     mainNavLinks.map((link) => (
        <Button key={link.label} variant="ghost" asChild className="font-medium text-sm text-foreground hover:text-primary hover:bg-primary/10 px-2 py-1 sm:px-3">
          <Link href={link.href} className="flex items-center">
            {link.label}
            {link.new && <span className="ml-1.5 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-sm">New</span>}
          </Link>
        </Button>
      ))
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex flex-col px-4 sm:px-6 lg:px-8">
        {/* Top Bar: Logo, Delivery, Search (mobile), User Actions */}
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <ApolloLogo />
              <span className="hidden sm:inline">Apollo</span> <span className="font-normal hidden sm:inline">PHARMACY</span>
              <span className="sm:hidden text-base">Apollo</span>
            </Link>
            <Button variant="ghost" className="hidden sm:flex items-center gap-1 text-xs px-2 text-foreground hover:text-primary">
              <MapPin size={16} />
              <div className="text-left">
                <span className="block leading-tight">Delivery Address</span>
                <span className="block font-semibold leading-tight">Select Address <ChevronDown size={12} className="inline"/></span>
              </div>
            </Button>
          </div>

          <div className="hidden lg:flex flex-grow max-w-md mx-4 items-center relative">
            <Input 
              type="search" 
              placeholder="Search Medicines, Labs, Doctors..." 
              className="pl-10 text-sm bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {isClient && isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu size={24} />
                    <span className="sr-only">Toggle navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs bg-background p-6">
                  <nav className="flex flex-col space-y-3 mt-8">
                    <div className="relative mb-4">
                       <Input type="search" placeholder="Search..." className="pl-10"/>
                       <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {mainNavigationLinks}
                    <hr className="my-3"/>
                    {userActions}
                  </nav>
                </SheetContent>
              </Sheet>
            ) : (
              userActions
            )}
          </div>
        </div>
        
        {/* Main Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center justify-start gap-1 py-2 border-t lg:border-none">
          {mainNavigationLinks}
        </nav>
         {/* Search bar (Mobile) below top bar */}
        <div className="lg:hidden py-2 relative">
            <Input 
              type="search" 
              placeholder="Search Medicines, Labs, Doctors..." 
              className="pl-10 w-full text-sm bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
