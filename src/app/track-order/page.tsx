
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PackageSearch, Package, AlertCircle } from 'lucide-react';
import { getOrderById } from '@/lib/mock-data'; // We'll keep using this but it now fetches from Firestore
import type { Order } from '@/types';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

const orderStatusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function TrackOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orderIdFromQuery = searchParams.get('orderId');
    if (orderIdFromQuery) {
      setOrderIdInput(orderIdFromQuery);
      handleTrackOrder(orderIdFromQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only run when searchParams change


  const handleTrackOrder = async (idToTrack?: string) => {
    const currentOrderId = idToTrack || orderIdInput;
    if (!currentOrderId.trim()) {
      setError('Please enter an order ID.');
      setOrder(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);
    
    // Update URL with the current order ID without full page reload
    router.push(`/track-order?orderId=${currentOrderId}`, { scroll: false });

    try {
      // getOrderById now fetches from Firestore
      const fetchedOrder = await getOrderById(currentOrderId.trim()); 
      if (fetchedOrder) {
        setOrder(fetchedOrder);
      } else {
        setError('Order not found. Please check the ID and try again.');
      }
    } catch (e) {
      setError('An error occurred while fetching your order. Please try again later.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleTrackOrder();
  };

  const getStatusProgress = (status: Order['status']): number => {
    const currentIndex = orderStatusSteps.indexOf(status);
    if (currentIndex === -1) return 0;
    if (status === 'Cancelled') return 0; // Or some other representation for cancelled
    if (status === 'Delivered') return 100;
    return ((currentIndex + 1) / (orderStatusSteps.length -1 )) * 100; // -1 because cancelled is not a "progress" step
  };


  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <PackageSearch size={48} className="mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Track Your Order</CardTitle>
          <CardDescription>Enter your order ID below to see its status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Enter Order ID"
              className="flex-grow text-base"
              aria-label="Order ID"
            />
            <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? 'Tracking...' : 'Track Order'}
            </Button>
          </form>
          {error && (
            <p className="mt-4 text-sm text-destructive flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </p>
          )}
        </CardContent>
      </Card>

      {isLoading && (
         <div className="flex justify-center items-center py-10 mt-8">
            <Package size={32} className="animate-pulse mr-2 text-primary" />
            <p>Loading order details...</p>
        </div>
      )}

      {!isLoading && order && (
        <Card className="mt-8 shadow-lg animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="text-2xl">Order Details - {order.id}</CardTitle>
            <CardDescription>
              Order placed on: {order.orderDate?.toDate ? format(order.orderDate.toDate(), "MMMM d, yyyy 'at' h:mm a") : 'Date not available'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">Status: <span className="text-primary capitalize">{order.status}</span></h4>
              <Progress value={getStatusProgress(order.status)} className="w-full h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                {orderStatusSteps.filter(s => s !== 'Cancelled').map(step => (
                  <span key={step} className={orderStatusSteps.indexOf(step) <= orderStatusSteps.indexOf(order.status) ? 'font-medium text-foreground' : ''}>
                    {step}
                  </span>
                ))}
              </div>
               {order.status === 'Cancelled' && <p className="text-sm text-destructive mt-2">This order has been cancelled.</p>}
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Shipping To:</h4>
              <p className="text-muted-foreground">
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Items ({order.items.reduce((acc, item) => acc + item.quantity, 0)}):</h4>
              <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-2">
                {order.items.map(item => (
                  <li key={item.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                    <div className="flex items-center gap-2">
                        <Image src={item.imageUrl} alt={item.name} width={32} height={32} className="rounded-sm" data-ai-hint="product thumbnail"/>
                        <div>
                            <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex justify-between w-full font-bold text-xl">
              <span>Total Amount:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </CardFooter>
        </Card>
      )}
       {!isLoading && !order && !error && orderIdInput && (
          <Card className="mt-8 text-center py-10 shadow-md">
            <CardContent>
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Enter your order ID above to see details.</p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
