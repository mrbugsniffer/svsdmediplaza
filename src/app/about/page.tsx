
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Heart, Users, Lightbulb } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-xl shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">About svsdmediplaza</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your trusted partner in health and wellness, committed to providing accessible and affordable healthcare solutions.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-foreground">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground text-lg max-w-3xl mx-auto space-y-4">
            <Lightbulb size={48} className="mx-auto text-primary mb-4" />
            <p>
              To empower individuals to take control of their health by providing a comprehensive platform for all their pharmaceutical and wellness needs. We strive to make healthcare simple, accessible, and affordable for everyone, everywhere.
            </p>
            <p>
              We are dedicated to leveraging technology to bridge the gap between patients and quality healthcare services, ensuring a seamless and supportive experience.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
        <Card className="shadow-lg h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground"><Building size={28} className="text-accent" /> Our Story</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              Founded with the vision to revolutionize how healthcare is accessed, svsdmediplaza started as a small initiative to help local communities get their medications more easily. Over the years, we've grown into a leading online pharmacy, driven by our passion for health and our commitment to our customers.
            </p>
            <p>
              Our journey has been one of constant innovation, learning, and adaptation to meet the evolving needs of those we serve.
            </p>
          </CardContent>
        </Card>
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
            <img
                src="https://placehold.co/600x400.png"
                alt="Our team working"
                className="object-cover w-full h-full"
                data-ai-hint="team working office"
            />
        </div>
      </section>

      <section className="bg-muted py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: 'Customer First', description: 'We prioritize the needs and well-being of our customers above all else, ensuring a compassionate and supportive experience.' },
              { icon: Users, title: 'Integrity & Trust', description: 'We operate with the highest ethical standards, building trust through transparency and reliability in all our services.' },
              { icon: Lightbulb, title: 'Innovation', description: 'We continuously seek innovative solutions to enhance healthcare accessibility and improve user experience.' },
            ].map((value, index) => (
              <Card key={index} className="text-center shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <value.icon size={32} className="mx-auto text-primary mb-3" />
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
