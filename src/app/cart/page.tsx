
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { CartItemCard } from '@/components/cart/cart-item-card';
import Link from 'next/link';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function CartPage() {
  const { cartItems, cartCount, cartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart size={64} className="mx-auto text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  // Mock values for taxes and shipping, adjust as needed
  const taxRate = 0.08; // 8%
  const shippingCost = cartTotal > 500 ? 0 : 50.00; // Free shipping over ₹500, ₹50 shipping cost
  const taxes = cartTotal * taxRate;
  const finalTotal = cartTotal + taxes + shippingCost;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-foreground">Your Shopping Cart</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive hover:text-destructive/80 hover:border-destructive/50">
              <Trash2 size={16} className="mr-2" /> Clear Cart
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will remove all items from your cart. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearCart} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Clear Cart
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <CartItemCard key={item.id} item={item} />
          ))}
        </div>

        <Card className="lg:col-span-1 h-fit sticky top-24 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Shipping</span>
              <span>{shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Free'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Tax</span>
              <span>₹{taxes.toFixed(2)}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
