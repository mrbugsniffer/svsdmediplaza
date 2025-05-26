
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name || 'Product'} has been added to your cart.`,
    });
  };

  if (!product) {
    return null;
  }

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block group">
          <div className="aspect-square relative w-full overflow-hidden">
            <Image
              src={product.imageUrl || 'https://placehold.co/300x300.png'}
              alt={product.name || 'Product Image'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={`${product.category ? product.category.toLowerCase() : 'product'} ${product.brand ? product.brand.toLowerCase() : ''}`}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-2 flex-grow flex flex-col">
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-sm font-semibold mb-0.5 hover:text-primary transition-colors line-clamp-1">
            {product.name || 'Unnamed Product'}
          </CardTitle>
        </Link>
        <CardDescription className="text-[11px] text-muted-foreground mb-1 line-clamp-1">
          {product.description || 'No description available.'}
        </CardDescription>
        <div className="text-[10px] text-muted-foreground mb-0.5">
          <span className="font-medium text-foreground">{product.brand || 'N/A Brand'}</span> - <span>{product.category || 'N/A Category'}</span>
        </div>
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-0.5 text-amber-500 mb-0.5">
            {[...Array(Math.floor(product.rating))].map((_, i) => (
              <Star key={`filled-${i}`} size={12} fill="currentColor" />
            ))}
            {product.rating % 1 !== 0 && <Star key="half" size={12} />}
            {[...Array(5 - Math.ceil(product.rating))].map((_, i) => (
              <Star key={`empty-${i}`} size={12} className="text-muted-foreground opacity-50" />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">({product.rating.toFixed(1)})</span>
          </div>
        )}
        <p className="text-base font-semibold text-primary mt-auto pt-1">
          ₹{product.price ? product.price.toFixed(2) : '0.00'}
        </p>
      </CardContent>
      <CardFooter className="p-2 border-t">
        <Button
          onClick={handleAddToCart}
          size="sm"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs"
          disabled={!product.stock || product.stock === 0}
        >
          <ShoppingCart size={14} className="mr-1" />
          {product.stock && product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
