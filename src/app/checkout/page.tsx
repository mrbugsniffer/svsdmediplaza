
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Home } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import type { ShippingAddress, UserProfile } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(3, "Postal code is required").regex(/^\d{5}(-\d{4})?$/, "Invalid postal code format"),
  country: z.string().min(2, "Country is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  saveAsDefaultAddress: z.boolean().optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;


export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const shippingForm = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: '', address: '', city: '', postalCode: '', country: '', email: '', phone: '', saveAsDefaultAddress: true,
    }
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      // Pre-fill email if not already set by profile/order fetch
      if (!shippingForm.getValues('email')) {
        shippingForm.setValue('email', user.email || '');
      }
      if (!shippingForm.getValues('fullName') && user.displayName) {
         shippingForm.setValue('fullName', user.displayName);
      }

      // Fetch user profile for default shipping address or last order address
      const fetchAddress = async () => {
        let addressToPreFill: ShippingAddress | null = null;
        
        // 1. Try to get default shipping address from userProfile
        const userProfileRef = doc(db, 'userProfiles', user.uid);
        const userProfileSnap = await getDoc(userProfileRef);
        if (userProfileSnap.exists()) {
          const userProfileData = userProfileSnap.data() as UserProfile;
          if (userProfileData.defaultShippingAddress) {
            addressToPreFill = userProfileData.defaultShippingAddress;
          }
        }

        // 2. If no default, try to get from last order
        if (!addressToPreFill) {
          const ordersRef = collection(db, 'orders');
          const q = query(ordersRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(1));
          const orderSnap = await getDocs(q);
          if (!orderSnap.empty) {
            const lastOrder = orderSnap.docs[0].data();
            if (lastOrder.shippingAddress) {
              addressToPreFill = lastOrder.shippingAddress as ShippingAddress;
            }
          }
        }
        
        if (addressToPreFill) {
          shippingForm.reset({
            ...shippingForm.getValues(), // keep existing values like email if already set
            fullName: addressToPreFill.fullName || shippingForm.getValues('fullName'),
            address: addressToPreFill.address,
            city: addressToPreFill.city,
            postalCode: addressToPreFill.postalCode,
            country: addressToPreFill.country,
            phone: addressToPreFill.phone || '',
            email: shippingForm.getValues('email') || user.email || '', // Prioritize already set email
            saveAsDefaultAddress: true, // Default to true if pre-filling
          });
        } else if (user.email) { // Ensure email is set from auth if no address found
             shippingForm.setValue('email', user.email);
        }
      };
      fetchAddress();
    } else if (!authLoading && !user && isClient) {
      // If not logged in, but trying to checkout, redirect to login
      router.push('/login?redirect=/checkout');
      toast({ title: "Authentication Required", description: "Please login to proceed to checkout.", variant: "destructive" });
    }
  }, [user, authLoading, shippingForm, router, toast, isClient]);


  useEffect(() => {
    // This effect needs to run after isClient is true
    if (isClient && !authLoading && cartItems.length === 0) {
      router.replace('/cart');
      toast({ title: "Your cart is empty", description: "Please add items to your cart before proceeding to checkout.", variant: "destructive" });
    }
  }, [cartItems, router, toast, isClient, authLoading]);


  const taxRate = 0.08; // 8%
  const shippingCost = cartTotal > 50 ? 0 : 5.00; // Free shipping over $50
  const taxes = cartTotal * taxRate;
  const finalTotal = cartTotal + taxes + shippingCost;

  const handlePlaceOrder = async (formData: ShippingFormData) => {
    setIsProcessingOrder(true);
    if (!user) {
      toast({ title: "Not Logged In", description: "Please login to place an order.", variant: "destructive" });
      setIsProcessingOrder(false);
      router.push('/login?redirect=/checkout');
      return;
    }

    const currentShippingAddress: ShippingAddress = {
      fullName: formData.fullName,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      country: formData.country,
      phone: formData.phone || undefined,
    };

    try {
      const orderData = {
        userId: user.uid,
        customerEmail: formData.email, // Use email from form
        items: cartItems,
        totalAmount: finalTotal,
        orderDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        status: 'Pending' as const,
        shippingAddress: currentShippingAddress,
      };

      const ordersCollectionRef = collection(db, 'orders');
      const docRef = await addDoc(ordersCollectionRef, orderData);

      // Save as default shipping address if checked
      if (formData.saveAsDefaultAddress) {
        const userProfileRef = doc(db, 'userProfiles', user.uid);
        const userProfileData: Partial<UserProfile> = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          defaultShippingAddress: currentShippingAddress,
          updatedAt: serverTimestamp(),
        };
        // Use setDoc with merge: true to create or update
        await setDoc(userProfileRef, userProfileData, { merge: true }); 
        if (! (await getDoc(userProfileRef)).exists()) { // if it was a new doc, set createdAt
            await setDoc(userProfileRef, { createdAt: serverTimestamp()}, {merge: true});
        }
      }
      
      toast({ title: "Order Placed!", description: `Your order ${docRef.id.substring(0,10)}... has been successfully placed.` });
      clearCart();
      router.push(`/order-confirmation/${docRef.id}`);

    } catch (error: any) {
        console.error("Error placing order:", error);
        toast({
            title: "Order Placement Failed",
            description: error.message || "Could not place your order. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsProcessingOrder(false);
    }
  };
  
  if (!isClient || authLoading || (isClient && !user && !authLoading)) { // Show loading until client-side checks are done and user status is known
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <p className="text-lg text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }


  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-foreground mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Shipping Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...shippingForm}>
                <form onSubmit={shippingForm.handleSubmit(handlePlaceOrder)} id="checkout-form" className="space-y-4">
                  <FormField control={shippingForm.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={shippingForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email for Order Updates</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={shippingForm.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={shippingForm.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input placeholder="Anytown" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={shippingForm.control} name="postalCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl><Input placeholder="12345" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={shippingForm.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl><Input placeholder="United States" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={shippingForm.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField
                    control={shippingForm.control}
                    name="saveAsDefaultAddress"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Save this address as my default shipping address
                          </FormLabel>
                          <FormDescription>
                            Use this for faster checkout next time.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><ShoppingBag /> Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className='flex items-center gap-2'>
                       <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded" data-ai-hint="product thumbnail" />
                       <div>
                           <p className="font-medium line-clamp-1">{item.name}</p>
                           <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                       </div>
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2 mt-4">
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({cartCount})</span>
                    <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes (8%)</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="checkout-form" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isProcessingOrder || shippingForm.formState.isSubmitting}>
                {isProcessingOrder ? 'Processing Order...' : 'Place Order'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
