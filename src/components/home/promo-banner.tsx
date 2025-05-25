'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PromoBanner() {
  return (
    <section className="relative bg-slate-800 text-white py-8 md:py-12 rounded-xl shadow-xl overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              Save Up to <span style={{color: '#FDD835'}}>25%</span> on Your Medicine Spends
            </h2>
            <p className="text-lg sm:text-xl mb-6">
              With <span className="font-semibold" style={{color: '#FDD835'}}>Apollo SBI Card SELECT</span>
            </p>
            <Button
              asChild
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold shadow-md hover:shadow-lg transition-shadow px-8 py-3"
              style={{backgroundColor: '#BFA06A'}}
            >
              <Link href="#">Apply Now</Link>
            </Button>
          </div>
          <div className="md:w-1/2 flex flex-col items-center md:items-end">
            <Image
              src="https://placehold.co/400x250.png" // Replace with actual card image
              alt="Apollo SBI Credit Card"
              width={350}
              height={219}
              className="rounded-lg shadow-2xl mb-4 md:mb-0"
              data-ai-hint="credit card bank"
            />
            <p className="text-sm italic mt-2 self-end opacity-80">Health Meets Happiness</p>
          </div>
        </div>
      </div>
      {/* Optional: subtle background pattern */}
      <div 
        className="absolute inset-0 opacity-5" 
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/diagmonds.png')"
        }}
        data-ai-hint="geometric pattern"
      ></div>
    </section>
  );
}
