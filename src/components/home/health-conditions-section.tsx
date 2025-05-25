'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity, HeartPulse, Wind, Users2, Accessibility, ShieldPlus } from 'lucide-react';
import Link from 'next/link';

// SVGs for icons not in Lucide, matching the style
const StomachIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 4A5.5 5.5 0 0 0 4.5 9.5V15a1 1 0 0 0 1 1h2.27a1 1 0 0 1 .9.54l1.06 1.92a1 1 0 0 0 1.74 0l1.06-1.92A1 1 0 0 1 13.23 16H18a1 1 0 0 0 1-1v-2.5A5.5 5.5 0 0 0 14 4c-2.5 0-2.5 2-3.5 2S10.5 4 10 4Z" />
    <path d="M7.5 12c.73-.85 1.66-1.42 2.74-1.76" />
  </svg>
);

const PainReliefIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v7"/>
    <path d="M12 14s-3 2.5-3 4.5h6c0-2-3-4.5-3-4.5z"/>
    <path d="M14.5 11.5c0-1.5-1-2.5-2.5-2.5s-2.5 1-2.5 2.5"/>
    <line x1="11" y1="16" x2="13" y2="16"/>
  </svg>
);

const LiverIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 6.5C14.5 5.56 13.64 4.5 12.5 4.5S10.5 5.56 10.5 6.5C10.5 9.31 8 11 8 13.5c0 2.25 1.75 3.5 4.5 3.5s4.5-1.25 4.5-3.5c0-2.5-2.5-4.19-2.5-7Z"/>
    <path d="M18 10c1.1 0 2 .9 2 2s-.9 2-2 2"/>
    <path d="M5 12s1.5-2 3.5-2"/>
  </svg>
);

const ToothIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.69 15.91C20.93 14.53 21 13.22 21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9c0 1.22.07 2.53.31 3.91"/>
    <path d="M7 20l2.5-2.5.01-.01"/>
    <path d="M17 20l-2.5-2.5"/>
    <path d="M12 13c-1.48 1.48-2.54 3.43-2.93 5.71"/>
    <path d="M14.93 18.71c-.39-2.28-1.45-4.23-2.93-5.71"/>
  </svg>
);


const healthConditions = [
  { name: 'Diabetes Care', icon: Activity, href: '#' },
  { name: 'Cardiac Care', icon: HeartPulse, href: '#' },
  { name: 'Stomach Care', icon: StomachIcon, href: '#' },
  { name: 'Pain Relief', icon: PainReliefIcon, href: '#' },
  { name: 'Liver Care', icon: LiverIcon, href: '#' },
  { name: 'Oral Care', icon: ToothIcon, href: '#' },
  { name: 'Respiratory', icon: Wind, href: '#' },
  { name: 'Sexual Health', icon: Users2, href: '#' },
  { name: 'Elderly Care', icon: Accessibility, href: '#' },
  { name: 'Cold & Immunity', icon: ShieldPlus, href: '#' },
];

export function HealthConditionsSection() {
  return (
    <section className="py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8 text-center md:text-left">Browse by Health Conditions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {healthConditions.map((condition) => (
          <Link href={condition.href} key={condition.name} className="block group">
            <Card className="transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:border-primary/50 h-full">
              <CardContent className="p-3 md:p-4 flex flex-col items-center justify-center text-center aspect-square">
                <condition.icon className="w-8 h-8 md:w-10 md:h-10 mb-2 text-primary" />
                <p className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors">{condition.name}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
