
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
    if (!product) return;
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name || 'Product'} has been added to your cart.`,
    });
  };

  if (!product) {
    // Or render a placeholder/skeleton
    return null;
  }

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-md hover:shadow-lg transition-shadow duration-200 rounded-md group">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id || '#'}`} className="block group">
          <div className="aspect-square relative w-full overflow-hidden rounded-t-md">
            <Image
              src={product.imageUrl || 'https://placehold.co/300x300.png'}
              alt={product.name || 'Product Image'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={`${product.category ? product.category.toLowerCase() : 'product'} ${product.brand ? product.brand.toLowerCase() : ''}`}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-1.5 flex-grow flex flex-col">
        <Link href={`/products/${product.id || '#'}`} className="block">
          <CardTitle className="text-sm font-semibold mb-0.5 hover:text-primary transition-colors line-clamp-1">
            {product.name || 'Unnamed Product'}
          </CardTitle>
        </Link>
        {/* Description removed as per previous request */}
        <div className="text-[10px] text-muted-foreground mt-0.5 mb-0.5">
          <span className="font-medium text-foreground">{product.brand || 'N/A'}</span> - <span className="italic">{product.category || 'N/A'}</span>
        </div>
        {/* Rating display removed as per previous request */}
        <p className="text-xs font-semibold text-primary mt-auto pt-0.5">
          ₹{product.price ? product.price.toFixed(2) : '0.00'}
        </p>
      </CardContent>
      <CardFooter className="p-1 border-t">
        <Button
          onClick={handleAddToCart}
          variant="ghost"
          size="sm"
          className="w-full h-6 text-[10px] text-primary hover:bg-primary/10 hover:text-primary"
          disabled={!product.stock || product.stock === 0}
        >
          <ShoppingCart size={10} className="mr-1" />
          {product.stock && product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
