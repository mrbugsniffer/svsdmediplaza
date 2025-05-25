import type { Product, Order } from '@/types';

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Instant Pain Relief Tablets',
    description: 'Fast-acting tablets for effective relief from headaches, muscle pain, and fever. Contains 500mg Paracetamol.',
    price: 5.99,
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Pain Relief',
    brand: 'PharmaWell',
    featured: true,
    stock: 150,
    rating: 4.5,
  },
  {
    id: 'prod-002',
    name: 'Vitamin C Boost Gummies',
    description: 'Delicious orange-flavored gummies packed with Vitamin C to support your immune system. 60 gummies per bottle.',
    price: 12.49,
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Vitamins & Supplements',
    brand: 'NutriBoost',
    featured: true,
    stock: 200,
    rating: 4.8,
  },
  {
    id: 'prod-003',
    name: 'Sensitive Skin Moisturizer',
    description: 'A gentle, hydrating moisturizer formulated for sensitive skin. Fragrance-free and dermatologically tested.',
    price: 18.75,
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Skin Care',
    brand: 'DermaCare',
    stock: 80,
    rating: 4.2,
  },
  {
    id: 'prod-004',
    name: 'Cold & Flu Night Syrup',
    description: 'Effective relief from cold and flu symptoms for a restful night. Non-drowsy formula for daytime also available.',
    price: 9.99,
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Cold & Flu',
    brand: 'HealFast',
    stock: 120,
    rating: 4.0,
  },
  {
    id: 'prod-005',
    name: 'Multivitamin Daily Capsules',
    description: 'A comprehensive daily multivitamin to support overall health and well-being. Contains essential vitamins and minerals.',
    price: 22.00,
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Vitamins & Supplements',
    brand: 'NutriBoost',
    featured: true,
    stock: 90,
    rating: 4.6,
  },
  {
    id: 'prod-006',
    name: 'Advanced Eye Care Drops',
    description: 'Soothing eye drops for dry, irritated eyes. Provides long-lasting comfort and lubrication.',
    price: 7.25,
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Eye Care',
    brand: 'PharmaWell',
    stock: 75,
    rating: 4.3,
  },
  {
    id: 'prod-007',
    name: 'Children\'s Cough Syrup',
    description: 'Gentle and effective cough relief for children aged 2+. Cherry flavored and alcohol-free.',
    price: 6.50,
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Cold & Flu',
    brand: 'HealFast',
    stock: 110,
  },
  {
    id: 'prod-008',
    name: 'SPF 50 Sunscreen Lotion',
    description: 'Broad-spectrum SPF 50 sunscreen for all skin types. Water-resistant and non-greasy formula.',
    price: 15.99,
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Skin Care',
    brand: 'DermaCare',
    stock: 60,
    rating: 4.7,
  },
];

export const mockCategories: string[] = Array.from(new Set(mockProducts.map(p => p.category)));
export const mockBrands: string[] = Array.from(new Set(mockProducts.map(p => p.brand)));

export const mockOrders: Order[] = [
  {
    id: 'order-12345',
    items: [
      { ...mockProducts[0], quantity: 1 },
      { ...mockProducts[2], quantity: 2 },
    ],
    totalAmount: (mockProducts[0].price * 1) + (mockProducts[2].price * 2),
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
  {
    id: 'order-67890',
    items: [
      { ...mockProducts[1], quantity: 1 },
    ],
    totalAmount: mockProducts[1].price * 1,
    orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'Processing',
    shippingAddress: {
      fullName: 'John Smith',
      address: '456 Oak Ave',
      city: 'Otherville',
      postalCode: '67890',
      country: 'USA',
    },
    customerEmail: 'john.smith@example.com',
  },
];

export const getProductById = async (id: string): Promise<Product | undefined> => {
  return mockProducts.find(p => p.id === id);
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  return mockOrders.find(o => o.id === id);
};
