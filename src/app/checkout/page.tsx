
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(3, "Postal code is required").regex(/^\d{5}(-\d{4})?$/, "Invalid postal code format"),
  country: z.string().min(2, "Country is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

// Mock payment schema (very basic for UI)
const paymentSchema = z.object({
    cardNumber: z.string().min(16, "Card number must be 16 digits").max(16, "Card number must be 16 digits").regex(/^\d{16}$/, "Invalid card number"),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
    cvv: z.string().min(3, "CVV must be 3 digits").max(4, "CVV can be 3 or 4 digits").regex(/^\d{3,4}$/, "Invalid CVV"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;


export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (isClient && cartItems.length === 0) {
      router.replace('/cart');
      toast({ title: "Your cart is empty", description: "Please add items to your cart before proceeding to checkout.", variant: "destructive" });
    }
  }, [cartItems, router, toast, isClient]);


  const shippingForm = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: '', address: '', city: '', postalCode: '', country: '', email: user?.email || '', phone: ''
    }
  });

  const paymentForm = useForm<PaymentFormData>({
      resolver: zodResolver(paymentSchema),
      defaultValues: { cardNumber: '', expiryDate: '', cvv: ''}
  });

  useEffect(() => {
    if (user?.email && !shippingForm.getValues('email')) {
        shippingForm.setValue('email', user.email);
    }
    if (user?.displayName && !shippingForm.getValues('fullName')) {
        shippingForm.setValue('fullName', user.displayName);
    }
  }, [user, shippingForm]);


  const taxRate = 0.08; // 8%
  const shippingCost = cartTotal > 50 ? 0 : 5.00; // Free shipping over $50
  const taxes = cartTotal * taxRate;
  const finalTotal = cartTotal + taxes + shippingCost;

  const handlePlaceOrder = async (shippingData: ShippingFormData) => {
    setIsProcessingOrder(true);
    // Simulate payment processing
    await paymentForm.trigger(); // Validate payment form
    if (!paymentForm.formState.isValid) {
        toast({ title: "Payment Error", description: "Please correct the errors in the payment details.", variant: "destructive" });
        setIsProcessingOrder(false);
        return;
    }

    try {
      const orderData = {
        userId: user?.uid || undefined,
        customerEmail: shippingData.email,
        items: cartItems,
        totalAmount: finalTotal,
        orderDate: serverTimestamp(), // This will be set by Firestore server
        createdAt: serverTimestamp(),
        status: 'Pending' as const,
        shippingAddress: {
          fullName: shippingData.fullName,
          address: shippingData.address,
          city: shippingData.city,
          postalCode: shippingData.postalCode,
          country: shippingData.country,
          phone: shippingData.phone || undefined,
        },
      };

      const ordersCollectionRef = collection(db, 'orders');
      const docRef = await addDoc(ordersCollectionRef, orderData);
      
      toast({ title: "Order Placed!", description: `Your order ${docRef.id} has been successfully placed.` });
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
  
  if (!isClient || cartItems.length === 0) {
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
                      <FormLabel>Email</FormLabel>
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
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CreditCard /> Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="p-4 bg-primary/10 border-l-4 border-primary text-primary rounded-md mb-6">
                    <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-3 mt-1 shrink-0" />
                        <div>
                            <p className="font-semibold">This is a mock payment form.</p>
                            <p className="text-sm">Do not enter real credit card details. This form is for demonstration purposes only. No actual payment will be processed.</p>
                        </div>
                    </div>
                </div>
              <Form {...paymentForm}>
                <form className="space-y-4"> {/* No onSubmit here, validation triggered by main form */}
                    <FormField control={paymentForm.control} name="cardNumber" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FormField control={paymentForm.control} name="expiryDate" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Expiry Date (MM/YY)</FormLabel>
                            <FormControl><Input placeholder="MM/YY" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={paymentForm.control} name="cvv" render={({ field }) => (
                            <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl><Input placeholder="123" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>
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
                disabled={isProcessingOrder || shippingForm.formState.isSubmitting || paymentForm.formState.isSubmitting}>
                {isProcessingOrder ? 'Processing Order...' : 'Place Order'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
