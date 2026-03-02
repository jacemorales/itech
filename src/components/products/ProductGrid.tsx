import React from 'react';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductGrid: React.FC = () => {
  const { filteredProducts, loading } = useProducts();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
            <div className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800">
          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-bold">No gadgets found</h3>
        <p className="mt-2 text-gray-500 max-w-sm">
          We couldn't find any gadgets matching your criteria. Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <AnimatePresence>
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
