
'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function HeroSection() {
  return (
    <section
      className="relative py-10 md:py-16 rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900"
      data-ai-hint="dark modern abstract background"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center">
          {/* Center Content */}
          <div className="text-center md:w-3/4 lg:w-2/3 xl:w-1/2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100 mb-8 md:mb-10">
              Buy Medicines and Essentials
            </h1>
            <div className="relative max-w-xl mx-auto">
              <Input
                type="search"
                placeholder="Search Medicines, Health Products, and More"
                className="w-full h-12 md:h-14 pl-12 pr-4 text-base rounded-md border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 shadow-md focus-visible:ring-2 focus-visible:ring-primary/70"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
