// Using 'use client' for potential future client-side enhancements, though current version could be server component
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";


// Mock function to simulate fetching order details
// In a real app, this would fetch from your backend
async function getOrderDetails(orderId: string) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demonstration, we'll just return the orderId and a mock email.
  // A real implementation would fetch actual order data.
  if (orderId.startsWith("ORD-")) {
    return {
      id: orderId,
      email: "customer@example.com", // Mock email
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), // Mock delivery date
      // You could include items, total, shipping address etc. here
    };
  }
  return null; 
}


export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const [orderDetails, setOrderDetails] = useState<{id: string; email: string; estimatedDelivery: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.orderId) {
      getOrderDetails(params.orderId).then(details => {
        setOrderDetails(details);
        setLoading(false);
      });
    }
  }, [params.orderId]);

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
  
  if (!orderDetails) {
    return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <Package size={64} className="text-destructive mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-8">We couldn't find details for order ID: {params.orderId}.</p>
            <Button asChild>
                <Link href="/products">Continue Shopping</Link>
            </Button>
        </div>
    )
  }


  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="shadow-xl text-center">
        <CardHeader className="pt-8">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">Thank You For Your Order!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Your order <span className="font-semibold text-primary">{orderDetails.id}</span> has been placed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 md:px-8 pb-8">
          <p className="text-muted-foreground">
            A confirmation email has been sent to <span className="font-medium text-foreground">{orderDetails.email}</span>.
            Please check your inbox (and spam folder, just in case).
          </p>
          
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-semibold text-foreground mb-2">Estimated Delivery:</h3>
            <p className="text-lg text-primary">{orderDetails.estimatedDelivery}</p>
          </div>

          <p className="text-sm text-muted-foreground">
            You can track your order status using your order ID on our tracking page.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/track-order?orderId=${orderDetails.id}`}>Track Your Order</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
