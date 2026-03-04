import React, { useState } from 'react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { ExternalOrderModal } from '../ExternalOrderModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isExternal) {
      setIsOrderModalOpen(true);
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <>
    <Link
      to={`/product/${product.id}`}
      state={{ externalProduct: product.isExternal ? product : null }}
      className="group relative block overflow-hidden rounded-2xl bg-white p-4 shadow-md transition-all hover:shadow-xl dark:bg-gray-800"
    >
      <div className="aspect-square relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
        <img
          src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {product.categories.map(cat => (
            <span key={cat} className="rounded-full bg-primary-600/90 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              {cat}
            </span>
          ))}
          {product.isExternal && (
            <span className="rounded-full bg-blue-600/90 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              External
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 dark:text-gray-100">{product.name}</h3>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
          {product.description}
        </p>
        <div className="flex flex-col gap-3 mt-auto pt-2">
          {!product.isExternal && (
            <span className="text-xl font-black text-primary-600">₦{product.price.toLocaleString()}</span>
          )}
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="rounded-full w-full"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.isExternal ? 'Place Order' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Link>
    <ExternalOrderModal
      isOpen={isOrderModalOpen}
      onClose={() => setIsOrderModalOpen(false)}
      product={product}
    />
    </>
  );
};
