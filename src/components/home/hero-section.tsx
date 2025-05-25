
'use client';

import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative py-10 md:py-16 rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: '#0A4948' }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left Illustration */}
          <div className="hidden md:block">
            <Image 
              src="https://placehold.co/250x200.png" 
              alt="Healthcare professionals" 
              width={250} 
              height={200} 
              className="opacity-80 object-cover rounded"
              data-ai-hint="doctor illustration"
            />
          </div>

          {/* Center Content */}
          <div className="text-center md:w-1/2">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Buy Medicines and Essentials
            </h1>
            <div className="relative max-w-lg mx-auto">
              <Input
                type="search"
                placeholder="Search Medicines"
                className="w-full h-12 md:h-14 pl-12 pr-4 text-base rounded-md border-none bg-white text-foreground placeholder-muted-foreground"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Right Illustration */}
          <div className="hidden md:block">
            <Image 
              src="https://placehold.co/250x200.png" 
              alt="Medical supplies" 
              width={250} 
              height={200} 
              className="opacity-80 object-cover rounded"
              data-ai-hint="patient illustration"
            />
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-5 left-10 opacity-20 hidden md:block">
        <Image src="https://placehold.co/60x60.png" alt="Pill icon" width={60} height={60} className="object-cover rounded" data-ai-hint="medicine pill"/>
      </div>
      <div className="absolute bottom-5 right-10 opacity-20 hidden md:block">
         <Image src="https://placehold.co/50x50.png" alt="Medical cross icon" width={50} height={50} className="object-cover rounded" data-ai-hint="medical cross"/>
      </div>
    </section>
  );
}
