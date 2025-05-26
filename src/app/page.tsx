
'use client';

import { HeroSection } from "@/components/home/hero-section";
import { QuickLinksSection } from "@/components/home/quick-links-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { HealthConditionsSection } from "@/components/home/health-conditions-section";
import { ProductCard } from "@/components/products/product-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";
import type { Product } from "@/types";
import { Package } from "lucide-react";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const productsCollectionRef = collection(db, 'products');
    const featuredQuery = query(productsCollectionRef, where('featured', '==', true), limit(5)); // Fetch 5 featured products
    
    const unsubscribe = onSnapshot(featuredQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setFeaturedProducts(productsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching featured products:", error);
      setIsLoading(false);
      // Optionally show a toast or error message to the user
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  return (
    <div className="space-y-10 md:space-y-16">
      <HeroSection />
      <QuickLinksSection />
      <PromoBanner />

      <section>
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Products</h2>
          <Button variant="outline" asChild>
            <Link href="/products">View All</Link>
          </Button>
        </div>
        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"> {/* Adjusted for 5 columns on lg */}
                {[...Array(5)].map((_, i) => ( // Show 5 skeletons
                    <div key={i} className="bg-card rounded-xl shadow-lg p-4 animate-pulse">
                        <div className="aspect-[4/3] bg-muted rounded mb-4"></div>
                        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-muted rounded w-1/3"></div>
                    </div>
                ))}
            </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"> {/* Adjusted for 5 columns on lg */}
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <Package size={32} className="mx-auto mb-2" />
            <p>No featured products available at the moment.</p>
          </div>
        )}
      </section>
      
      <HealthConditionsSection />
    </div>
  );
}
