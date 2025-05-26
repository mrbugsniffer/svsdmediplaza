
'use client';

import { useState, useMemo, useEffect, use } from 'react';
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

const INITIAL_MAX_PRICE = 500;

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [maxPrice, setMaxPrice] = useState(INITIAL_MAX_PRICE);
  const searchParamsPromise = useSearchParams(); // Get the promise-like searchParams
  const resolvedSearchParams = use(searchParamsPromise); // Unwrap with React.use()

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
    const categoryFromUrl = resolvedSearchParams.get('category');
    if (categoryFromUrl) {
      setFilters(prevFilters => ({ ...prevFilters, category: categoryFromUrl }));
    }
  }, [resolvedSearchParams]); // Depend on resolvedSearchParams

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
        setFilters(prevFilters => ({
            ...prevFilters,
            priceRange: [prevFilters.priceRange[0], Math.max(prevFilters.priceRange[1], newMaxPrice)]
        }));
      } else {
        setMaxPrice(INITIAL_MAX_PRICE);
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
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4 animate-pulse">
          <div className="p-4 bg-card rounded-xl shadow-lg h-96"></div>
        </div>
        <div className="w-full lg:w-3/4">
          <div className="h-10 bg-muted rounded w-1/3 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Products</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden mb-4 w-full">
                <Filter size={18} className="mr-2" /> Filters & Sort
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-0">
              <div className="p-4 border-b">
                 <h3 className="text-lg font-semibold text-foreground">Sort By</h3>
                 <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <SelectTrigger className="w-full mt-2">
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
          <div className="w-full lg:w-1/4 lg:sticky lg:top-24 self-start">
            {filtersComponent}
          </div>
        )}

        <div className="w-full lg:w-3/4">
          {!isMobile && (
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 p-3 bg-card rounded-lg shadow">
              <p className="text-muted-foreground text-xs sm:text-sm">Showing {filteredProducts.length} of {allProducts.length} products</p>
              <div className="flex items-center gap-2">
                  <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                    <SelectTrigger className="w-[160px] sm:w-[180px] h-9 text-xs sm:text-sm">
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
             <div className="flex justify-center items-center py-20">
                <Package size={48} className="animate-pulse mr-4 text-primary" />
                <p className="text-xl text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-2">No Products Found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
              {filters.searchQuery && <p className="text-sm text-muted-foreground mt-1">Search: "{filters.searchQuery}"</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
