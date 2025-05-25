
import type { Product, Order } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';

// mockProducts array is now obsolete as products are fetched from Firestore.
// You can remove it or keep it commented for reference.
/*
export const mockProducts: Product[] = [
  // ... original mock products data
];
*/

export const mockCategories: string[] = [
    "Pain Relief", 
    "Vitamins & Supplements", 
    "Skin Care", 
    "Cold & Flu", 
    "Eye Care", 
    "Baby Care", 
    "Personal Care", 
    "Dental Care",
    "First Aid"
]; // Keep for filter dropdowns, or make dynamic later

export const mockBrands: string[] = [
    "PharmaWell", 
    "NutriBoost", 
    "DermaCare", 
    "HealFast", 
    "MediChoice", 
    "HealthPlus",
    "OralFresh"
]; // Keep for filter dropdowns, or make dynamic later


// --- Functions to fetch from Firestore ---

// Get a single product by ID from Firestore
export const getProductByIdFs = async (id: string): Promise<Product | undefined> => {
  try {
    const productDocRef = doc(db, 'products', id);
    const productSnap = await getDoc(productDocRef);
    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() } as Product;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching product by ID from Firestore:", error);
    return undefined;
  }
};

// Get all products from Firestore
export const getAllProductsFs = async (): Promise<Product[]> => {
  try {
    const productsCollectionRef = collection(db, 'products');
    const productsSnap = await getDocs(productsCollectionRef);
    return productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("Error fetching all products from Firestore:", error);
    return [];
  }
};

// Get featured products from Firestore
export const getFeaturedProductsFs = async (count: number = 4): Promise<Product[]> => {
  try {
    const productsCollectionRef = collection(db, 'products');
    const q = query(productsCollectionRef, where('featured', '==', true), limit(count));
    const productsSnap = await getDocs(q);
    return productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("Error fetching featured products from Firestore:", error);
    return [];
  }
};


// Mock orders can remain as they are not part of this update's scope
export const mockOrders: Order[] = [
  {
    id: 'order-12345',
    items: [
      // Replace with dynamic product data structure if needed, or keep as placeholder for now
      { id: 'prod-001', name: 'Instant Pain Relief Tablets', price: 5.99, quantity: 1, imageUrl: 'https://placehold.co/600x400.png', category: 'Pain Relief', brand: 'PharmaWell', stock: 100 },
      { id: 'prod-003', name: 'Sensitive Skin Moisturizer', price: 18.75, quantity: 2, imageUrl: 'https://placehold.co/600x400.png', category: 'Skin Care', brand: 'DermaCare', stock: 50 },
    ],
    totalAmount: (5.99 * 1) + (18.75 * 2),
    orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: 'Shipped',
    shippingAddress: {
      fullName: 'Jane Doe',
      address: '123 Main St',
      city: 'Anytown',
      postalCode: '12345',
      country: 'USA',
    },
    customerEmail: 'jane.doe@example.com',
  },
  // ... other mock orders
];

// This function might need to be updated if orders depend on product details from Firestore
export const getOrderById = async (id: string): Promise<Order | undefined> => {
  // For now, it continues to use mockOrders
  return mockOrders.find(o => o.id === id);
};
