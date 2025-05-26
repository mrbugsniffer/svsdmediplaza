
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PackageSearch, Package, AlertCircle, ShoppingBag, ListOrdered, LogInIcon } from 'lucide-react';
import type { Order } from '@/types';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const orderStatusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const ordersCollectionRef = collection(db, 'orders');
    const q = query(ordersCollectionRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot: DocumentData) => {
      const fetchedOrders = snapshot.docs.map((doc: DocumentData) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          orderDate: data.orderDate?.toDate ? data.orderDate.toDate() : new Date(data.orderDate || Date.now()),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
        } as Order;
      });
      setOrders(fetchedOrders);
      setIsLoading(false);
    }, (err: any) => {
      console.error("Error fetching user orders:", err);
      setError("Failed to fetch your orders. Please try again later.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, router]);

  const getStatusProgress = (status: Order['status']): number => {
    const currentIndex = orderStatusSteps.indexOf(status);
    if (currentIndex === -1 || status === 'Cancelled') return 0;
    if (status === 'Delivered') return 100;
    return ((currentIndex + 1) / (orderStatusSteps.length -1 )) * 100; 
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'default';
      case 'Processing': return 'secondary';
      case 'Shipped': return 'outline';
      case 'Delivered': return 'default'; 
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <ListOrdered size={48} className="animate-pulse text-primary mb-4" />
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <LogInIcon size={64} className="text-primary mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">Please Log In</h1>
        <p className="text-muted-foreground mb-8">You need to be logged in to view your orders.</p>
        <Button asChild size="lg">
          <Link href="/login?redirect=/track-order">Login</Link>
        </Button>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertCircle size={64} className="text-destructive mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">Error</h1>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Button onClick={() => router.refresh()} variant="outline">Try Again</Button>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center">
          <ShoppingBag size={36} className="mr-3 text-primary"/> My Orders
        </h1>
         <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12 shadow-md">
          <CardHeader>
            <PackageSearch size={48} className="mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">No Orders Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>You haven't placed any orders yet. Start shopping to see your orders here.</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3">
                <div>
                  <CardTitle className="text-xl hover:text-primary">
                    <Link href={`/order-confirmation/${order.id}`}>Order ID: {order.id}</Link>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Placed on: {order.createdAt ? format(order.createdAt, "MMMM d, yyyy 'at' h:mm a") : 'N/A'}
                  </CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm capitalize h-fit">
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                {order.status !== "Cancelled" && order.status !== "Delivered" && (
                    <div className="mb-2">
                        <Progress value={getStatusProgress(order.status)} className="w-full h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                            {orderStatusSteps.filter(s => s !== 'Cancelled').map(step => (
                            <span key={step} className={(orderStatusSteps.indexOf(step) <= orderStatusSteps.indexOf(order.status) && order.status !== 'Pending' ) || (order.status ==='Pending' && step === 'Pending') ? 'font-medium text-foreground' : ''}>
                                {step}
                            </span>
                            ))}
                        </div>
                    </div>
                )}
                <div className="text-sm">
                  <span className="text-muted-foreground">Items:</span> {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Shipping to:</span> {order.shippingAddress.fullName}, {order.shippingAddress.city}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t pt-4">
                <span className="text-lg font-bold">Total: ₹{order.totalAmount.toFixed(2)}</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/order-confirmation/${order.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
