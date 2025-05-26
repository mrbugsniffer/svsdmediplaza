
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { mockCategories } from '@/lib/mock-data';

// Define a mapping for categories that have dedicated pages
const dedicatedCategoryPages: Record<string, string> = {
  "Baby Care": "/category/baby-care",
  "Nutritional Drinks & Supplements": "/category/nutritional-drinks-supplements",
  "Women Care": "/category/women-care",
  "Personal Care": "/category/personal-care",
  "Skin Care": "/category/skin-care",
  "Pain Relief": "/category/pain-relief",
  "Cold & Flu": "/category/cold-flu",
  "Eye Care": "/category/eye-care",
  "Dental Care": "/category/dental-care",
  // Add other categories with dedicated pages here
};

export function SecondaryNavbar() {
  const navLinks = [
    { href: '/products', label: 'All Products' },
    ...mockCategories.map(category => {
      const dedicatedPagePath = dedicatedCategoryPages[category];
      const label = category === "Vitamins & Supplements" ? "Nutritional Drinks & Supplements" : category;
      return {
        href: dedicatedPagePath || `/products?category=${encodeURIComponent(category)}`,
        label: label,
      };
    })
  ];

  const uniqueLabels = new Set<string>();
  const finalNavLinks = navLinks.filter(link => {
    if (uniqueLabels.has(link.label)) {
      return false;
    }
    uniqueLabels.add(link.label);
    return true;
  });


  return (
    <nav className="bg-background border-b shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center h-12 space-x-1 sm:space-x-2">
            {finalNavLinks.map((link) => (
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
