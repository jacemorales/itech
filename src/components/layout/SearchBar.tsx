import React from 'react';
import { Search } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useProducts();

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-2xl bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Search for gadgets (e.g., iPod, iPad, Laptop...)"
      />
    </div>
  );
};
