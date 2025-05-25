
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
      <CardContent className="p-3 flex-grow flex flex-col"> {/* Reduced padding */}
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-base font-semibold mb-1 hover:text-primary transition-colors">{product.name}</CardTitle> {/* Reduced font size */}
        </Link>
        <CardDescription className="text-xs text-muted-foreground mb-1.5 line-clamp-2">{product.description}</CardDescription> {/* Reduced font size and margin */}
        <div className="text-xs text-muted-foreground mb-1.5"> {/* Reduced margin */}
          <span className="font-medium text-foreground">{product.brand}</span> - <span>{product.category}</span>
        </div>
        {product.rating && (
          <div className="flex items-center gap-0.5 text-amber-500 mb-1.5"> {/* Reduced gap and margin */}
            {[...Array(Math.floor(product.rating))].map((_, i) => (
              <Star key={i} size={14} fill="currentColor" /> /* Reduced icon size */
            ))}
            {product.rating % 1 !== 0 && <Star size={14} />} /* Reduced icon size */
            {[...Array(5 - Math.ceil(product.rating))].map((_, i) => (
              <Star key={`empty-${i}`} size={14} className="text-muted-foreground opacity-50" /> /* Reduced icon size */
            ))}
            <span className="text-xs text-muted-foreground ml-1">({product.rating.toFixed(1)})</span>
          </div>
        )}
        <p className="text-lg font-bold text-primary mt-auto pt-1.5">${product.price.toFixed(2)}</p> {/* Reduced font size and padding-top */}
      </CardContent>
      <CardFooter className="p-3 border-t"> {/* Reduced padding */}
        <Button 
          onClick={handleAddToCart} 
          size="sm" /* Reduced button size */
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
          disabled={product.stock === 0}
        >
          <ShoppingCart size={16} className="mr-1.5" /> {/* Reduced icon size and margin */}
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
