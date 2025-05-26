
'use client';

import { useEffect, useState, ChangeEvent, FormEvent, use } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase'; // Import auth
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Order, CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Package, ShoppingBag, UserCircle, HomeIcon, Edit3Icon, Edit } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ADMIN_EMAIL = 'admin@gmail.com'; // Define admin email constant
const orderStatusOptions: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrderDetailPage({ params: paramsAsPromise }: { params: { orderId: string } }) {
  const resolvedParams = use(paramsAsPromise as any) as { orderId?: string };
  const orderId = resolvedParams?.orderId;

  const router = useRouter();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | undefined>(undefined);
  const [isFirebaseAuthenticatedAdmin, setIsFirebaseAuthenticatedAdmin] = useState(false);


  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
      setIsFirebaseAuthenticatedAdmin(true);
    } else {
      setIsFirebaseAuthenticatedAdmin(false);
      toast({
        title: "Authentication Error",
        description: "Admin user not authenticated. You cannot view or manage order details.",
        variant: "destructive",
      });
      // Optionally redirect if not admin
      // router.push('/admin/login');
    }
  }, [toast, router]);


  useEffect(() => {
    if (orderId && isFirebaseAuthenticatedAdmin) { // Fetch only if admin and orderId exists
      setIsLoading(true);
      const fetchOrder = async () => {
        try {
          const orderDocRef = doc(db, 'orders', orderId);
          const orderSnap = await getDoc(orderDocRef);

          if (orderSnap.exists()) {
            const data = orderSnap.data();
            const fetchedOrder = {
              id: orderSnap.id,
              ...data,
              orderDate: data.orderDate?.toDate ? data.orderDate.toDate() : new Date(data.orderDate || Date.now()),
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
            } as Order;
            setOrder(fetchedOrder);
            setSelectedStatus(fetchedOrder.status);
          } else {
            toast({ title: "Error", description: `Order with ID ${orderId} not found.`, variant: "destructive" });
            setOrder(null);
          }
        } catch (error: any) {
          console.error("Error fetching order from Firestore:", error);
          let desc = "Failed to fetch order details. ";
          if (error.code === 'permission-denied') {
            desc += "Firestore permission denied. Ensure the admin user has read access for this order and appropriate custom claims if required by security rules.";
          } else {
            desc += error.message;
          }
          toast({ title: "Error Fetching Order", description: desc, variant: "destructive", duration: 8000 });
          setOrder(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrder();
    } else if (resolvedParams && !orderId) { 
        setIsLoading(false);
        toast({ title: "Error", description: "Order ID is missing.", variant: "destructive" });
    } else if (!isFirebaseAuthenticatedAdmin && orderId) {
        setIsLoading(false); // Done "loading" as we won't fetch due to auth
    }
  }, [orderId, toast, resolvedParams, isFirebaseAuthenticatedAdmin]);

  const handleStatusUpdate = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return;
     if (!isFirebaseAuthenticatedAdmin) {
      toast({ title: "Action Denied", description: "Admin not authenticated. Cannot update order status.", variant: "destructive"});
      return;
    }
    setIsUpdatingStatus(true);
    try {
        const orderDocRef = doc(db, 'orders', order.id);
        await updateDoc(orderDocRef, {
            status: selectedStatus,
            updatedAt: serverTimestamp()
        });
        setOrder(prevOrder => prevOrder ? { ...prevOrder, status: selectedStatus!, updatedAt: new Date() } : null);
        toast({ title: "Status Updated", description: `Order status changed to ${selectedStatus}.`});
    } catch (error: any) {
        console.error("Error updating order status:", error);
        let desc = "Failed to update order status. ";
        if (error.code === 'permission-denied') {
            desc += "Firestore permission denied. Ensure the admin user has update permissions for orders and appropriate custom claims if required by security rules.";
        } else {
            desc += error.message;
        }
        toast({
            title: "Error Updating Status",
            description: desc,
            variant: "destructive",
            duration: 8000,
        });
    } finally {
        setIsUpdatingStatus(false);
    }
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
  
  if (!isFirebaseAuthenticatedAdmin && !isLoading) {
    return (
      <div className="space-y-6 text-center py-10">
         <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
         <p className="text-muted-foreground">You must be an authenticated admin to view order details.</p>
         <Button asChild variant="outline" className="mt-4">
           <Link href="/admin/login">Go to Admin Login</Link>
         </Button>
         <Button variant="outline" asChild className="mt-4 ml-2">
           <Link href="/admin/orders">Back to Orders List</Link>
         </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <Package size={32} className="animate-pulse mb-2 text-primary" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <Package size={32} className="text-destructive mb-2" />
        <p className="text-destructive">Order with ID <span className='font-mono'>{orderId || "N/A"}</span> not found or could not be loaded.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/orders">
            <ChevronLeft size={16} className="mr-1" /> Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="mb-2 text-sm">
        <Link href="/admin/orders">
          <ChevronLeft size={16} className="mr-1" /> Back to Orders List
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Order ID: {order.id}</CardTitle>
              <CardDescription>
                Placed on: {order.orderDate ? format(order.orderDate, "MMMM d, yyyy 'at' h:mm a") : 'N/A'}
                {order.updatedAt && (
                    <span className="block text-xs text-muted-foreground mt-1">
                        Last Updated: {format(order.updatedAt, "MMMM d, yyyy 'at' h:mm a")}
                    </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm capitalize">{order.status}</Badge>
              </div>
               {order.userId && (
                <div className="flex items-center gap-2">
                    <UserCircle size={18} className="text-muted-foreground" />
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="font-medium text-xs">{order.userId}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <UserCircle size={18} className="text-muted-foreground" />
                <span className="text-muted-foreground">Customer Email:</span>
                <span className="font-medium">{order.customerEmail}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HomeIcon size={22} /> Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Edit3Icon size={20} /> Update Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Order['status'])} disabled={!isFirebaseAuthenticatedAdmin || isUpdatingStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatusOptions.map(statusOption => (
                    <SelectItem key={statusOption} value={statusOption} className="capitalize">
                      {statusOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={!isFirebaseAuthenticatedAdmin || isUpdatingStatus || !selectedStatus || selectedStatus === order.status}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isUpdatingStatus ? 'Updating...' : 'Save Status'}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShoppingBag size={22}/>Order Total</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="flex justify-between font-bold text-xl text-primary">
                    <span>Grand Total:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Order Items ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Price/Unit</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item: CartItem) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image
                      src={item.imageUrl || 'https://placehold.co/40x40.png'}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded object-cover aspect-square"
                      data-ai-hint="product thumbnail"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    