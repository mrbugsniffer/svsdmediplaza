
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockCategories, mockBrands } from '@/lib/mock-data'; // Using mock data for dropdowns
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';


// This would ideally come from your types definition
interface ProductFormData {
  name: string;
  description: string;
  price: string; // String for input, convert to number on submit
  category: string;
  brand: string;
  stock: string; // String for input, convert to number on submit
  imageUrl: string;
  featured: boolean;
  rating?: string; // Optional, string for input
}

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    imageUrl: 'https://placehold.co/600x400.png', // Default placeholder
    featured: false,
    rating: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name: 'category' | 'brand') => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation (can be expanded with Zod or similar)
    if (!formData.name || !formData.price || !formData.category || !formData.brand || !formData.stock) {
        toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
      // In a real app, you would send this data to your backend API
      console.log('Submitting new product:', {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
      });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Product Added",
        description: `${formData.name} has been successfully added. (Demo - not persistent)`,
      });
      router.push('/admin/products'); // Redirect to products list
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error Adding Product",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <Button variant="outline" asChild className="mb-2 text-sm">
          <Link href="/admin/products">
            <ChevronLeft size={16} className="mr-1" /> Back to Products
          </Link>
        </Button>
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Product</CardTitle>
          <CardDescription>Fill in the details for the new product.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleChange} disabled={isLoading} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" name="stock" type="number" step="1" value={formData.stock} onChange={handleChange} required disabled={isLoading} />
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" onValueChange={handleSelectChange('category')} value={formData.category} disabled={isLoading} required>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                            {mockCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                     <Select name="brand" onValueChange={handleSelectChange('brand')} value={formData.brand} disabled={isLoading} required>
                        <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                        <SelectContent>
                            {mockBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} disabled={isLoading} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="rating">Rating (Optional, 1-5)</Label>
              <Input id="rating" name="rating" type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={handleChange} disabled={isLoading} />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="featured" name="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: Boolean(checked) }))} disabled={isLoading} />
                <Label htmlFor="featured" className="font-normal">Mark as Featured Product</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/products')} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                  {isLoading ? 'Adding Product...' : 'Add Product'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
