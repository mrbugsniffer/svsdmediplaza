
'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/products/product-card';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData, QuerySnapshot } from 'firebase/firestore';
import type { Product } from '@/types';
import { Package, Baby } from 'lucide-react'; // Using Baby as a representative icon

export default function BabyCareProductsPage() {
  const [babyCareProducts, setBabyCareProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const productsCollectionRef = collection(db, 'products');
    const babyCareQuery = query(productsCollectionRef, where('category', '==', 'Baby Care'));

    const unsubscribe = onSnapshot(babyCareQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setBabyCareProducts(productsData);
      setIsLoading(false);
    }, (err: any) => {
      console.error("Error fetching Baby Care products:", err);
      setError("Failed to fetch Baby Care products. Please try again later.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-gradient-to-r from-accent/20 via-secondary/10 to-background rounded-xl shadow-md">
        <Baby size={48} className="mx-auto text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Baby Care Essentials
        </h1>
        <p className="text-md text-muted-foreground mt-2">
          Everything you need for your little one&apos;s comfort and health.
        </p>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl shadow-lg p-4 animate-pulse">
              <div className="aspect-square bg-muted rounded mb-3"></div>
              <div className="h-5 bg-muted rounded w-3/4 mb-1.5"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-1.5"></div>
              <div className="h-3 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-7 bg-muted rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-destructive">
          <Package size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Error Loading Products</h3>
          <p>{error}</p>
        </div>
      ) : babyCareProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {babyCareProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <Package size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No Baby Care Products Found</h3>
          <p>We couldn&apos;t find any products in this category at the moment.</p>
        </div>
      )}
    </div>
  );
}
