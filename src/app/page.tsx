import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { mockProducts } from "@/lib/mock-data";
import Link from "next/link";
import Image from "next/image";
import { Pill } from "lucide-react";

export default function HomePage() {
  const featuredProducts = mockProducts.filter(p => p.featured).slice(0, 4);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/20 via-background to-background py-16 md:py-24 rounded-xl shadow-lg overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Pill size={64} className="mx-auto mb-6 text-primary animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Welcome to <span className="text-primary">PharmaFlow</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your trusted source for quality pharmaceutical products. Health, delivered to your doorstep.
          </p>
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-shadow">
            <Link href="/products">Shop All Products</Link>
          </Button>
        </div>
        <div className="absolute inset-0 opacity-10">
           <Image src="https://placehold.co/1200x400.png" alt="Pharmacy background" layout="fill" objectFit="cover" data-ai-hint="pharmacy healthcare" />
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {featuredProducts.length === 0 && (
          <p className="text-center text-muted-foreground">No featured products available at the moment.</p>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 bg-card rounded-xl shadow-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Why Choose PharmaFlow?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Quality Assured</h3>
              <p className="text-muted-foreground">All products are sourced from reputable manufacturers and verified for quality.</p>
            </div>
            <div className="p-6">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Convenient Delivery</h3>
              <p className="text-muted-foreground">Fast and reliable shipping right to your doorstep.</p>
            </div>
            <div className="p-6">
             <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">Your personal and payment information is always protected.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
