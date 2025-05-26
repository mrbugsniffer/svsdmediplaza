
'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/products/product-card';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData, QuerySnapshot } from 'firebase/firestore';
import type { Product } from '@/types';
import { Package, FlaskConical } from 'lucide-react'; // Using FlaskConical as a representative icon

export default function NutritionalDrinksSupplementsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryName = "Nutritional Drinks & Supplements";

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const productsCollectionRef = collection(db, 'products');
    const categoryQuery = query(productsCollectionRef, where('category', '==', categoryName));

    const unsubscribe = onSnapshot(categoryQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setProducts(productsData);
      setIsLoading(false);
    }, (err: any) => {
      console.error(`Error fetching ${categoryName} products:`, err);
      setError(`Failed to fetch ${categoryName} products. Please try again later.`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [categoryName]);

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-gradient-to-r from-accent/20 via-secondary/10 to-background rounded-xl shadow-md">
        <FlaskConical size={48} className="mx-auto text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {categoryName}
        </h1>
        <p className="text-md text-muted-foreground mt-2">
          Boost your health with our range of nutritional drinks and supplements.
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
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <Package size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No Products Found in {categoryName}</h3>
          <p>We couldn&apos;t find any products in this category at the moment.</p>
        </div>
      )}
    </div>
  );
}
