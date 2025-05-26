
'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockBrands } from '@/lib/mock-data';
import Link from 'next/link';
import { ChevronLeft, UploadCloud, PackagePlus } from 'lucide-react';
import { db, auth } from '@/lib/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';

const ADMIN_EMAIL = 'admin@gmail.com'; 

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  brand: string;
  stock: string;
  imageUrl: string;
  featured: boolean;
  // rating?: string; // Removed rating
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
    imageUrl: '',
    featured: false,
    // rating: '', // Removed rating
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFirebaseAuthenticatedAdmin, setIsFirebaseAuthenticatedAdmin] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState<string>('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
      setIsFirebaseAuthenticatedAdmin(true);
    } else {
      setIsFirebaseAuthenticatedAdmin(false);
      toast({
        title: "Authentication Error",
        description: "Admin user not authenticated. You cannot add products.",
        variant: "destructive",
      });
    }
  }, [toast, router]);


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
      if (manualImageUrl) {
         setImagePreviewUrl(manualImageUrl);
         setFormData(prev => ({...prev, imageUrl: manualImageUrl}));
      } else if (formData.imageUrl && !formData.imageUrl.startsWith('data:image')) {
        setImagePreviewUrl(formData.imageUrl);
      } else if (!formData.imageUrl) {
        setImagePreviewUrl(null);
      }
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
    if (url) { 
      setImageFile(null);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setManualImageUrl(''); 
    } else {
      setImageFile(null);
      setFormData(prev => ({ ...prev, imageUrl: manualImageUrl }));
    }
  };

  const handleSelectChange = (name: 'brand') => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFirebaseAuthenticatedAdmin) {
      toast({ title: "Action Denied", description: "Admin not authenticated. Cannot add product.", variant: "destructive"});
      return;
    }
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
        // rating: formData.rating ? parseFloat(formData.rating) : null, // Removed rating
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
      let desc = "Could not add product. ";
      if (error.code === 'permission-denied') {
        desc += `Firestore permission denied. Ensure the admin user (${ADMIN_EMAIL}) has write permissions for the 'products' collection and the necessary 'admin: true' custom claim.`;
      } else {
        desc += error.message;
      }
      toast({
        title: "Error Adding Product",
        description: desc,
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isFirebaseAuthenticatedAdmin && !isLoading) { 
    return (
      <div className="space-y-6 text-center py-10">
         <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
         <p className="text-muted-foreground">You must be an authenticated admin to add products.</p>
         <Button asChild variant="outline" className="mt-4">
           <Link href="/admin/login">Go to Admin Login</Link>
         </Button>
          <Button variant="outline" asChild className="mt-4 ml-2">
           <Link href="/admin/products">Back to Products</Link>
         </Button>
      </div>
    )
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
          <CardTitle className="text-2xl font-bold flex items-center gap-2"><PackagePlus /> Add New Product</CardTitle>
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
                    <Input id="category" name="category" value={formData.category} onChange={handleFormInputChange} required disabled={isLoading} placeholder="e.g., Pain Relief, Skin Care" />
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

            {/* Rating input removed */}
            <div className="flex items-center space-x-2">
                <Checkbox id="featured" name="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: Boolean(checked) }))} disabled={isLoading} />
                <Label htmlFor="featured" className="font-normal">Mark as Featured Product</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/products')} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || !isFirebaseAuthenticatedAdmin}>
                  {isLoading ? 'Adding Product...' : 'Add Product'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
