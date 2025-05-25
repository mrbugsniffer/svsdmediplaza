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
        <Link href={`/products/${product.id}`} className="block">
          <div className="aspect-[4/3] relative w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={`${product.category.toLowerCase()} ${product.brand.toLowerCase()}`}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-lg font-semibold mb-1 hover:text-primary transition-colors">{product.name}</CardTitle>
        </Link>
        <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</CardDescription>
        <div className="text-xs text-muted-foreground mb-2">
          <span className="font-medium text-foreground">{product.brand}</span> - <span>{product.category}</span>
        </div>
        {product.rating && (
          <div className="flex items-center gap-1 text-amber-500 mb-2">
            {[...Array(Math.floor(product.rating))].map((_, i) => (
              <Star key={i} size={16} fill="currentColor" />
            ))}
            {product.rating % 1 !== 0 && <Star size={16} />}
            {[...Array(5 - Math.ceil(product.rating))].map((_, i) => (
              <Star key={`empty-${i}`} size={16} className="text-muted-foreground opacity-50" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({product.rating.toFixed(1)})</span>
          </div>
        )}
        <p className="text-xl font-bold text-primary mt-auto pt-2">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button onClick={handleAddToCart} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={product.stock === 0}>
          <ShoppingCart size={18} className="mr-2" />
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
