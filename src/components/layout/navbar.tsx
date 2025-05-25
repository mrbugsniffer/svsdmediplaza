
'use client';

import Link from 'next/link';
import { MapPin, ChevronDown, Percent, ShoppingCart, LogIn, UserPlus, Menu, Search, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/context/auth-context'; // Import useAuth
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const SvsdMediPlazaLogo = () => (
  <svg width="30" height="30" viewBox="0 0 100 100" fill="hsl(var(--primary))" xmlns="http://www.w3.org/2000/svg">
    {/* Simple "S" shape */}
    <path d="M68.3,20.3c-5.9-4.5-13.2-7.1-21-7.1c-12.5,0-23.8,6.3-30.4,15.9l-0.1,0.1C10.7,36.8,7,44.9,7,53.8c0,9.1,3.9,17.3,10.2,23.1c6.6,6,15.3,9.5,24.8,9.5c7.8,0,15.1-2.6,21-7.1c6.1-4.7,10.4-11.3,12.4-18.9h-20c-2.2,0-4-1.8-4-4s1.8-4,4-4h23.8c0.4-2.6,0.6-5.2,0.6-7.8c0-8.1-2.9-15.5-7.8-21.4C71.7,21.9,70,21,68.3,20.3z M54.8,68.4c-3.6,2.8-8,4.4-12.8,4.4c-7.2,0-13.6-3.4-17.7-8.6c-4.4-5.2-6.7-11.6-6.7-18.4c0-6.6,2.2-12.8,6.4-17.9l0.1-0.1c4.1-5.2,9.9-8.5,16.4-8.5c4.8,0,9.2,1.7,12.8,4.4c3.6,2.8,6.2,6.6,7.5,10.9H48.8c-2.2,0-4-1.8-4-4s1.8-4,4-4h17.1C64.4,63.6,60.1,66.9,54.8,68.4z"/>
  </svg>
);

const mainNavLinks = [
  { href: '#', label: 'Buy Medicines' },
  { href: '#', label: 'Find Doctors' },
  { href: '#', label: 'Lab Tests' },
  { href: '#', label: 'Memberships' },
  { href: '/track-order', label: 'Health Records' },
  { href: '#', label: 'Offers', new: true },
  { href: '#', label: 'Wellness', new: true },
];

export function Navbar() {
  const { cartCount } = useCart ? useCart() : { cartCount: 0 };
  const { user, loading, logout } = useAuth(); // Use useAuth hook
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
      {loading ? (
        <Button variant="ghost" className="text-xs sm:text-sm px-2 sm:px-3" disabled>Loading...</Button>
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-xs sm:text-sm px-2 sm:px-3 text-foreground hover:text-primary">
              <UserCircle size={isMobile ? 18 : 20} className="mr-1" />
              <span className="hidden sm:inline truncate max-w-[100px]">{user.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/track-order">My Orders</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut size={14} className="mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button variant="outline" asChild className="text-xs sm:text-sm px-2 sm:px-3 text-foreground hover:text-primary hover:border-primary">
            <Link href="/login">
              <LogIn size={isMobile ? 18 : 20} className="mr-1" /> Login
            </Link>
          </Button>
          <Button variant="default" asChild className="text-xs sm:text-sm px-2 sm:px-3 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/signup">
              <UserPlus size={isMobile ? 16 : 18} className="mr-1 sm:mr-1.5" />
              Sign Up
            </Link>
          </Button>
        </>
      )}
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

  const mobileUserActions = (
    <>
       {loading ? (
        <Button variant="ghost" className="w-full justify-start" disabled>Loading...</Button>
      ) : user ? (
        <>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/profile"><UserCircle size={18} className="mr-2" /> Profile</Link>
          </Button>
           <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/track-order"><ShoppingCart size={18} className="mr-2" /> My Orders</Link>
          </Button>
          <Button variant="ghost" onClick={logout} className="w-full justify-start text-destructive hover:text-destructive">
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/login"><LogIn size={18} className="mr-2" /> Login</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start bg-accent/80 hover:bg-accent text-accent-foreground">
            <Link href="/signup"><UserPlus size={18} className="mr-2" /> Sign Up</Link>
          </Button>
        </>
      )}
        <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/cart"><ShoppingCart size={18} className="mr-2" /> Cart {isClient && cartCount > 0 && `(${cartCount})`}</Link>
        </Button>
         <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="#"><Percent size={18} className="mr-2" /> Offers</Link>
        </Button>
    </>
  );


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex flex-col px-4 sm:px-6 lg:px-8">
        {/* Top Bar: Logo, Delivery, Search (mobile), User Actions */}
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <SvsdMediPlazaLogo />
              <span className="hidden sm:inline">svsd</span><span className="font-normal hidden sm:inline">mediplaza</span>
              <span className="sm:hidden text-base">svsdmediplaza</span>
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
                    <div className="flex flex-col space-y-2">
                      {mobileUserActions}
                    </div>
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
