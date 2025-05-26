
'use client';

import { useState, useEffect, use, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from '@/components/ui/checkbox';
import { mockBrands } from '@/lib/mock-data'; 
import Link from 'next/link';
import { ChevronLeft, Package, UploadCloud, Edit3Icon } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Product } from '@/types';
import NextImage from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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

export default function EditProductPage({ params: paramsAsPromise }: { params: { id?: string } }) {
  const router = useRouter();
  const resolvedParams = use(paramsAsPromise as any) as { id?: string };
  const { toast } = useToast();
  const productId = resolvedParams?.id;

  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [originalProductName, setOriginalProductName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFirebaseAuthenticatedAdmin, setIsFirebaseAuthenticatedAdmin] = useState(false);
  
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [manualImageUrlInput, setManualImageUrlInput] = useState<string>('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
      setIsFirebaseAuthenticatedAdmin(true);
    } else {
      setIsFirebaseAuthenticatedAdmin(false);
      toast({
        title: "Authentication Error",
        description: "Admin user not authenticated. You cannot edit products.",
        variant: "destructive",
      });
    }
  }, [toast]);


  useEffect(() => {
    if (productId && isFirebaseAuthenticatedAdmin) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const productDocRef = doc(db, 'products', productId);
          const productSnap = await getDoc(productDocRef);

          if (productSnap.exists()) {
            const productData = productSnap.data() as Product;
            const fetchedFormData: ProductFormData = {
              name: productData.name,
              description: productData.description,
              price: productData.price.toString(),
              category: productData.category,
              brand: productData.brand,
              stock: productData.stock.toString(),
              imageUrl: productData.imageUrl || '',
              featured: productData.featured || false,
              // rating: productData.rating?.toString() || '', // Removed rating
            };
            setFormData(fetchedFormData);
            setOriginalProductName(productData.name);
            
            if (productData.imageUrl) {
              if (productData.imageUrl.startsWith('data:image')) {
                setImagePreviewUrl(productData.imageUrl);
                setManualImageUrlInput(''); 
              } else {
                setImagePreviewUrl(productData.imageUrl);
                setManualImageUrlInput(productData.imageUrl);
              }
            } else {
                setImagePreviewUrl(null);
                setManualImageUrlInput('');
            }

          } else {
            toast({ title: "Error", description: "Product not found.", variant: "destructive" });
            router.push('/admin/products');
          }
        } catch (error) {
          console.error("Error fetching product from Firestore:", error);
          toast({ title: "Error", description: "Failed to fetch product details.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    } else if (resolvedParams && !productId) { 
        toast({ title: "Error", description: "Product ID is missing in URL.", variant: "destructive" });
        router.push('/admin/products');
        setIsLoading(false);
    } else if (!isFirebaseAuthenticatedAdmin && productId) {
        setIsLoading(false);
    }
  }, [productId, router, toast, isFirebaseAuthenticatedAdmin]); 


  useEffect(() => {
    if (!formData) return; 

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreviewUrl(dataUrl);
        setFormData(prev => prev ? { ...prev, imageUrl: dataUrl } : null);
      };
      reader.readAsDataURL(imageFile);
    } else if (manualImageUrlInput) {
        setImagePreviewUrl(manualImageUrlInput);
        if(formData.imageUrl !== manualImageUrlInput) {
          setFormData(prev => prev ? { ...prev, imageUrl: manualImageUrlInput } : null);
        }
    } else if (formData.imageUrl && !formData.imageUrl.startsWith('data:image')) {
        setImagePreviewUrl(formData.imageUrl);
    } else if (formData.imageUrl && formData.imageUrl.startsWith('data:image') && !imageFile && !manualImageUrlInput) {
        setImagePreviewUrl(formData.imageUrl);
    } else {
        setImagePreviewUrl(null);
    }
  }, [imageFile, manualImageUrlInput, formData]); 


  const handleFormInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => prev ? { ...prev, [name]: checked } : null);
    } else {
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleManualImageUrlInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const url = e.target.value;
    setManualImageUrlInput(url); 
    setImageFile(null); 
    setFormData(prev => prev ? { ...prev, imageUrl: url } : null);
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); 
      setManualImageUrlInput(''); 
    } else { 
      setImageFile(null);
      if (!manualImageUrlInput) {
         setFormData(prev => prev ? { ...prev, imageUrl: '' } : null);
      }
    }
  };

  const handleSelectChange = (name: 'brand') => (value: string) => {
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData || !productId) return; 
    if (!isFirebaseAuthenticatedAdmin) {
      toast({ title: "Action Denied", description: "Admin not authenticated. Cannot update product.", variant: "destructive"});
      return;
    }
    setIsSubmitting(true);

    if (!formData.name || !formData.price || !formData.category || !formData.brand || !formData.stock) {
        toast({ title: "Missing Fields", description: "Please fill in all required fields (Name, Price, Category, Brand, Stock).", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    if (!formData.imageUrl) {
        toast({ title: "Missing Image", description: "Please provide an image URL or upload an image.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      const productDocRef = doc(db, 'products', productId);
      await updateDoc(productDocRef, {
        ...formData, 
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        // rating: formData.rating ? parseFloat(formData.rating) : null, // Removed rating
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Product Updated",
        description: `${formData.name} has been successfully updated.`,
      });
      router.push('/admin/products');
    } catch (error: any) {
      console.error("Error updating product in Firestore:", error);
       let desc = "Could not update product. ";
       if (error.code === 'permission-denied') {
        desc += "Firestore permission denied. Ensure the admin user has update permissions for the 'products' collection and appropriate custom claims if required by security rules.";
      } else {
        desc += error.message;
      }
      toast({
        title: "Error Updating Product",
        description: desc,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isFirebaseAuthenticatedAdmin && !isLoading) {
    return (
      <div className="space-y-6 text-center py-10">
         <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
         <p className="text-muted-foreground">You must be an authenticated admin to edit products.</p>
         <Button asChild variant="outline" className="mt-4">
           <Link href="/admin/login">Go to Admin Login</Link>
         </Button>
          <Button variant="outline" asChild className="mt-4 ml-2">
           <Link href="/admin/products">Back to Products</Link>
         </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
            <Package size={32} className="animate-pulse mb-2 text-primary" />
            <p className="text-muted-foreground">Loading product details...</p>
        </div>
    );
  }

  if (!formData) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p className="text-destructive">Product data could not be loaded or product ID is invalid.</p></div>;
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
          <CardTitle className="text-2xl font-bold flex items-center gap-2"><Edit3Icon /> Edit Product</CardTitle>
          <CardDescription>Modify the details for &quot;{originalProductName || formData.name}&quot;.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleFormInputChange} required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleFormInputChange} disabled={isSubmitting} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleFormInputChange} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" name="stock" type="number" step="1" value={formData.stock} onChange={handleFormInputChange} required disabled={isSubmitting} />
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" value={formData.category} onChange={handleFormInputChange} required disabled={isSubmitting} placeholder="e.g., Pain Relief, Skin Care"/>
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
              <Label htmlFor="imageFile">Upload New Image (Optional)</Label>
              <Input 
                id="imageFile" 
                name="imageFile" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={isSubmitting}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">Uploading a new file will replace the current image URL.</p>
               <p className="text-xs text-muted-foreground mt-1">Or</p>
            </div>

             <div className="space-y-2">
              <Label htmlFor="manualImageUrlInput">Current or New Image URL</Label>
              <Input 
                id="manualImageUrlInput" 
                name="manualImageUrlInput" 
                value={manualImageUrlInput} 
                onChange={handleManualImageUrlInputChange} 
                disabled={isSubmitting || !!imageFile} 
                placeholder="https://example.com/image.png" 
              />
            </div>
            
            {imagePreviewUrl && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="mt-2 relative w-full aspect-video max-w-sm border rounded-md overflow-hidden bg-muted">
                  <NextImage src={imagePreviewUrl} alt="Product Preview" layout="fill" objectFit="contain" data-ai-hint="product current image"/>
                </div>
              </div>
            )}
             {!imagePreviewUrl && ( 
                 <div className="space-y-2">
                    <Label>Image Preview</Label>
                    <div className="mt-2 flex items-center justify-center w-full aspect-video max-w-sm border border-dashed rounded-md bg-muted text-muted-foreground">
                       <div className="text-center">
                         <UploadCloud size={32} className="mx-auto mb-1" />
                         <p className="text-sm">No image selected or URL provided</p>
                       </div>
                    </div>
                 </div>
            )}

            {/* Rating input removed */}
            <div className="flex items-center space-x-2">
                <Checkbox id="featured" name="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => prev ? { ...prev, featured: Boolean(checked) } : null)} disabled={isSubmitting} />
                <Label htmlFor="featured" className="font-normal">Mark as Featured Product</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="outline" onClick={() => router.push('/admin/products')} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || isLoading || !isFirebaseAuthenticatedAdmin}>
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
