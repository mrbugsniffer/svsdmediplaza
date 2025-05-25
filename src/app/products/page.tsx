'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/products/product-card';
import { ProductFilters, type Filters } from '@/components/products/product-filters';
import { mockProducts } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, LayoutGrid, List } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'featured';

const MAX_PRICE = Math.max(...mockProducts.map(p => p.price), 100); // Fallback to 100 if no products

export default function ProductsPage() {
  const [filters, setFilters] = useState<Filters>({
    category: '',
    brand: '',
    priceRange: [0, MAX_PRICE],
    searchQuery: '',
  });
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isMobile = useIsMobile();

  const filteredProducts = useMemo(() => {
    let products = mockProducts.filter(product => {
      const searchLower = filters.searchQuery.toLowerCase();
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const descriptionMatch = product.description.toLowerCase().includes(searchLower);
      const categoryMatch = filters.category ? product.category === filters.category : true;
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
      case 'featured':
        products.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.name.localeCompare(b.name));
        break;
    }
    return products;
  }, [filters, sortOption]);

  if (!isClient) {
    // Render basic loading state or skeleton for SSR/prerender
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4">
          <div className="p-6 bg-card rounded-xl shadow-lg animate-pulse">
            <div className="h-8 bg-muted rounded w-1/2 mb-6"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2 mb-4">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            ))}
            <div className="h-10 bg-muted rounded w-full mt-6"></div>
          </div>
        </div>
        <div className="w-full lg:w-3/4">
          <div className="h-10 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl shadow-lg p-4 animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded mb-4"></div>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }


  const filtersComponent = <ProductFilters filters={filters} setFilters={setFilters} maxPrice={MAX_PRICE} />;

  return (
    <div>
      <h1 className="text-4xl font-bold text-foreground mb-8">Our Products</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden mb-4 w-full">
                <Filter size={18} className="mr-2" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm overflow-y-auto">
              {filtersComponent}
            </SheetContent>
          </Sheet>
        ) : (
          <div className="w-full lg:w-1/4 lg:sticky lg:top-24 self-start">
            {filtersComponent}
          </div>
        )}

        <div className="w-full lg:w-3/4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 p-4 bg-card rounded-lg shadow">
            <p className="text-muted-foreground text-sm">Showing {filteredProducts.length} products</p>
            <div className="flex items-center gap-2">
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>
                 <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
                    <LayoutGrid size={20} />
                </Button>
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
                    <List size={20} />
                </Button>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-foreground mb-2">No Products Found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
