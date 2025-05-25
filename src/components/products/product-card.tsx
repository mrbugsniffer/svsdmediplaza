
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block group">
          <div className="aspect-square relative w-full overflow-hidden"> {/* Changed aspect ratio */}
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={`${product.category ? product.category.toLowerCase() : 'product'} ${product.brand ? product.brand.toLowerCase() : ''}`}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-2 flex-grow flex flex-col"> {/* Reduced padding */}
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-sm font-semibold mb-0.5 hover:text-primary transition-colors line-clamp-1">{product.name}</CardTitle> {/* Reduced font size, margin, added line-clamp */}
        </Link>
        <CardDescription className="text-[11px] text-muted-foreground mb-1 line-clamp-1">{product.description || 'No description available.'}</CardDescription> {/* Reduced font size, margin, line-clamp, added fallback */}
        <div className="text-[10px] text-muted-foreground mb-0.5"> {/* Reduced font size and margin */}
          <span className="font-medium text-foreground">{product.brand}</span> - <span>{product.category}</span>
        </div>
        {product.rating && (
          <div className="flex items-center gap-0.5 text-amber-500 mb-0.5"> {/* Reduced gap and margin */}
            {[...Array(Math.floor(product.rating))].map((_, i) => (
              <Star key={i} size={12} fill="currentColor" /> {/* Reduced icon size */}
            ))}
            {product.rating % 1 !== 0 && <Star size={12} />} {/* Reduced icon size */}
            {[...Array(5 - Math.ceil(product.rating))].map((_, i) => (
              <Star key={`empty-${i}`} size={12} className="text-muted-foreground opacity-50" /> {/* Reduced icon size */}
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">({product.rating.toFixed(1)})</span> {/* Reduced font size */}
          </div>
        )}
        <p className="text-base font-semibold text-primary mt-auto pt-1">${product.price ? product.price.toFixed(2) : '0.00'}</p> {/* Reduced font size, padding-top, added price fallback */}
      </CardContent>
      <CardFooter className="p-2 border-t"> {/* Reduced padding */}
        <Button 
          onClick={handleAddToCart} 
          size="sm" 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs"  // Added text-xs for button
          disabled={product.stock === 0}
        >
          <ShoppingCart size={14} className="mr-1" /> {/* Reduced icon size and margin */}
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
