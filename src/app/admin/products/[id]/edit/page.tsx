
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockCategories, mockBrands, getProductById as fetchMockProductById } from '@/lib/mock-data';
import type { Product } from '@/types';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  brand: string;
  stock: string;
  imageUrl: string;
  featured: boolean;
  rating?: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const productId = params.id as string;

  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          // In a real app, fetch from API: const product = await getProductByIdAPI(productId);
          const product = await fetchMockProductById(productId); // Using mock data fetcher
          if (product) {
            setFormData({
              name: product.name,
              description: product.description,
              price: product.price.toString(),
              category: product.category,
              brand: product.brand,
              stock: product.stock.toString(),
              imageUrl: product.imageUrl,
              featured: product.featured || false,
              rating: product.rating?.toString() || '',
            });
          } else {
            toast({ title: "Error", description: "Product not found.", variant: "destructive" });
            router.push('/admin/products');
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch product details.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productId, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => prev ? { ...prev, [name]: checked } : null);
    } else {
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSelectChange = (name: 'category' | 'brand') => (value: string) => {
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);

    // Basic validation
    if (!formData.name || !formData.price || !formData.category || !formData.brand || !formData.stock) {
        toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      // In a real app, you would send this data to your backend API
      console.log('Updating product:', productId, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
      });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Product Updated",
        description: `${formData.name} has been successfully updated. (Demo - not persistent)`,
      });
      router.push('/admin/products');
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error Updating Product",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Loading product details...</p></div>;
  }

  if (!formData) {
    // This case should ideally be handled by the redirect in useEffect if product not found
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Product data could not be loaded.</p></div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="mb-2 text-sm">
          <Link href="/admin/products">
            <ChevronLeft size={16} className="mr-1" /> Back to Products
          </Link>
        </Button>
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Product</CardTitle>
          <CardDescription>Modify the details for &quot;{formData.name}&quot;.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleChange} disabled={isSubmitting} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" name="stock" type="number" step="1" value={formData.stock} onChange={handleChange} required disabled={isSubmitting} />
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" onValueChange={handleSelectChange('category')} value={formData.category} disabled={isSubmitting} required>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                            {mockCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                     <Select name="brand" onValueChange={handleSelectChange('brand')} value={formData.brand} disabled={isSubmitting} required>
                        <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                        <SelectContent>
                            {mockBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} disabled={isSubmitting} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="rating">Rating (Optional, 1-5)</Label>
              <Input id="rating" name="rating" type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={handleChange} disabled={isSubmitting} />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="featured" name="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => prev ? { ...prev, featured: Boolean(checked) } : null)} disabled={isSubmitting} />
                <Label htmlFor="featured" className="font-normal">Mark as Featured Product</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="outline" onClick={() => router.push('/admin/products')} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
