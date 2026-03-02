import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Review, Category } from '../types';
import { googleSheetsService } from '../services/googleSheets';

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: Category[];
  setSelectedCategories: (categories: Category[]) => void;
  toggleCategory: (category: Category) => void;
  clearFilters: () => void;
  getReviews: (productId: string) => Promise<Review[]>;
  addReview: (review: Omit<Review, 'id' | 'date'>) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    const data = await googleSheetsService.getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.some(cat => product.categories.includes(cat));

    return matchesSearch && matchesCategory;
  });

  const getReviews = (productId: string) => googleSheetsService.getReviews(productId);
  const addReview = (review: Omit<Review, 'id' | 'date'>) => googleSheetsService.addReview(review);
  const addProduct = (product: Omit<Product, 'id'>) => googleSheetsService.addProduct(product);
  const updateProduct = (id: string, product: Partial<Product>) => googleSheetsService.updateProduct(id, product);
  const refreshProducts = fetchProducts;

  return (
    <ProductContext.Provider value={{
      products,
      filteredProducts,
      loading,
      searchQuery,
      setSearchQuery,
      selectedCategories,
      setSelectedCategories,
      toggleCategory,
      clearFilters,
      getReviews,
      addReview,
      addProduct,
      updateProduct,
      refreshProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};
