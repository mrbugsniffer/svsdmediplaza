
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockCategories, mockBrands } from '@/lib/mock-data';
import Link from 'next/link';
import { ChevronLeft, UploadCloud } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';

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
    imageUrl: '', // Default to empty, user can provide URL or upload
    featured: false,
    rating: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState<string>('');


  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreviewUrl(dataUrl);
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
      };
      reader.readAsDataURL(imageFile);
    } else {
      // If no file is selected, the preview should rely on manualImageUrl or formData.imageUrl
      if (manualImageUrl) {
         setImagePreviewUrl(manualImageUrl);
         setFormData(prev => ({...prev, imageUrl: manualImageUrl}));
      } else if (formData.imageUrl && !formData.imageUrl.startsWith('data:image')) {
        // if formData.imageUrl is a web URL (not a data URL from previous file upload)
        setImagePreviewUrl(formData.imageUrl);
      } else if (!formData.imageUrl) {
        // If formData.imageUrl is also empty or a dataURL (which means imageFile was cleared)
        setImagePreviewUrl(null);
      }
      // If formData.imageUrl is already a data: URL from a previous file, keep it for preview unless manualImageUrl is set
    }
  }, [imageFile, manualImageUrl, formData.imageUrl]);


  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleManualImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setManualImageUrl(url);
    setFormData(prev => ({ ...prev, imageUrl: url }));
    if (url) { // If user types a URL, clear any selected file
      setImageFile(null);
      // setImagePreviewUrl(url); // Preview updates via useEffect
    } else if (!imageFile) { // If URL is cleared and no file, clear preview
      // setImagePreviewUrl(null); // Preview updates via useEffect
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setManualImageUrl(''); // Clear manual URL input if a file is chosen
      // Preview and formData.imageUrl update via useEffect
    } else {
      setImageFile(null);
      // If file is cleared, formData.imageUrl should fall back to manualImageUrl or be empty
      setFormData(prev => ({ ...prev, imageUrl: manualImageUrl }));
    }
  };

  const handleSelectChange = (name: 'category' | 'brand') => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.name || !formData.price || !formData.category || !formData.brand || !formData.stock) {
        toast({ title: "Missing Fields", description: "Please fill in all required fields (Name, Price, Category, Brand, Stock).", variant: "destructive" });
        setIsLoading(false);
        return;
    }
     if (!formData.imageUrl) {
        toast({ title: "Missing Image", description: "Please provide an image URL or upload an image.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
      const productsCollectionRef = collection(db, 'products');
      await addDoc(productsCollectionRef, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        rating: formData.rating ? parseFloat(formData.rating) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Product Added",
        description: `${formData.name} has been successfully added.`,
      });
      router.push('/admin/products');
    } catch (error: any) {
      console.error("Error adding product to Firestore:", error);
      toast({
        title: "Error Adding Product",
        description: error.message || "An unexpected error occurred. Please try again.",
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
              <Input id="name" name="name" value={formData.name} onChange={handleFormInputChange} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleFormInputChange} disabled={isLoading} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleFormInputChange} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" name="stock" type="number" step="1" value={formData.stock} onChange={handleFormInputChange} required disabled={isLoading} />
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
              <Label htmlFor="imageFile">Upload Image</Label>
              <Input 
                id="imageFile" 
                name="imageFile" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={isLoading} 
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
               <p className="text-xs text-muted-foreground mt-1">Or</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input 
                id="imageUrl" 
                name="imageUrl" 
                value={manualImageUrl} 
                onChange={handleManualImageUrlChange} 
                disabled={isLoading || !!imageFile} 
                placeholder="https://example.com/image.png"
              />
            </div>
            
            {imagePreviewUrl && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="mt-2 relative w-full aspect-video max-w-sm border rounded-md overflow-hidden bg-muted">
                  <Image src={imagePreviewUrl} alt="Product Preview" layout="fill" objectFit="contain" data-ai-hint="product image preview"/>
                </div>
              </div>
            )}
            {!imagePreviewUrl && !manualImageUrl && (
                 <div className="space-y-2">
                    <Label>Image Preview</Label>
                    <div className="mt-2 flex items-center justify-center w-full aspect-video max-w-sm border border-dashed rounded-md bg-muted text-muted-foreground">
                       <div className="text-center">
                         <UploadCloud size={32} className="mx-auto mb-1" />
                         <p className="text-sm">No image selected</p>
                         <p className="text-xs">Upload or provide URL</p>
                       </div>
                    </div>
                 </div>
            )}


             <div className="space-y-2">
              <Label htmlFor="rating">Rating (Optional, 1-5)</Label>
              <Input id="rating" name="rating" type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={handleFormInputChange} disabled={isLoading} />
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
      