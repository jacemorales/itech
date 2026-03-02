import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItem } from './CartItem';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, subtotal, itemCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-[60] h-full w-full max-w-md bg-white shadow-2xl dark:bg-gray-950"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-bold">Your Cart ({itemCount})</h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800 mb-4">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold">Your cart is empty</h3>
                    <p className="mt-2 text-gray-500">Looks like you haven't added any gadgets yet.</p>
                    <Button
                      className="mt-6 rounded-full"
                      onClick={onClose}
                    >
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t bg-gray-50 p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-medium text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-2xl font-black text-primary-600">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <Button
                    className="w-full rounded-xl py-6 text-lg font-bold"
                    onClick={handleCheckout}
                  >
                    Proceed to Pay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="mt-4 text-center text-xs text-gray-500">
                    Taxes and shipping calculated at checkout
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
