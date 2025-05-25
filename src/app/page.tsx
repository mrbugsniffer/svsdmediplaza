import { HeroSection } from "@/components/home/hero-section";
import { QuickLinksSection } from "@/components/home/quick-links-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { HealthConditionsSection } from "@/components/home/health-conditions-section";
import { ProductCard } from "@/components/products/product-card";
import { mockProducts } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const featuredProducts = mockProducts.filter(p => p.featured).slice(0, 4);

  return (
    <div className="space-y-10 md:space-y-16">
      <HeroSection />
      <QuickLinksSection />
      <PromoBanner />

      {/* Featured Products Section - Kept from original, can be styled or removed if needed */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Products</h2>
            <Button variant="outline" asChild>
              <Link href="/products">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
      
      <HealthConditionsSection />
    </div>
  );
}
