
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const secondaryNavLinks = [
  { href: '/products', label: 'All Products' },
  { href: '/category/baby-care', label: 'Baby Care' }, // Updated href
  { href: '/products?category=Nutritional%20Drinks%20%26%20Supplements', label: 'Nutritional Drinks & Supplements' },
  { href: '/products?category=Women%20Care', label: 'Women Care' },
  { href: '/products?category=Personal%20Care', label: 'Personal Care' },
  { href: '/products?category=Ayurveda', label: 'Ayurveda' },
  { href: '/products?category=Health%20Devices', label: 'Health Devices' },
  { href: '/products?category=Home%20Essentials', label: 'Home Essentials' },
  { href: '/products?category=Health%20Condition', label: 'Health Condition' },
];

export function SecondaryNavbar() {
  return (
    <nav className="bg-background border-b shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center h-12 space-x-1 sm:space-x-2">
            {secondaryNavLinks.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                asChild
                className="text-xs sm:text-sm text-foreground hover:text-primary hover:bg-primary/10 px-2 py-1 whitespace-nowrap"
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </nav>
  );
}
