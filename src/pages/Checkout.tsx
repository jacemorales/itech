import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { Navigate, Link } from 'react-router-dom';
import { googleSheetsService } from '../services/googleSheets';
import { ShoppingBag, CreditCard, ShieldCheck, MapPin, MessageSquare, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Checkout: React.FC = () => {
  const { cart, subtotal, clearCart } = useCart();
  const isExternalOrder = cart.some(item => item.isExternal);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    matricNumber: '',
    regNumber: '',
    email: '',
    platform: 'WhatsApp' as 'WhatsApp' | 'Telegram',
    platformValue: '',
    deliveryLocation: ''
  });

  const deliveryFee = isExternalOrder ? 0 : 500;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return <Navigate to="/" />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (platform: 'WhatsApp' | 'Telegram') => {
    setFormData(prev => ({ ...prev, platform, platformValue: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Save the order details to the database
    // Format: item ordered, price, quantity, total price
    const orderData = {
      ...formData,
      items: cart.map(item => `${item.name} (Price: ₦${item.price.toLocaleString()}, Qty: ${item.quantity}, Item Total: ₦${(item.price * item.quantity).toLocaleString()})`).join(' | '),
      subtotal,
      total
    };

    toast.info('Processing order...');

    try {
      await googleSheetsService.addOrder(orderData);
      toast.success('Order details saved! Redirecting to payment...');

      // Clear cart before redirect
      clearCart();

      // Delay to show success toast before redirect
      setTimeout(() => {
        window.location.href = 'https://pay-naira.netlify.app';
      }, 1000);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to save order details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex items-center justify-between mb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border dark:border-gray-800 dark:bg-gray-950 shadow-sm"
          >
            <h2 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary-600" />
              Secure Checkout
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              {isExternalOrder && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 mb-8">
                  <h3 className="text-blue-800 dark:text-blue-300 font-bold mb-2">External Item Order</h3>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">
                    You are ordering an item from our extended catalog. Our team will contact you to finalize procurement and delivery.
                  </p>
                  <div className="mt-4 space-y-2">
                    {cart.map(item => item.isExternal && (
                      <div key={item.id} className="text-xs text-blue-500 font-medium">
                        • {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Matric Number"
                  name="matricNumber"
                  placeholder="e.g., 2021/12345"
                  value={formData.matricNumber}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Registration Number"
                  name="regNumber"
                  placeholder="e.g., REG/ABC/001"
                  value={formData.regNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Preferred Communication Platform
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handlePlatformChange('WhatsApp')}
                    className={`flex items-center justify-center gap-3 rounded-2xl border-2 py-4 font-bold transition-all ${
                      formData.platform === 'WhatsApp'
                        ? 'bg-green-50 border-green-600 text-green-700 dark:bg-green-950/20'
                        : 'border-gray-100 hover:border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlatformChange('Telegram')}
                    className={`flex items-center justify-center gap-3 rounded-2xl border-2 py-4 font-bold transition-all ${
                      formData.platform === 'Telegram'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/20'
                        : 'border-gray-100 hover:border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    Telegram
                  </button>
                </div>
                <div className="mt-4">
                  <Input
                    label={formData.platform === 'WhatsApp' ? 'WhatsApp Number' : 'Telegram Username'}
                    name="platformValue"
                    placeholder={formData.platform === 'WhatsApp' ? '+234 800 000 0000' : '@username'}
                    value={formData.platformValue}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <Input
                label="Delivery Location"
                name="deliveryLocation"
                placeholder="e.g., Paul, D104"
                value={formData.deliveryLocation}
                onChange={handleInputChange}
                required
              />

              <Button
                type="submit"
                className="w-full rounded-2xl py-6 text-xl font-bold h-16 shadow-lg"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {!isSubmitting && <CreditCard className="mr-3 h-6 w-6" />}
                {isSubmitting ? 'Processing...' : 'Pay Now'}
              </Button>
            </form>
          </motion.div>
        </div>

        <div className="lg:w-96">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-50 rounded-3xl p-8 border dark:border-gray-800 dark:bg-gray-900 sticky top-24"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Summary
            </h3>

            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.name} <span className="font-bold">x {item.quantity}</span>
                  </span>
                  <span className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t dark:border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-bold">₦{subtotal.toLocaleString()}</span>
              </div>
              {!isExternalOrder && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    Delivery Fee <MapPin className="h-3 w-3" />
                  </span>
                  <span className="font-bold">₦500</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black pt-4 border-t-2 border-dashed dark:border-gray-700">
                <span>Total</span>
                <span className="text-primary-600">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-4 border dark:border-gray-700">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By clicking "Pay Now", you agree to our terms of service and delivery policy.
                Your order will be processed immediately upon payment verification.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
