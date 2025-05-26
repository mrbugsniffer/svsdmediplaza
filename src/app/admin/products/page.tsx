
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Product } from '@/types';
import { PlusCircle, Edit, Trash2, Search, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase'; 
import { collection, deleteDoc, doc, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ADMIN_EMAIL = 'admin@gmail.com'; 

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseAuthenticatedAdmin, setIsFirebaseAuthenticatedAdmin] = useState(false);
  const { toast } = useToast();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
      setIsFirebaseAuthenticatedAdmin(true);
    } else {
      setIsFirebaseAuthenticatedAdmin(false);
      setIsLoading(false);
      toast({
        title: "Authentication Error",
        description: "Admin user not authenticated with Firebase. Product management requires admin login.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const productsCollectionRef = collection(db, 'products');
    
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setProducts(productsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products from Firestore:", error);
      let desc = "Failed to fetch products. ";
      if (error.code === 'permission-denied') {
        desc += "Firestore permission denied. Ensure the admin user has read access to the 'products' collection and appropriate custom claims if required by security rules.";
      } else {
        desc += error.message;
      }
      toast({ title: "Error Fetching Products", description: desc, variant: "destructive", duration: 8000 });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const confirmDeleteProduct = (product: Product) => {
    if (!isFirebaseAuthenticatedAdmin) {
      toast({ title: "Action Denied", description: "Admin not authenticated. Cannot delete product.", variant: "destructive"});
      return;
    }
    setProductToDelete(product);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete || !isFirebaseAuthenticatedAdmin) {
        toast({ title: "Action Denied", description: "Admin not authenticated or no product selected. Cannot delete.", variant: "destructive"});
        setProductToDelete(null);
        return;
    }
    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      toast({
        title: "Product Deleted",
        description: `${productToDelete.name} has been successfully deleted.`,
      });
    } catch (error: any) {
      console.error("Error deleting product from Firestore:", error);
      let desc = "Could not delete product. ";
       if (error.code === 'permission-denied') {
        desc += "Firestore permission denied. Ensure the admin user has delete permissions for the 'products' collection and appropriate custom claims if required by security rules.";
      } else {
        desc += error.message;
      }
      toast({
        title: "Error Deleting Product",
        description: desc,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setProductToDelete(null); 
    }
  };
  
  if (!isFirebaseAuthenticatedAdmin && !isLoading) {
    return (
      <div className="space-y-6 text-center py-10">
         <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
         <p className="text-muted-foreground">Admin user is not authenticated with Firebase. Please re-login to manage products.</p>
         <Button asChild><Link href="/admin/login">Go to Admin Login</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Products</h1>
            <p className="text-muted-foreground">View, add, edit, or delete products.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/admin/products/add">
            <PlusCircle size={18} className="mr-2" /> Add New Product
          </Link>
        </Button>
      </div>

       <Card className="shadow-md">
        <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>
                Search and manage your existing products. Total: {filteredProducts.length} products.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search products by name, category, or brand..."
                className="pl-8 w-full sm:w-1/2 lg:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="overflow-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <Package size={32} className="animate-pulse mr-2 text-primary" />
                        <p>Loading products...</p>
                    </div>
                ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell>
                        <Image
                            src={product.imageUrl || 'https://placehold.co/40x40.png'}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded object-cover aspect-square"
                            data-ai-hint={`${product.category?.toLowerCase()} product`}
                        />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell className="text-right">₹{product.price?.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{product.stock}</TableCell>
                        <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                            <Button variant="outline" size="icon" asChild  className="hover:text-primary hover:border-primary">
                                <Link href={`/admin/products/${product.id}/edit`}>
                                    <Edit size={16} />
                                    <span className="sr-only">Edit {product.name}</span>
                                </Link>
                            </Button>
                            <Button
                            variant="outline"
                            size="icon"
                            onClick={() => confirmDeleteProduct(product)}
                            className="text-destructive hover:text-destructive hover:border-destructive/50"
                            >
                            <Trash2 size={16} />
                            <span className="sr-only">Delete {product.name}</span>
                            </Button>
                        </div>
                        </TableCell>
                    </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center h-24">
                                {products.length === 0 && !isLoading ? "No products found. Add your first product!" : ""}
                                {products.length > 0 && filteredProducts.length === 0 && !isLoading ? "No products found matching your search." : ""}
                                {!isLoading && products.length === 0 && <Package size={24} className="mx-auto mb-1 text-muted-foreground"/>}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
                )}
            </div>
        </CardContent>
       </Card>
        <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product
                "{productToDelete?.name}" from the database.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Yes, delete product
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
