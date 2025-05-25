
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, DocumentData, Timestamp } from 'firebase/firestore';
import type { Order } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingCart, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns'; // For formatting timestamp
import { useToast } from "@/hooks/use-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const ordersCollectionRef = collection(db, 'orders');
    const q = query(ordersCollectionRef, orderBy('createdAt', 'desc')); // Order by creation time, newest first

    const unsubscribe = onSnapshot(q, (snapshot: DocumentData) => {
      const ordersData = snapshot.docs.map((doc: DocumentData) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure orderDate and createdAt are usable, convert if they are Firestore Timestamps
          orderDate: data.orderDate?.toDate ? data.orderDate.toDate() : new Date(data.orderDate),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        } as Order;
      });
      setOrders(ordersData);
      setIsLoading(false);
    }, (error: any) => {
      console.error("Error fetching orders from Firestore:", error);
      toast({ title: "Error", description: "Failed to fetch orders. " + error.message, variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [toast]);

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'default'; // Using primary color for pending
      case 'Processing': return 'secondary';
      case 'Shipped': return 'outline'; // Visually distinct for shipped
      case 'Delivered': return 'default'; // Similar to success, maybe a green custom variant later
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Orders</h1>
          <p className="text-muted-foreground">View and manage customer orders.</p>
        </div>
        {/* Add "Create Order" button or other actions if needed later */}
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>
            Displaying {orders.length} most recent orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add search/filter controls here later if needed */}
          <div className="overflow-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <ShoppingCart size={32} className="animate-pulse mr-2 text-primary" />
                <p>Loading orders...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-primary hover:underline">
                        <Link href={`/admin/orders/${order.id}`}>{order.id.substring(0,8)}...</Link>
                      </TableCell>
                      <TableCell>{order.shippingAddress.fullName || order.customerEmail}</TableCell>
                      <TableCell>
                        {order.createdAt instanceof Date ? format(order.createdAt, "MMM d, yyyy") : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="icon" asChild className="hover:text-primary hover:border-primary">
                          {/* Link to a detailed order view page (to be created) */}
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye size={16} />
                            <span className="sr-only">View Order {order.id}</span>
                          </Link>
                        </Button>
                        {/* Add more actions like "Update Status" later */}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        <PackageSearch size={32} className="mx-auto mb-2 text-muted-foreground"/>
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
