
'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function HeroSection() {
  return (
    <section
      className="relative py-16 md:py-24 rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-accent/70 via-muted/50 to-background"
      data-ai-hint="modern abstract background"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center">
          {/* Center Content */}
          <div className="text-center md:w-3/4 lg:w-2/3 xl:w-1/2"> {/* Adjusted width for better centering */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8 md:mb-10"> {/* Increased bottom margin */}
              Buy Medicines and Essentials
            </h1>
            <div className="relative max-w-xl mx-auto">
              <Input
                type="search"
                placeholder="Search Medicines, Health Products, and More"
                className="w-full h-12 md:h-14 pl-12 pr-4 text-base rounded-md border-input bg-card text-foreground placeholder-muted-foreground shadow-md focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
