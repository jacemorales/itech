export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categories: string[];
  imageUrl: string | string[];
  stock?: number;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  text: string;
  rating: number;
  date: string;
}

export interface CustomRequest {
  id: string;
  gadgetName: string;
  description: string;
  imageUrl: string;
  email: string;
  date: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type Category = 'iPod' | 'iPad' | 'Accessories' | 'Speaker' | 'Laptop';

export const CATEGORIES: Category[] = ['iPod', 'iPad', 'Accessories', 'Speaker', 'Laptop'];
