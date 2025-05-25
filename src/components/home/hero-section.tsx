
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
              src="https://images.unsplash.com/photo-1579762714453-51d9913984e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxkb2N0b3IlMjBpbGx1c3RyYXRpb258ZW58MHx8fHwxNzQ4MTYxNTg0fDA&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="Healthcare professionals" 
              width={250} 
              height={200} 
              className="opacity-80 object-cover rounded"
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
              src="https://images.unsplash.com/photo-1582201957428-5ff47ff7605c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxwYXRpZW50JTIwaWxsdXN0cmF0aW9ufGVufDB8fHx8MTc0ODE2MTU4NHww&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="Medical supplies" 
              width={250} 
              height={200} 
              className="opacity-80 object-cover rounded"
            />
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-5 left-10 opacity-20 hidden md:block">
        <Image src="https://images.unsplash.com/photo-1603982222981-20f4389264b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxtZWRpY2luZSUyMHBpbGx8ZW58MHx8fHwxNzQ4MTYxNTg0fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Pill icon" width={60} height={60} className="object-cover rounded"/>
      </div>
      <div className="absolute bottom-5 right-10 opacity-20 hidden md:block">
         <Image src="https://images.unsplash.com/photo-1561976167-fa9e36b104ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxtZWRpY2FsJTIwY3Jvc3N8ZW58MHx8fHwxNzQ4MTYxNTg0fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Medical cross icon" width={50} height={50} className="object-cover rounded"/>
      </div>
    </section>
  );
}
