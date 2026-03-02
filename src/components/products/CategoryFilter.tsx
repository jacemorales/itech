import React from 'react';
import { useProducts } from '../../context/ProductContext';
import { CATEGORIES } from '../../types';
import { cn } from '../ui/Button';

export const CategoryFilter: React.FC = () => {
  const { selectedCategories, toggleCategory, clearFilters } = useProducts();

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Categories</h2>
        {selectedCategories.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 underline"
          >
            Clear Filters
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border",
                isSelected
                  ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-600/20"
                  : "bg-white border-gray-200 text-gray-700 hover:border-primary-600 hover:text-primary-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:text-primary-600"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};
