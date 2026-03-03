import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Review, Category } from '../types';
import { googleSheetsService } from '../services/googleSheets';
import { serperService } from '../services/serperService';

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  externalProducts: Product[];
  loading: boolean;
  isSearchingDeeper: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: Category[];
  setSelectedCategories: (categories: Category[]) => void;
  toggleCategory: (category: Category) => void;
  clearFilters: () => void;
  searchDeeper: () => Promise<void>;
  getReviews: (productId: string) => Promise<Review[]>;
  addReview: (review: Omit<Review, 'id' | 'date'>) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [externalProducts, setExternalProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchingDeeper, setIsSearchingDeeper] = useState(false);
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
    setExternalProducts([]);
  };

  const searchDeeper = async () => {
    if (!searchQuery) return;
    setIsSearchingDeeper(true);
    const results = await serperService.searchShopping(searchQuery);
    setExternalProducts(results);
    setIsSearchingDeeper(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.some(cat => product.categories.includes(cat));

    // Special logic for "Trending / New Arrivals"
    if (selectedCategories.includes('Trending / New Arrivals')) {
      if (product.dateAdded) {
        const addedDate = new Date(product.dateAdded);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - addedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          // If it matches trending, and other selected categories are none or it matches them
          const otherCategories = selectedCategories.filter(c => c !== 'Trending / New Arrivals');
          if (otherCategories.length === 0 || otherCategories.some(cat => product.categories.includes(cat))) {
            matchesCategory = true;
          }
        } else {
            // If it's not trending but we selected Trending / New Arrivals,
            // it only matches if it matches OTHER selected categories.
            // Wait, if "Trending / New Arrivals" is selected, it should probably be an OR or AND?
            // "Trending / New Arrivals" is a category.
            // If user selects it, they want items that are trending.
            // If they also select "Laptop", they want trending laptops.
            const otherCategories = selectedCategories.filter(c => c !== 'Trending / New Arrivals');
            if (otherCategories.length > 0) {
                matchesCategory = otherCategories.some(cat => product.categories.includes(cat)) && diffDays <= 7;
            } else {
                matchesCategory = diffDays <= 7;
            }
        }
      } else {
          matchesCategory = false;
      }
    }

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
      externalProducts,
      loading,
      isSearchingDeeper,
      searchQuery,
      setSearchQuery,
      selectedCategories,
      setSelectedCategories,
      toggleCategory,
      clearFilters,
      searchDeeper,
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
