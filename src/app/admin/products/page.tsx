
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockProducts } from '@/lib/mock-data'; // Using mock data for now
import type { Product } from '@/types';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // In a real app, this would come from a state management solution or API call
  const products = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteProduct = (productId: string) => {
    // Implement actual delete logic here (e.g., API call)
    alert(`Demo: Delete product ${productId}. This would call an API.`);
    // To reflect change with mock data, you'd need to update the mockProducts array
    // and potentially re-filter or manage state. For now, it's just an alert.
  };

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
                Search and manage your existing products. Total: {products.length} products.
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
            <div className="overflow-x-auto">
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
                    {products.length > 0 ? products.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell>
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded object-cover aspect-square"
                            data-ai-hint={`${product.category.toLowerCase()} product`}
                        />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
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
                            onClick={() => handleDeleteProduct(product.id)}
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
                                No products found matching your search.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
