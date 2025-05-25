
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
  categories: string[]; // Pass categories for dropdown
  brands: string[];     // Pass brands for dropdown
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
    <aside className="space-y-4 p-4 bg-card rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-foreground">Filters</h3>
      
      <div>
        <Label htmlFor="search" className="text-sm font-medium">Search Products</Label>
        <Input
          id="search"
          type="text"
          placeholder="Search by name or description..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          className="mt-1 h-9 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="category" className="text-sm font-medium">Category</Label>
        <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger id="category" className="mt-1 h-9 text-sm">
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
        <Label htmlFor="brand" className="text-sm font-medium">Brand</Label>
        <Select value={filters.brand || 'all'} onValueChange={handleBrandChange}>
          <SelectTrigger id="brand" className="mt-1 h-9 text-sm">
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
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1] > maxPrice ? maxPrice : filters.priceRange[1]}</span>
        </div>
        <Slider
          min={0}
          max={maxPrice}
          step={1}
          value={[filters.priceRange[0], filters.priceRange[1] > maxPrice ? maxPrice : filters.priceRange[1]]}
          onValueChange={handlePriceChange}
          className="mt-2"
          minStepsBetweenThumbs={1}
        />
      </div>

      <Button onClick={resetFilters} variant="outline" size="sm" className="w-full">
        Reset Filters
      </Button>
    </aside>
  );
}
