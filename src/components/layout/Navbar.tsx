import React from 'react';
import { ShoppingCart, Sun, Moon } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onOpenCart: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, theme, onToggleTheme }) => {
  const { itemCount } = useCart();

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="iTech Logo" className="h-10 w-auto" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
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

          <button
            onClick={onToggleTheme}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </nav>
  );
};
