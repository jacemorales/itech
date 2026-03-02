import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from '../types';
import type { Product, Category } from '../types';
import { Button } from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import { toast } from 'sonner';
import { Plus, Edit, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Admin: React.FC = () => {
  const { products, addProduct, updateProduct, refreshProducts, loading } = useProducts();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categories: [] as Category[],
    imageUrls: [''],
    stock: 0
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'mmm') {
      setIsAuthenticated(true);
      toast.success('Logged in successfully!');
    } else {
      toast.error('Invalid password. Try again.');
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      const imageUrls = Array.isArray(product.imageUrl)
        ? product.imageUrl
        : product.imageUrl ? [product.imageUrl] : [''];

      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        categories: product.categories as Category[],
        imageUrls: imageUrls,
        stock: product.stock || 0
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        categories: [],
        imageUrls: [''],
        stock: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    const submissionData = {
      ...formData,
      imageUrl: formData.imageUrls.filter(url => url.trim() !== '')
    };

    let success = false;
    if (editingProduct) {
      success = await updateProduct(editingProduct.id, submissionData);
    } else {
      success = await addProduct(submissionData);
    }

    if (success) {
      toast.success(editingProduct ? 'Product updated!' : 'Product added!');
      setIsModalOpen(false);
      refreshProducts();
    } else {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const addImageUrlField = () => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, '']
    }));
  };

  const updateImageUrl = (index: number, value: string) => {
    setFormData(prev => {
      const newUrls = [...prev.imageUrls];
      newUrls[index] = value;
      return { ...prev, imageUrls: newUrls };
    });
  };

  const removeImageUrlField = (index: number) => {
    if (formData.imageUrls.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const toggleCategory = (cat: Category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl dark:bg-gray-900 border dark:border-gray-800"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 dark:bg-primary-950 mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Admin Portal</h2>
            <p className="text-gray-500 text-sm mt-2">Enter your password to manage gadgets</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full rounded-xl py-4 font-bold h-12">Login</Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your gadget inventory</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="rounded-xl px-8 py-4 font-bold h-12">
          <Plus className="mr-2 h-5 w-5" />
          Add New Gadget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white border dark:border-gray-800 rounded-3xl p-6 dark:bg-gray-900 flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-20 w-20 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <img
                  src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                <p className="text-primary-600 font-bold">₦{product.price.toLocaleString()}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.categories.map(cat => (
                    <span key={cat} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 uppercase font-bold">{cat}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-auto">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-10 text-sm font-bold"
                onClick={() => handleOpenModal(product)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl dark:bg-gray-900 max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Gadget' : 'Add New Gadget'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" style={{ overflowY: 'scroll', height: '376px', paddingRight: '15px' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Gadget Name"
                    placeholder="e.g., iPhone 15 Pro Max"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <Input
                    label="Price (₦)"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    required
                  />
                </div>

                <TextArea
                  label="Description"
                  placeholder="Describe the gadget's features..."
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories (Multiple Select)</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors border ${
                          formData.categories.includes(cat)
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URLs</label>
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={url}
                          onChange={e => updateImageUrl(index, e.target.value)}
                          required={index === 0}
                        />
                        {formData.imageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageUrlField(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      {url && (
                        <div className="mt-2 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-2 h-32 flex items-center justify-center overflow-hidden">
                          <img
                            src={url}
                            alt={`Preview ${index}`}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Invalid+Image+URL';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageUrlField}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Image
                  </Button>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl h-12 font-bold"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-[2] rounded-xl h-12 font-bold"
                    loading={loading}
                  >
                    {editingProduct ? 'Update Gadget' : 'Publish Gadget'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
