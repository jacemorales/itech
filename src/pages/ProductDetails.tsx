import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import type { Product, Review } from '../types';
import { Button } from '../components/ui/Button';
import { Minus, Plus, ShoppingCart, Star, ChevronLeft, ChevronRight, Calendar, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, TextArea } from '../components/ui/Input';
import { toast } from 'sonner';
import { ExternalOrderModal } from '../components/ExternalOrderModal';

interface ProductDetailsProps {
  onOpenCart: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ onOpenCart, theme, onToggleTheme }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, getReviews, addReview, loading: productsLoading } = useProducts();
  const { addToCart, itemCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', text: '', rating: 5 });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    // Check if we passed an external product in state
    if (location.state?.externalProduct) {
      setProduct(location.state.externalProduct);
      setLoading(false);
      return;
    }

    if (!productsLoading && products.length > 0) {
      const foundProduct = products.find(p => String(p.id) === String(id));
      if (foundProduct) {
        setProduct(foundProduct);
        loadReviews(foundProduct.id);
      } else {
        setLoading(false);
      }
    } else if (!productsLoading && products.length === 0) {
      setLoading(false);
    }
  }, [id, products, productsLoading, location.state]);

  useEffect(() => {
    if (product && Array.isArray(product.imageUrl) && product.imageUrl.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % (product.imageUrl as string[]).length);
      }, 5000); // Increased to 5s to allow manual viewing
      return () => clearInterval(interval);
    }
  }, [product]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product && Array.isArray(product.imageUrl)) {
      setCurrentImageIndex(prev => (prev - 1 + product.imageUrl.length) % product.imageUrl.length);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product && Array.isArray(product.imageUrl)) {
      setCurrentImageIndex(prev => (prev + 1) % product.imageUrl.length);
    }
  };

  const loadReviews = async (productId: string) => {
    setLoading(true);
    const data = await getReviews(productId);
    setReviews(data);
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (product) {
      if (product.isExternal) {
        setIsOrderModalOpen(true);
        return;
      }
      addToCart(product, quantity);
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || submittingReview) return;

    setSubmittingReview(true);
    const success = await addReview({
      productId: product.id,
      name: newReview.name,
      text: newReview.text,
      rating: newReview.rating
    });

    if (success) {
      toast.success('Review submitted successfully!');
      setNewReview({ name: '', text: '', rating: 5 });
      loadReviews(product.id);
    } else {
      toast.error('Failed to submit review. Please try again.');
    }
    setSubmittingReview(false);
  };

  if (productsLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-24 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-12 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Gadget not found</h2>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenCart}
            className="relative rounded-full p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border dark:border-gray-700 transition-transform hover:scale-105"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-md">
                {itemCount}
              </span>
            )}
          </button>
          <button
            onClick={onToggleTheme}
            className="rounded-full p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border dark:border-gray-700 transition-transform hover:scale-105"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-square overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800 relative shadow-xl"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              src={Array.isArray(product.imageUrl) ? product.imageUrl[currentImageIndex] : product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </AnimatePresence>
          {Array.isArray(product.imageUrl) && product.imageUrl.length > 1 && (
            <>
              <div className="absolute inset-y-0 left-0 flex items-center px-4">
                <button
                  onClick={handlePrevImage}
                  className="rounded-full bg-white/30 backdrop-blur-md p-2 text-white hover:bg-white/50 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center px-4">
                <button
                  onClick={handleNextImage}
                  className="rounded-full bg-white/30 backdrop-blur-md p-2 text-white hover:bg-white/50 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.imageUrl.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-primary-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="flex gap-2 mb-4">
            {product.categories.map(cat => (
              <span key={cat} className="rounded-full bg-primary-100 dark:bg-primary-950 px-3 py-1 text-xs font-bold text-primary-600 uppercase tracking-wider">
                {cat}
              </span>
            ))}
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => {
                const rating = product.isExternal ? (product.rating || 0) : 4;
                return (
                  <Star key={i} className={`h-5 w-5 fill-current ${i < Math.floor(rating) ? '' : 'text-gray-300'}`} />
                );
              })}
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              ({product.isExternal ? (product.ratingCount || 0) : reviews.length} {product.isExternal ? 'ratings' : 'reviews'})
            </span>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
          {!product.isExternal && (
            <div className="mb-8">
              <span className="text-3xl font-black text-primary-600">₦{product.price.toLocaleString()}</span>
              {product.stock && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  In Stock ({product.stock} units available)
                </p>
              )}
            </div>
          )}

          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-6">
              {!product.isExternal && (
                <div className="flex items-center gap-3 rounded-xl border-2 px-3 py-2 dark:border-gray-700">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              )}
              <Button
                onClick={handleAddToCart}
                className="flex-1 rounded-xl py-4 text-lg font-bold h-14"
              >
                <ShoppingCart className="mr-3 h-6 w-6" />
                {product.isExternal ? 'Place Order' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {!product.isExternal && (
        <div className="border-t dark:border-gray-800 pt-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Reviews</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="col-span-1 lg:col-span-1">
              <div className="sticky top-24 bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border dark:border-gray-800">
                <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter your name"
                    value={newReview.name}
                    onChange={e => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star className={`h-6 w-6 fill-current ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <TextArea
                    label="Your Review"
                    placeholder="Share your experience..."
                    value={newReview.text}
                    onChange={e => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full rounded-xl py-4 font-bold"
                    loading={submittingReview}
                    disabled={submittingReview}
                  >
                    Post Review
                  </Button>
                </form>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2 space-y-8">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                  <p>No reviews yet. Be the first to review this gadget!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={review.id}
                    className="border-b dark:border-gray-800 pb-8 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold dark:bg-primary-950">
                          {(review.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{review.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(review.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 fill-current ${i < review.rating ? '' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic whitespace-pre-wrap">
                      "{review.text}"
                    </p>
                  </motion.div>
                ))
              )}
            </div>
            </div>
          </div>
        </div>
      )}
      <ExternalOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetails;
