import React from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { SearchBar } from '../components/layout/SearchBar';
import { CategoryFilter } from '../components/products/CategoryFilter';
import { ProductGrid } from '../components/products/ProductGrid';
import { motion } from 'framer-motion';
import { ShoppingCart, Moon, Sun } from 'lucide-react';

interface HomeProps {
  onOpenCart: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Home: React.FC<HomeProps> = ({ onOpenCart, theme, onToggleTheme }) => {
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-16 dark:bg-gray-950 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            {/* Minimal Header Actions since Navbar is gone */}
            <div className="absolute top-8 right-8 flex items-center gap-4 z-50">
               <button
                onClick={onOpenCart}
                className="relative rounded-full p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border dark:border-gray-700 transition-transform hover:scale-105"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-md">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={onToggleTheme}
                className="rounded-full p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border dark:border-gray-700 transition-transform hover:scale-105"
              >
                {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
              </button>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl uppercase"
            >
              The Best Gadgets, <span className="text-primary-600">ITECHGADETS.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl"
            >
              Explore our curated selection of high-quality electronics, from the iconic iPod to the latest iPad and powerful laptops.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full sticky top-[24px] z-30 py-4 px-4 rounded-3xl"
            >
              <SearchBar />
            </motion.div>
          </div>
        </div>

        {/* Background shapes */}
        <div className="absolute -left-20 -top-20 -z-10 h-64 w-64 rounded-full bg-primary-600/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 -z-10 h-96 w-96 rounded-full bg-primary-600/10 blur-3xl" />
      </section>

      {/* Product Section */}
      <section id="products" className="bg-gray-50 py-16 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="col-span-1 md:col-span-1">
              <div className="sticky top-24">
                <CategoryFilter />
              </div>
            </aside>
            <main className="col-span-1 md:col-span-3">
              <ProductGrid />
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
