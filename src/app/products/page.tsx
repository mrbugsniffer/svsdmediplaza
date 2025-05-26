
'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/products/product-card';
import { ProductFilters, type Filters } from '@/components/products/product-filters';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Package } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import type { Product } from '@/types';
import { mockCategories, mockBrands } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'next/navigation';

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'featured' | 'rating';

const INITIAL_MAX_PRICE = 500; // Default initial max price

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [maxPrice, setMaxPrice] = useState(INITIAL_MAX_PRICE);
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    category: '',
    brand: '',
    priceRange: [0, INITIAL_MAX_PRICE],
    searchQuery: '',
  });
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    // No React.use() needed for useSearchParams() here
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setFilters(prevFilters => ({ ...prevFilters, category: categoryFromUrl }));
    }
  }, [searchParams]);

  const isMobile = useIsMobile();

  useEffect(() => {
    setIsLoading(true);
    const productsCollectionRef = collection(db, 'products');

    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setAllProducts(productsData);

      if (productsData.length > 0) {
        const newMaxPrice = Math.max(...productsData.map(p => p.price).filter(p => typeof p === 'number'), INITIAL_MAX_PRICE);
        setMaxPrice(newMaxPrice);
        // Update priceRange filter only if the current max is lower than newMaxPrice
        // or if it's still at the initial default, to avoid overriding user's selection unnecessarily.
        setFilters(prevFilters => ({
            ...prevFilters,
            priceRange: [prevFilters.priceRange[0], Math.max(prevFilters.priceRange[1] === INITIAL_MAX_PRICE ? newMaxPrice : prevFilters.priceRange[1], newMaxPrice)]
        }));
      } else {
        setMaxPrice(INITIAL_MAX_PRICE);
         setFilters(prevFilters => ({
            ...prevFilters,
            priceRange: [0, INITIAL_MAX_PRICE] // Reset to default if no products
        }));
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      toast({ title: "Error", description: "Could not fetch products.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  const filteredProducts = useMemo(() => {
    let products = [...allProducts];
    const standardMockCategories = mockCategories.filter(c => c !== "Others");

    products = products.filter(product => {
      const searchLower = filters.searchQuery.toLowerCase();
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const descriptionMatch = product.description?.toLowerCase().includes(searchLower) || false;
      
      const categoryMatch =
        filters.category === ''
          ? true
          : filters.category === 'Others'
          ? (product.category && !standardMockCategories.includes(product.category))
          : product.category === filters.category;
      
      const brandMatch = filters.brand ? product.brand === filters.brand : true;
      const priceMatch = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      
      return (nameMatch || descriptionMatch) && categoryMatch && brandMatch && priceMatch;
    });

    switch (sortOption) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        products.sort((a,b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'featured':
      default:
        products.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.name.localeCompare(b.name));
        break;
    }
    return products;
  }, [allProducts, filters, sortOption]);

  if (!isClient) {
    // Basic skeleton for SSR or initial load before client takes over
    return (
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/4 animate-pulse">
          <div className="p-4 bg-card rounded-xl shadow-lg h-80"></div>
        </div>
        <div className="w-full lg:w-3/4">
          <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl shadow-lg p-2 animate-pulse h-60"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filtersComponent = <ProductFilters filters={filters} setFilters={setFilters} maxPrice={maxPrice} categories={mockCategories} brands={mockBrands} />;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Products</h1>

      <div className="flex flex-col lg:flex-row gap-4">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden mb-3 w-full h-9 text-sm">
                <Filter size={16} className="mr-2" /> Filters & Sort
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs overflow-y-auto p-0">
              <div className="p-3 border-b">
                 <h3 className="text-base font-semibold text-foreground">Sort By</h3>
                 <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <SelectTrigger className="w-full mt-1 h-9 text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filtersComponent}
            </SheetContent>
          </Sheet>
        ) : (
          <div className="w-full lg:w-1/4 lg:sticky lg:top-20 self-start">
            {filtersComponent}
          </div>
        )}

        <div className="w-full lg:w-3/4">
          {!isMobile && (
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2 p-2 bg-card rounded-lg shadow-sm">
              <p className="text-muted-foreground text-xs">Showing {filteredProducts.length} of {allProducts.length} products</p>
              <div className="flex items-center gap-2">
                  <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                    <SelectTrigger className="w-[150px] h-8 text-xs">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                      <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </div>
          )}

          {isLoading ? (
             <div className="flex justify-center items-center py-16">
                <Package size={40} className="animate-pulse mr-3 text-primary" />
                <p className="text-lg text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"> {/* Reduced gap */}
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package size={40} className="mx-auto text-muted-foreground mb-3" />
              <h3 className="text-xl font-semibold text-foreground mb-1">No Products Found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your filters or search term.</p>
              {filters.searchQuery && <p className="text-xs text-muted-foreground mt-1">Search: "{filters.searchQuery}"</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
