
'use client'; 

import { use, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, ShoppingBag, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Order, CartItem } from '@/types';
import { format } from 'date-fns'; 
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export default function OrderConfirmationPage({ params: paramsAsPromise }: { params: { orderId: string } }) {
  const resolvedParams = use(paramsAsPromise as any) as { orderId?: string }; 
  const orderId = resolvedParams?.orderId; 

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        console.error("Order ID is missing from params.");
        return;
      }
      setLoading(true);
      try {
        const orderDocRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderDocRef);

        if (orderSnap.exists()) {
          const data = orderSnap.data();
          const orderData = { 
              id: orderSnap.id, 
              ...data,
              orderDate: data.orderDate?.toDate ? data.orderDate.toDate() : new Date(data.orderDate || Date.now()),
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            } as Order;
          setOrder(orderData);
        } else {
          console.error("Order not found in Firestore for ID:", orderId);
          setOrder(null);
        }
      } catch (error) {
        console.error("Error fetching order from Firestore:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
        fetchOrderDetails();
    } else {
        setLoading(false);
        if(resolvedParams && !resolvedParams.orderId) {
             console.error("Order ID missing after params resolution.");
        }
    }
  }, [orderId]); 

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl text-muted-foreground">Loading your order confirmation...</p>
      </div>
    );
  }
  
  if (!order) {
    return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <Package size={64} className="text-destructive mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-8">We couldn&apos;t find details for order ID: {orderId || "N/A"}.</p>
            <Button asChild>
                <Link href="/products">Continue Shopping</Link>
            </Button>
        </div>
    )
  }

  const orderDateDisplay = order.orderDate ? format(order.orderDate, "MMMM d, yyyy 'at' h:mm a") : 'Date not available';
  const estimatedDelivery = new Date( (order.orderDate ? order.orderDate.getTime() : Date.now()) + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });


  return (
    <div className="max-w-3xl mx-auto py-12">
      <Card className="shadow-xl">
        <CardHeader className="pt-8 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">Thank You For Your Order!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Your order <span className="font-semibold text-primary">{order.id}</span> has been placed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-6 md:px-8 pb-8">
          <p className="text-muted-foreground text-center">
            A confirmation email has been sent to <span className="font-medium text-foreground">{order.customerEmail}</span>.
            Please check your inbox (and spam folder, just in case).
          </p>
          
          <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
             <div>
                <h3 className="font-semibold text-foreground mb-1">Order Placed:</h3>
                <p className="text-md text-foreground">{orderDateDisplay}</p>
            </div>
            <div>
                <h3 className="font-semibold text-foreground mb-1">Estimated Delivery:</h3>
                <p className="text-md text-primary">{estimatedDelivery}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <ShoppingBag size={22} /> Order Summary
            </h3>
            <div className="space-y-2">
                {order.items.map((item: CartItem) => (
                    <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-muted/10 rounded">
                        <div className="flex items-center gap-3">
                            <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-sm" data-ai-hint="product thumbnail" />
                            <div>
                                <p className="font-medium text-foreground">{item.name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <span className="font-medium text-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-between font-bold text-lg mt-4 pt-3 border-t">
                <span>Total Amount:</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPinIcon size={22} /> Shipping To
            </h3>
            <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg border">
                <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/track-order?orderId=${order.id}`}>Track Your Order</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    