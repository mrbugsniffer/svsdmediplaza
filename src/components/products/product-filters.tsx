
'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '../ui/input';

export interface Filters {
  category: string;
  brand: string;
  priceRange: [number, number];
  searchQuery: string;
}

interface ProductFiltersProps {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  maxPrice: number;
  categories: string[]; 
  brands: string[];     
}

export function ProductFilters({ filters, setFilters, maxPrice, categories, brands }: ProductFiltersProps) {
  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({ ...prev, category: value === 'all' ? '' : value }));
  };

  const handleBrandChange = (value: string) => {
    setFilters((prev) => ({ ...prev, brand: value === 'all' ? '' : value }));
  };

  const handlePriceChange = (value: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: value }));
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: event.target.value }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      brand: '',
      priceRange: [0, maxPrice],
      searchQuery: '',
    });
  };

  return (
    <aside className="space-y-3 p-3 bg-card rounded-xl shadow-lg"> {/* Reduced padding and space-y */}
      <h3 className="text-base font-semibold text-foreground mb-2">Filters</h3> {/* Reduced margin and font size */}
      
      <div>
        <Label htmlFor="search" className="text-xs font-medium">Search Products</Label> {/* Reduced font size */}
        <Input
          id="search"
          type="text"
          placeholder="Search name or description..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          className="mt-1 h-8 text-xs" /* Reduced height and font size */
        />
      </div>

      <div>
        <Label htmlFor="category" className="text-xs font-medium">Category</Label>
        <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger id="category" className="mt-1 h-8 text-xs"> {/* Reduced height and font size */}
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="brand" className="text-xs font-medium">Brand</Label>
        <Select value={filters.brand || 'all'} onValueChange={handleBrandChange}>
          <SelectTrigger id="brand" className="mt-1 h-8 text-xs"> {/* Reduced height and font size */}
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-medium">Price Range</Label>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"> {/* Reduced font size */}
          <span>₹{filters.priceRange[0]}</span>
          <span>₹{filters.priceRange[1] > maxPrice ? maxPrice : filters.priceRange[1]}</span>
        </div>
        <Slider
          min={0}
          max={maxPrice}
          step={1}
          value={[filters.priceRange[0], filters.priceRange[1] > maxPrice ? maxPrice : filters.priceRange[1]]}
          onValueChange={handlePriceChange}
          className="mt-1.5" /* Reduced margin */
          minStepsBetweenThumbs={1}
        />
      </div>

      <Button onClick={resetFilters} variant="outline" size="xs" className="w-full h-8 text-xs"> {/* Custom smaller size */}
        Reset Filters
      </Button>
    </aside>
  );
}
