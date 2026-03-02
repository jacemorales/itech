import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import type { CartItem as CartItemType } from '../../types';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 border-b py-4 last:border-0 dark:border-gray-800">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <img
          src={Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <h4 className="font-bold text-gray-900 line-clamp-1 dark:text-gray-100">{item.name}</h4>
          <span className="font-bold text-primary-600">₦{(item.price * item.quantity).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 rounded-lg border px-2 py-1 dark:border-gray-700">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
