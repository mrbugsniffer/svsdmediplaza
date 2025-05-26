
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
  "Eye Care": "/category/eye-care", // Added Eye Care dedicated page
  // Add other categories with dedicated pages here
};

export function SecondaryNavbar() {
  const navLinks = [
    { href: '/products', label: 'All Products' },
    ...mockCategories.map(category => {
      const dedicatedPagePath = dedicatedCategoryPages[category];
      // Map "Vitamins & Supplements" from mockCategories to the "Nutritional Drinks & Supplements" page and label
      // This mapping is no longer strictly needed as we updated mockCategories, but kept for robustness.
      const label = category === "Vitamins & Supplements" ? "Nutritional Drinks & Supplements" : category;
      
      return {
        href: dedicatedPagePath || `/products?category=${encodeURIComponent(category)}`,
        label: label,
      };
    })
  ];

  const uniqueLabels = new Set<string>();
  const finalNavLinks = navLinks.filter(link => {
    if (link.label === "Others" || uniqueLabels.has(link.label)) {
      // Handle specific case for Nutritional Drinks if it was mapped from Vitamins & Supplements
      // and also existed as "Nutritional Drinks & Supplements" in mockCategories.
      if (link.label === "Nutritional Drinks & Supplements" && uniqueLabels.has(link.label)) {
        // Only allow it once. If the dedicated page is `/category/nutritional-drinks-supplements`,
        // and this link also points there, it's a duplicate.
        // This logic might need refinement based on exact mockCategories content if duplicates are complex.
        // For now, simple label check.
        return false;
      }
      // General duplicate label check
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
