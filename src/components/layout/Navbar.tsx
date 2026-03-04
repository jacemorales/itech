import React, { useState } from 'react';
import { ShoppingCart, Sun, Moon, Menu, X, Shield } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onOpenCart: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, theme, onToggleTheme }) => {
  const { itemCount } = useCart();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600 tracking-tight">ITECH<span className="text-gray-900 dark:text-white">GADETS</span></span>
            {isAdmin && <span className="ml-2 bg-primary-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase">Admin</span>}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <button
              onClick={() => onOpenCart()}
              className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={onToggleTheme}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
              >
                Home
              </Link>
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 font-bold flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
