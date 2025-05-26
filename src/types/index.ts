
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  featured?: boolean;
  stock: number;
  rating?: number; // Optional rating 1-5
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string; // Firestore document ID
  userId?: string; // ID of the user who placed the order
  customerEmail: string; // Email of the customer
  items: CartItem[];
  totalAmount: number;
  orderDate: any; // Firestore Timestamp (will be set by serverTimestamp) / or Date string from mock
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: ShippingAddress;
  createdAt: any; // Firestore Timestamp
  // updatedAt?: any; // Optional: Firestore Timestamp for order updates
}

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  defaultShippingAddress?: ShippingAddress;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}
