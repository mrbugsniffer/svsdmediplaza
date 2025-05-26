
import type { Product, Order } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, limit, Timestamp } from 'firebase/firestore';


export const mockCategories: string[] = [
    "Pain Relief",
    "Vitamins & Supplements",
    "Skin Care",
    "Cold & Flu",
    "Eye Care",
    "Baby Care",
    "Personal Care",
    "Dental Care",
    "First Aid",
    "Others" // Added "Others" category
];

export const mockBrands: string[] = [
    "PharmaWell",
    "NutriBoost",
    "DermaCare",
    "HealFast",
    "MediChoice",
    "HealthPlus",
    "OralFresh"
];


// --- Functions to fetch from Firestore ---

export const getProductByIdFs = async (id: string): Promise<Product | undefined> => {
  try {
    const productDocRef = doc(db, 'products', id);
    const productSnap = await getDoc(productDocRef);
    if (productSnap.exists()) {
      const data = productSnap.data();
      return {
        id: productSnap.id,
        ...data,
        // Ensure price and stock are numbers
        price: Number(data.price) || 0,
        stock: Number(data.stock) || 0,
        rating: data.rating ? Number(data.rating) : undefined,
       } as Product;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching product by ID from Firestore:", error);
    return undefined;
  }
};

export const getAllProductsFs = async (): Promise<Product[]> => {
  try {
    const productsCollectionRef = collection(db, 'products');
    const productsSnap = await getDocs(productsCollectionRef);
    return productsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        price: Number(data.price) || 0,
        stock: Number(data.stock) || 0,
        rating: data.rating ? Number(data.rating) : undefined,
      } as Product;
    });
  } catch (error) {
    console.error("Error fetching all products from Firestore:", error);
    return [];
  }
};

export const getFeaturedProductsFs = async (count: number = 4): Promise<Product[]> => {
  try {
    const productsCollectionRef = collection(db, 'products');
    const q = query(productsCollectionRef, where('featured', '==', true), limit(count));
    const productsSnap = await getDocs(q);
    return productsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        price: Number(data.price) || 0,
        stock: Number(data.stock) || 0,
        rating: data.rating ? Number(data.rating) : undefined,
      } as Product;
    });
  } catch (error) {
    console.error("Error fetching featured products from Firestore:", error);
    return [];
  }
};


// This function will now fetch from Firestore if orders are stored there.
// For now, it uses a local mock, but ideally, it should fetch from db.orders
export const getOrderById = async (id: string): Promise<Order | undefined> => {
  try {
    const orderDocRef = doc(db, 'orders', id);
    const orderSnap = await getDoc(orderDocRef);
    if (orderSnap.exists()) {
      const data = orderSnap.data();
      return {
        id: orderSnap.id,
        ...data,
        // Ensure date fields are correctly handled (they will be Firestore Timestamps)
        orderDate: data.orderDate, // Keep as Timestamp or convert to Date object
        createdAt: data.createdAt, // Keep as Timestamp or convert to Date object
      } as Order;
    }
    console.warn(`Order with ID ${id} not found in Firestore.`);
    return undefined;
  } catch (error) {
    console.error(`Error fetching order ${id} from Firestore:`, error);
    return undefined;
  }
};

