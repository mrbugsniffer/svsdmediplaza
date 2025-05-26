
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
  "Cold & Flu": "/category/cold-flu", // Added Cold & Flu dedicated page
  // Add other categories with dedicated pages here
};

export function SecondaryNavbar() {
  const navLinks = [
    { href: '/products', label: 'All Products' },
    ...mockCategories.map(category => {
      const dedicatedPagePath = dedicatedCategoryPages[category];
      // Map "Vitamins & Supplements" from mockCategories to the "Nutritional Drinks & Supplements" page and label
      const label = category === "Vitamins & Supplements" ? "Nutritional Drinks & Supplements" : category;
      
      return {
        href: dedicatedPagePath || `/products?category=${encodeURIComponent(category)}`,
        label: label,
      };
    })
  ];

  // Filter out duplicates (e.g. if "Nutritional Drinks & Supplements" was already in mockCategories)
  // and the "Others" category link if it exists.
  const uniqueLabels = new Set<string>();
  const finalNavLinks = navLinks.filter(link => {
    if (link.label === "Others" || uniqueLabels.has(link.label)) {
      // Special handling if "Nutritional Drinks & Supplements" might be duplicated due to mapping
      if (link.label === "Nutritional Drinks & Supplements" && uniqueLabels.has(link.label)) {
        return false;
      }
      if (link.label !== "Nutritional Drinks & Supplements" && uniqueLabels.has(link.label)) {
          return false;
      }
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
