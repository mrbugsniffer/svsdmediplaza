
'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/products/product-card';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData, QuerySnapshot } from 'firebase/firestore';
import type { Product } from '@/types';
import { Package, Baby } from 'lucide-react';

export default function BabyCareProductsPage() {
  const [babyCareProducts, setBabyCareProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryName = "Baby Care";

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const productsCollectionRef = collection(db, 'products');
    const babyCareQuery = query(productsCollectionRef, where('category', '==', categoryName));

    const unsubscribe = onSnapshot(babyCareQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setBabyCareProducts(productsData);
      setIsLoading(false);
    }, (err: any) => {
      console.error(`Error fetching ${categoryName} products:`, err);
      setError(`Failed to fetch ${categoryName} products. Please try again later.`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [categoryName]);

  return (
    <div className="space-y-6"> {/* Reduced overall vertical spacing */}
      <section className="text-center py-6 bg-gradient-to-r from-accent/20 via-secondary/10 to-background rounded-xl shadow-md"> {/* Reduced vertical padding */}
        <Baby size={36} className="mx-auto text-primary mb-3" /> {/* Reduced icon size and margin */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground"> {/* Reduced heading size */}
          {categoryName} Essentials
        </h1>
        <p className="text-sm text-muted-foreground mt-2"> {/* Reduced paragraph text size */}
          Everything you need for your little one&apos;s comfort and health.
        </p>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3"> {/* Adjusted skeleton to match 5 cols, reduced grid gap */}
          {[...Array(5)].map((_, i) => ( // Show 5 skeletons for xl view
            <div key={i} className="bg-card rounded-md shadow-sm p-1.5 animate-pulse flex flex-col h-[220px] sm:h-[240px]"> {/* Adjusted skeleton height and structure */}
              <div className="aspect-square bg-muted rounded-sm mb-1 w-full"></div>
              <div className="h-3 bg-muted rounded w-3/4 mb-1"></div> {/* Skeleton for Name */}
              <div className="h-3 bg-muted rounded w-1/2 mb-1.5"></div> {/* Skeleton for Price */}
              <div className="h-5 bg-muted rounded w-full mt-auto"></div> {/* Skeleton for Button */}
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive"> {/* Adjusted vertical padding */}
          <Package size={36} className="mx-auto mb-3" /> {/* Reduced icon size and margin */}
          <h3 className="text-xl font-semibold mb-2">Error Loading Products</h3> {/* Reduced heading size */}
          <p>{error}</p>
        </div>
      ) : babyCareProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3"> {/* Ensure 5 columns on xl, reduced gap */}
          {babyCareProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground"> {/* Adjusted vertical padding */}
          <Package size={36} className="mx-auto mb-3" /> {/* Reduced icon size and margin */}
          <h3 className="text-xl font-semibold mb-2">No Products Found in {categoryName}</h3> {/* Reduced heading size */}
          <p>We couldn&apos;t find any products in this category at the moment.</p>
        </div>
      )}
    </div>
  );
}
