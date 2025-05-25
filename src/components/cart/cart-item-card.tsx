'use client';

import Image from 'next/image';
import type { CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { QuantitySelector } from '@/components/ui/quantity-selector';
import Link from 'next/link';

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { removeFromCart, updateQuantity } = useCart();

  return (
    <div className="flex items-start gap-4 p-4 border-b last:border-b-0 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${item.id}`} className="shrink-0">
        <div className="relative w-24 h-24 rounded-md overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="100px"
            className="object-cover"
            data-ai-hint={`${item.category.toLowerCase()} product`}
          />
        </div>
      </Link>
      <div className="flex-grow">
        <Link href={`/products/${item.id}`} className="hover:text-primary transition-colors">
          <h3 className="text-lg font-semibold">{item.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">{item.brand} - {item.category}</p>
        <p className="text-md font-semibold text-primary mt-1">${item.price.toFixed(2)}</p>
        <div className="mt-2">
           <QuantitySelector
            quantity={item.quantity}
            onQuantityChange={(newQuantity) => updateQuantity(item.id, newQuantity)}
            maxQuantity={item.stock}
          />
        </div>
      </div>
      <div className="flex flex-col items-end justify-between h-full ml-auto">
         <p className="text-lg font-bold text-foreground">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFromCart(item.id)}
          className="text-destructive hover:text-destructive/80 mt-auto"
          aria-label={`Remove ${item.name} from cart`}
        >
          <Trash2 size={20} />
        </Button>
      </div>
    </div>
  );
}
