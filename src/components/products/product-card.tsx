
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
    return null;
  }

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-md hover:shadow-lg transition-shadow duration-200 rounded-md group">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id || '#'}`} className="block">
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
      <CardContent className="p-2 flex-grow flex flex-col">
        <Link href={`/products/${product.id || '#'}`} className="block">
          <CardTitle className="text-xs font-semibold mb-0.5 hover:text-primary transition-colors line-clamp-1">
            {product.name || 'Unnamed Product'}
          </CardTitle>
        </Link>
        {/* <CardDescription className="text-[10px] text-muted-foreground mb-1 line-clamp-1">
          {product.description || 'No description.'}
        </CardDescription> */}
        <div className="text-[9px] text-muted-foreground mb-0.5 mt-1"> {/* Added mt-1 for spacing if description is removed */}
          <span className="font-medium text-foreground">{product.brand || 'N/A'}</span> - <span className="italic">{product.category || 'N/A'}</span>
        </div>
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-0.5 text-amber-500 mb-0.5">
            {[...Array(Math.floor(product.rating))].map((_, i) => (
              <Star key={`filled-${i}`} size={10} fill="currentColor" />
            ))}
            {product.rating % 1 !== 0 && <Star key="half" size={10} />}
            {[...Array(5 - Math.ceil(product.rating))].map((_, i) => (
              <Star key={`empty-${i}`} size={10} className="text-muted-foreground opacity-40" />
            ))}
            <span className="text-[9px] text-muted-foreground ml-0.5">({product.rating.toFixed(1)})</span>
          </div>
        )}
        <p className="text-sm font-semibold text-primary mt-auto pt-0.5">
          ₹{product.price ? product.price.toFixed(2) : '0.00'}
        </p>
      </CardContent>
      <CardFooter className="p-1.5 border-t">
        <Button
          onClick={handleAddToCart}
          variant="ghost"
          size="sm"
          className="w-full h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary"
          disabled={!product.stock || product.stock === 0}
        >
          <ShoppingCart size={12} className="mr-1" />
          {product.stock && product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
