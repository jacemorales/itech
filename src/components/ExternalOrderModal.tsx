import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { googleSheetsService } from '../services/googleSheets';
import { toast } from 'sonner';
import type { Product } from '../types';

interface ExternalOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ExternalOrderModal: React.FC<ExternalOrderModalProps> = ({ isOpen, onClose, product }) => {
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');

  if (!product) return null;

  // Since it's external, we use the numeric price extracted from the API
  const price = product.price || 0;
  const totalPrice = price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const orderData = {
      gadgetName: product.name,
      source: product.source || 'Unknown',
      quantity,
      email,
      price,
      totalPrice,
      imageUrl: Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl
    };

    const success = await googleSheetsService.addExternalOrder(orderData);
    if (success) {
      toast.success('Your order has been placed! We will reach out to you via email.');
      onClose();
      setQuantity(1);
      setEmail('');
    } else {
      toast.error('Failed to place order. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary-600" />
                Order Item
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pl-2">
              <Input
                label="Gadget Name"
                value={product.name}
                readOnly
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />

              <Input
                label="Source"
                value={product.source || 'N/A'}
                readOnly
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 rounded-xl border-2 px-3 py-1 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-bold w-6 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Unit Price</span>
                  <span className="font-bold">${price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-black pt-2 border-t dark:border-gray-700">
                  <span>Total</span>
                  <span className="text-primary-600">${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Hidden fields */}
              <input type="hidden" name="price" value={price} />
              <input type="hidden" name="totalPrice" value={totalPrice} />
              <input type="hidden" name="imageUrl" value={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl} />

              <Button
                type="submit"
                className="w-full rounded-2xl py-6 text-lg font-bold h-14 shadow-lg"
                loading={submitting}
                disabled={submitting}
              >
                Submit Order
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
