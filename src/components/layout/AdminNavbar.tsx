import React from 'react';
import { ShoppingCart, Sun, Moon, Package, Globe, MessageSquare, Star, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface AdminNavbarProps {
  activeView: string;
  onViewChange: (view: any) => void;
  onAddClick: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  activeView,
  onViewChange,
  onAddClick,
  onRefresh,
  refreshing,
  theme,
  onToggleTheme
}) => {
  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
      <div className="container mx-auto px-4">
        {/* Top Row: Logo & Actions */}
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600 tracking-tight">ITECH<span className="text-gray-900 dark:text-white">GADETS</span></span>
            <span className="bg-primary-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Admin</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {activeView !== 'inventory' && onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}

            <Button
              onClick={onAddClick}
              size="sm"
              className="rounded-xl px-3 sm:px-4 py-2 font-bold h-9 shadow-lg shadow-primary-500/20"
            >
              <Plus className="sm:mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Add Gadget</span>
              <span className="sm:hidden text-xs">Add</span>
            </Button>

            <button
              onClick={onToggleTheme}
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation Links (Scrollable on Mobile) */}
        <div className="flex items-center gap-1 pb-2 overflow-x-auto no-scrollbar scroll-smooth">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                activeView === nav.id
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <nav.icon className="h-3.5 w-3.5" />
              {nav.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
