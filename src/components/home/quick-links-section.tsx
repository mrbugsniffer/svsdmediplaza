'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Store, Upload, CalendarDays, ShieldCheck, FlaskConical } from 'lucide-react';
import Link from 'next/link';

const quickLinks = [
  {
    title: 'Pharmacy Near Me',
    subtitle: 'FIND STORE',
    icon: Store,
    bgColor: 'bg-teal-50 hover:bg-teal-100', // Approx #E0F2F1
    iconColor: 'text-teal-600', // Approx #00796B
    href: '#',
  },
  {
    title: 'Get 20%* off on Medicines',
    subtitle: 'UPLOAD NOW',
    icon: Upload,
    bgColor: 'bg-green-50 hover:bg-green-100', // Approx #E8F5E9
    iconColor: 'text-green-600', // Approx #388E3C
    href: '#',
  },
  {
    title: 'Doctor Appointment',
    subtitle: 'BOOK NOW',
    icon: CalendarDays,
    bgColor: 'bg-purple-50 hover:bg-purple-100', // Approx #EDE7F6 (accent color)
    iconColor: 'text-purple-600', // Approx #5E35B1
    href: '#',
  },
  {
    title: 'Health Insurance',
    subtitle: 'EXPLORE PLANS',
    icon: ShieldCheck,
    bgColor: 'bg-orange-50 hover:bg-orange-100', // Approx #FFF3E0
    iconColor: 'text-orange-600', // Approx #F57C00
    href: '#',
    new: true,
  },
  {
    title: 'Lab Tests',
    subtitle: 'AT HOME',
    icon: FlaskConical,
    bgColor: 'bg-pink-50 hover:bg-pink-100', // Approx #FCE4EC
    iconColor: 'text-pink-600', // Approx #D81B60
    href: '#',
  },
];

export function QuickLinksSection() {
  return (
    <section className="py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickLinks.map((link) => (
          <Link href={link.href} key={link.title} className="block group">
            <Card className={`h-full transition-all duration-200 ease-in-out group-hover:shadow-xl ${link.bgColor} border-transparent`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <link.icon size={28} className={`${link.iconColor}`} />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground leading-tight flex items-center">
                      {link.title}
                      {link.new && <span className="ml-1.5 text-[10px] bg-red-500 text-white px-1 py-0.5 rounded-sm">New</span>}
                    </h3>
                    <p className="text-xs text-muted-foreground">{link.subtitle}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
