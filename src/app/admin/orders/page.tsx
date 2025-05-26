
'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase'; // Import auth
import { collection, onSnapshot, query, orderBy, DocumentData, Timestamp } from 'firebase/firestore';
import type { Order } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingCart, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = 'admin@gmail.com'; // Define admin email constant

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = auth.currentUser;
    console.log("AdminOrdersPage: Firebase currentUser on mount:", currentUser?.email);
    if (currentUser) {
      setIsFirebaseAuthenticated(true);
    } else {
      setIsFirebaseAuthenticated(false);
      setIsLoading(false); 
      console.warn("AdminOrdersPage: No Firebase user authenticated. Cannot fetch orders.");
      toast({
        title: "Authentication Required",
        description: "Admin user not authenticated with Firebase. Please re-login to view orders.",
        variant: "destructive",
        duration: 8000
      });
      return;
    }

    setIsLoading(true);
    const ordersCollectionRef = collection(db, 'orders');
    const q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot: DocumentData) => {
      const ordersData = snapshot.docs.map((doc: DocumentData) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          orderDate: data.orderDate?.toDate ? data.orderDate.toDate() : new Date(data.orderDate),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        } as Order;
      });
      setOrders(ordersData);
      setIsLoading(false);
    }, (error: any) => {
      const currentAuthUser = auth.currentUser; // Get current auth state at the time of error
      console.error("Error fetching orders from Firestore:", error);
      console.error("AdminOrdersPage: Firebase currentUser at the time of Firestore error:", currentAuthUser?.email, "UID:", currentAuthUser?.uid);

      let description = "Failed to fetch orders. ";
      if (error.code === 'permission-denied' || error.message.toLowerCase().includes('insufficient permissions')) {
        description += "Firestore permission denied. Please check your Firestore security rules. ";
        if (currentAuthUser?.email === ADMIN_EMAIL) {
            description += `Ensure the admin user (${ADMIN_EMAIL}) has the necessary 'admin: true' custom claim set in Firebase Authentication, as this is likely required by your security rules for listing all orders. Custom claims are not set by the frontend login.`;
        } else {
            description += "Ensure the authenticated user has read access to the 'orders' collection and necessary custom claims if required by rules.";
        }
      } else {
        description += error.message;
      }
      toast({ title: "Error Fetching Orders", description, variant: "destructive", duration: 12000 }); // Increased duration
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]); 

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

  if (!isFirebaseAuthenticated && !isLoading) {
    return (
      <div className="space-y-6 text-center py-10">
         <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
         <p className="text-muted-foreground">Admin user is not authenticated with Firebase. Please re-login.</p>
         <Button asChild><Link href="/admin/login">Go to Admin Login</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Orders</h1>
          <p className="text-muted-foreground">View and manage customer orders.</p>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>
            {isLoading ? "Loading orders..." : `Displaying ${orders.length} most recent order(s).`}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye size={16} />
                            <span className="sr-only">View Order {order.id}</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        <PackageSearch size={32} className="mx-auto mb-2 text-muted-foreground"/>
                        No orders found. This could be due to no orders being placed, or permission issues with Firestore. Check console for errors.
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
