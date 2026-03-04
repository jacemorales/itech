import React from 'react';
import { ShoppingCart, Sun, Moon, Package, Globe, MessageSquare, Star, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface AdminNavbarProps {
  activeView: string;
  onViewChange: (view: any) => void;
  onAddClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  activeView,
  onViewChange,
  onAddClick,
  theme,
  onToggleTheme
}) => {
  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600 tracking-tight">ITECH<span className="text-gray-900 dark:text-white">GADETS</span></span>
            <span className="ml-2 bg-primary-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase">Admin</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {[
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'external-orders', label: 'External', icon: Globe },
            { id: 'custom-requests', label: 'Requests', icon: MessageSquare },
            { id: 'reviews', label: 'Reviews', icon: Star },
          ].map(nav => (
            <button
              key={nav.id}
              onClick={() => onViewChange(nav.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeView === nav.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <nav.icon className="h-4 w-4" />
              {nav.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={onAddClick}
            size="sm"
            className="rounded-xl px-4 py-2 font-bold h-9 shadow-lg shadow-primary-500/20"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Add Gadget</span>
            <span className="sm:hidden">Add</span>
          </Button>

          <button
            onClick={onToggleTheme}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Nav */}
      <div className="lg:hidden flex items-center justify-around p-2 border-t dark:border-gray-800 overflow-x-auto no-scrollbar bg-white dark:bg-gray-950">
        {[
          { id: 'inventory', icon: Package, label: 'Inv' },
          { id: 'orders', icon: ShoppingCart, label: 'Ord' },
          { id: 'external-orders', icon: Globe, label: 'Ext' },
          { id: 'custom-requests', icon: MessageSquare, label: 'Req' },
          { id: 'reviews', icon: Star, label: 'Rev' },
        ].map(nav => (
          <button
            key={nav.id}
            onClick={() => onViewChange(nav.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              activeView === nav.id
                ? 'text-primary-600'
                : 'text-gray-400'
            }`}
          >
            <nav.icon className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-0.5">{nav.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
