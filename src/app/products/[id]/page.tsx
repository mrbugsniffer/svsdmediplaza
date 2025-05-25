
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ShoppingCart, Star, Minus, Plus, Package } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from '@/components/products/product-card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const productDocRef = doc(db, 'products', params.id);
        const productSnap = await getDoc(productDocRef);

        if (productSnap.exists()) {
          const fetchedProductData = { id: productSnap.id, ...productSnap.data() } as Product;
          setProduct(fetchedProductData);

          // Fetch related products
          if (fetchedProductData.category) {
            const productsCollectionRef = collection(db, 'products');
            const relatedQuery = query(
              productsCollectionRef,
              where('category', '==', fetchedProductData.category),
              where('id', '!=', fetchedProductData.id), // Exclude current product using Firestore ID
              limit(4)
            );
            const relatedSnap = await getDocs(relatedQuery);
            const related = relatedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setRelatedProducts(related);
          }
        } else {
          toast({ title: "Not Found", description: "Product not found.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({ title: "Error", description: "Failed to load product details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [params.id, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
            <Package size={48} className="animate-pulse text-primary mx-auto mb-4" />
            <p className="mt-4 text-lg text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <Package size={64} className="text-destructive mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn't find the product you're looking for.
        </p>
        <Button asChild variant="outline">
          <Link href="/products">
            <ChevronLeft size={18} className="mr-2" /> Go Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + amount, product.stock)));
  };

  return (
    <div className="space-y-12">
      <Button variant="outline" asChild className="mb-8">
        <Link href="/products">
          <ChevronLeft size={18} className="mr-2" /> Back to Products
        </Link>
      </Button>

      <Card className="overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[400px]">
            <Image
              src={product.imageUrl || 'https://placehold.co/600x400.png'}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              data-ai-hint={`${product.category?.toLowerCase()} ${product.brand?.toLowerCase()}`}
            />
          </div>
          <div className="flex flex-col">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="text-3xl md:text-4xl font-bold">{product.name}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                {product.category && <Badge variant="secondary">{product.category}</Badge>}
                {product.brand && <Badge variant="outline">{product.brand}</Badge>}
              </div>
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500 mt-3">
                  {[...Array(Math.floor(product.rating))].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                  ))}
                  {product.rating % 1 !== 0 && <Star size={20} />} 
                  {[...Array(5 - Math.ceil(product.rating))].map((_, i) => (
                    <Star key={`empty-${i}`} size={20} className="text-muted-foreground opacity-50" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">({product.rating.toFixed(1)} from reviews)</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 md:p-8 flex-grow">
              <CardDescription className="text-base text-muted-foreground leading-relaxed">{product.description}</CardDescription>
              <p className="text-3xl font-bold text-primary mt-6">${product.price.toFixed(2)}</p>
              <p className={`mt-2 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            </CardContent>
            <CardFooter className="p-6 md:p-8 border-t bg-muted/30">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <div className="flex items-center border rounded-md">
                  <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                    <Minus size={18} />
                  </Button>
                  <span className="px-4 py-2 w-12 text-center font-medium">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock || product.stock === 0}>
                    <Plus size={18} />
                  </Button>
                </div>
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-grow bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>
      
      <Separator className="my-12" />

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
