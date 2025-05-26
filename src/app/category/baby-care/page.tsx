
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
    <div className="space-y-6"> 
      <section className="text-center py-6 bg-gradient-to-r from-accent/20 via-secondary/10 to-background rounded-xl shadow-md"> 
        <Baby size={36} className="mx-auto text-primary mb-3" /> 
        <h1 className="text-2xl md:text-3xl font-bold text-foreground"> 
          {categoryName} Essentials
        </h1>
        <p className="text-sm text-muted-foreground mt-2"> 
          Everything you need for your little one&apos;s comfort and health.
        </p>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"> 
          {[...Array(5)].map((_, i) => ( 
            <div key={i} className="bg-card rounded-md shadow-sm p-1.5 animate-pulse flex flex-col h-[220px] sm:h-[240px]"> 
              <div className="aspect-square bg-muted rounded-sm mb-1 w-full"></div>
              <div className="h-3 bg-muted rounded w-3/4 mb-1"></div> 
              <div className="h-3 bg-muted rounded w-1/2 mb-1.5"></div> 
              <div className="h-5 bg-muted rounded w-full mt-auto"></div> 
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive"> 
          <Package size={36} className="mx-auto mb-3" /> 
          <h3 className="text-xl font-semibold mb-2">Error Loading Products</h3> 
          <p>{error}</p>
        </div>
      ) : babyCareProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"> 
          {babyCareProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground"> 
          <Package size={36} className="mx-auto mb-3" /> 
          <h3 className="text-xl font-semibold mb-2">No Products Found in {categoryName}</h3> 
          <p>We couldn&apos;t find any products in this category at the moment.</p>
        </div>
      )}
    </div>
  );
}
