import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from '../types';
import type { Product, Category } from '../types';
import { Button } from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import { toast } from 'sonner';
import { Edit, X, Lock, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { googleSheetsService } from '../services/googleSheets';
import { AdminNavbar } from '../components/layout/AdminNavbar';
import { Star } from 'lucide-react';

type AdminView = 'inventory' | 'orders' | 'external-orders' | 'custom-requests' | 'reviews';

interface AdminProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Admin: React.FC<AdminProps> = ({ theme, onToggleTheme }) => {
  const { products, addProduct, updateProduct, refreshProducts } = useProducts();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>('inventory');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingViewData, setLoadingViewData] = useState(false);
  const [viewData, setViewData] = useState<any[]>([]);
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
    if (submitting) return;
    if (formData.categories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setSubmitting(true);
    toast.info(editingProduct ? 'Updating gadget...' : 'Publishing gadget...');

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
    setSubmitting(false);
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

  const loadViewData = async (view: AdminView) => {
    setLoadingViewData(true);
    let data: any[] = [];
    try {
      if (view === 'orders') data = await googleSheetsService.getAllOrders();
      if (view === 'external-orders') data = await googleSheetsService.getAllExternalOrders();
      if (view === 'custom-requests') data = await googleSheetsService.getAllCustomRequests();
      if (view === 'reviews') data = await googleSheetsService.getAllReviews();
      setViewData(data);
    } catch (err) {
      toast.error('Failed to load data');
    }
    setLoadingViewData(false);
  };

  React.useEffect(() => {
    if (isAuthenticated && activeView !== 'inventory') {
      loadViewData(activeView);
    }
  }, [isAuthenticated, activeView]);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950 z-[100]">
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
              autoFocus
            />
            <Button type="submit" className="w-full rounded-xl py-4 font-bold h-12">Login</Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <AdminNavbar
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        onAddClick={() => handleOpenModal()}
        onRefresh={() => loadViewData(activeView)}
        refreshing={loadingViewData}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white capitalize">
              {activeView.replace('-', ' ')}
            </h1>
          </div>
        </div>

        {activeView === 'inventory' && (
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
        )}

        {activeView !== 'inventory' && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
            {loadingViewData ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="h-8 w-8 text-primary-600 animate-spin border-4 border-current border-t-transparent rounded-full" />
                <p className="text-gray-500 font-bold">Fetching records...</p>
              </div>
            ) : viewData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold">No records found</h3>
                <p className="text-gray-500 text-sm">There are no {activeView.replace('-', ' ')} entries yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-950 border-b dark:border-gray-800">
                    <tr>
                      {activeView === 'orders' && (
                        <>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Customer</th>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Items</th>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Total</th>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Platform</th>
                        </>
                      )}
                      {activeView === 'external-orders' && (
                        <>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Gadget</th>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Email</th>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Qty</th>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Total Price</th>
                        </>
                      )}
                      {activeView === 'custom-requests' && (
                        <>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Gadget</th>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Requestor</th>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Date</th>
                        </>
                      )}
                      {activeView === 'reviews' && (
                        <>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Product</th>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Review</th>
                          <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Rating</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-800">
                    {viewData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        {activeView === 'orders' && (
                          <>
                            <td className="px-6 py-4">
                              <div className="font-bold">{row.fullName}</div>
                              <div className="text-xs text-gray-500">{row.email}</div>
                              <div className="text-[10px] text-primary-600 font-bold uppercase mt-1">{row.deliveryLocation}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={row.items}>
                              {row.items}
                            </td>
                            <td className="px-6 py-4 font-black">₦{Number(row.total).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${row.platform === 'WhatsApp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {row.platform}
                              </span>
                              <div className="text-xs mt-1">{row.platformValue}</div>
                            </td>
                          </>
                        )}
                        {activeView === 'external-orders' && (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                  <img src={row.imageUrl} className="h-full w-full object-cover" alt="" />
                                </div>
                                <div>
                                  <div className="font-bold text-sm">{row.gadgetName}</div>
                                  <div className="text-[10px] text-gray-400 uppercase font-bold">{row.source}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">{row.email}</td>
                            <td className="px-6 py-4 font-bold">{row.quantity}</td>
                            <td className="px-6 py-4 font-black text-primary-600">${Number(row.totalPrice).toLocaleString()}</td>
                          </>
                        )}
                        {activeView === 'custom-requests' && (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                  <img src={row.imageUrl} className="h-full w-full object-cover" alt="" />
                                </div>
                                <div>
                                  <div className="font-bold text-sm">{row.gadgetName}</div>
                                  <div className="text-xs text-gray-500 line-clamp-1">{row.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-primary-600">{row.email}</td>
                            <td className="px-6 py-4 text-xs text-gray-500 font-bold">{new Date(row.date).toLocaleDateString()}</td>
                          </>
                        )}
                        {activeView === 'reviews' && (
                          <>
                            <td className="px-6 py-4">
                               {(() => {
                                 const product = products.find(p => String(p.id) === String(row.productId));
                                 return product ? (
                                   <div className="flex items-center gap-2 max-w-[150px]">
                                     <div className="h-8 w-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                       <img src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl} className="h-full w-full object-cover" alt="" />
                                     </div>
                                     <div className="text-[10px] font-bold truncate">{product.name}</div>
                                   </div>
                                 ) : (
                                   <span className="text-[10px] text-gray-400">ID: {row.productId}</span>
                                 );
                               })()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-xs">{row.name}</div>
                              <div className="text-xs text-gray-500 italic mt-1 line-clamp-2">"{row.text}"</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, j) => (
                                  <Star key={j} className={`h-3 w-3 fill-current ${j < row.rating ? '' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
                    loading={submitting}
                    disabled={submitting}
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
