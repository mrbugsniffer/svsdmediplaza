'use client';

import Link from 'next/link';
import { Home, ShoppingBag, ShoppingCart, PackageSearch, Menu, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { useIsMobile } from '@/hooks/use-mobile'; // Assuming this hook exists
import React from 'react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/track-order', label: 'Track Order', icon: PackageSearch },
];

export function Navbar() {
  const { cartCount } = useCart ? useCart() : { cartCount: 0 }; // Handle case where context might not be ready
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  const commonNavItems = (
    <>
      {navLinks.map((link) => (
        <Button key={link.href} variant="ghost" asChild className="text-foreground hover:text-primary transition-colors">
          <Link href={link.href} className="flex items-center gap-2">
            <link.icon size={20} />
            <span>{link.label}</span>
          </Link>
        </Button>
      ))}
      <Button variant="ghost" asChild className="relative text-foreground hover:text-primary transition-colors">
        <Link href="/cart" className="flex items-center gap-2">
          <ShoppingCart size={20} />
          <span>Cart</span>
          {isClient && cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Pill size={28} />
          <span>PharmaFlow</span>
        </Link>

        {isClient && isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background p-6">
              <nav className="flex flex-col space-y-4 mt-8">
                {commonNavItems}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
             {isClient && commonNavItems}
             {!isClient && <div className="h-8 w-48 animate-pulse bg-muted rounded-md"></div>} {/* Placeholder for SSR */}
          </nav>
        )}
      </div>
    </header>
  );
}
