import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from '../types';
import type { Product, Category } from '../types';
import { Button } from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import { toast } from 'sonner';
import { Edit, X, Lock, Package, RefreshCw } from 'lucide-react';
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
      <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950 overflow-y-auto py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl dark:bg-gray-900 border dark:border-gray-800 my-auto"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 dark:bg-primary-950 mb-4 shadow-inner">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Admin Portal</h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">Secure access to iTech Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Admin Password"
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              className="rounded-2xl"
            />
            <Button type="submit" className="w-full rounded-2xl py-4 font-bold h-14 text-lg shadow-lg shadow-primary-500/20">
              Access Dashboard
            </Button>
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
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white capitalize tracking-tight">
              {activeView.replace('-', ' ')}
            </h1>
          </div>
        </div>

        {activeView === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
            <div key={product.id} className="bg-white border dark:border-gray-800 rounded-3xl p-6 dark:bg-gray-900 flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-20 w-20 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 border dark:border-gray-700">
                  <img
                    src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                  <p className="text-primary-600 font-black">₦{product.price.toLocaleString()}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.categories.map(cat => (
                      <span key={cat} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 uppercase font-bold tracking-wider">{cat}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-auto pt-4 border-t dark:border-gray-800">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11 text-sm font-bold"
                  onClick={() => handleOpenModal(product)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
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
                <RefreshCw className="h-10 w-10 text-primary-600 animate-spin" />
                <p className="text-gray-500 font-bold animate-pulse">Synchronizing with Google Sheets...</p>
              </div>
            ) : viewData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <Package className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold">No Records Found</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">There are no {activeView.replace('-', ' ')} entries in your spreadsheet yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-gray-50 dark:bg-gray-950 border-b dark:border-gray-800">
                    <tr>
                      {activeView === 'orders' && (
                        <>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Customer</th>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Items</th>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Total Amount</th>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Platform</th>
                        </>
                      )}
                      {activeView === 'external-orders' && (
                        <>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Gadget</th>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Customer Email</th>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Qty</th>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Total (USD)</th>
                        </>
                      )}
                      {activeView === 'custom-requests' && (
                        <>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Requested Gadget</th>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Requestor</th>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Date Received</th>
                        </>
                      )}
                      {activeView === 'reviews' && (
                        <>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Tagged Product</th>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">User Review</th>
                          <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Rating</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-800">
                    {viewData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        {activeView === 'orders' && (
                          <>
                            <td className="px-6 py-5">
                              <div className="font-bold text-gray-900 dark:text-white">{row.fullName}</div>
                              <div className="text-xs text-gray-500 font-medium">{row.email}</div>
                              <div className="text-[10px] text-primary-600 font-black uppercase mt-1 inline-block bg-primary-50 dark:bg-primary-950/30 px-2 py-0.5 rounded-full">{row.deliveryLocation}</div>
                            </td>
                            <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                              <div className="line-clamp-2" title={row.items}>{row.items}</div>
                            </td>
                            <td className="px-6 py-5 font-black text-gray-900 dark:text-white">₦{Number(row.total).toLocaleString()}</td>
                            <td className="px-6 py-5">
                              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${row.platform === 'WhatsApp' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'}`}>
                                {row.platform}
                              </span>
                              <div className="text-xs mt-1 font-bold text-gray-700 dark:text-gray-300">{row.platformValue}</div>
                            </td>
                          </>
                        )}
                        {activeView === 'external-orders' && (
                          <>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 border dark:border-gray-700">
                                  <img src={row.imageUrl} className="h-full w-full object-cover" alt="" />
                                </div>
                                <div>
                                  <div className="font-bold text-sm text-gray-900 dark:text-white">{row.gadgetName}</div>
                                  <div className="text-[10px] text-gray-400 uppercase font-black">{row.source}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-gray-700 dark:text-gray-300">{row.email}</td>
                            <td className="px-6 py-5 font-black">{row.quantity}</td>
                            <td className="px-6 py-5 font-black text-primary-600">${Number(row.totalPrice).toLocaleString()}</td>
                          </>
                        )}
                        {activeView === 'custom-requests' && (
                          <>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 border dark:border-gray-700">
                                  <img src={row.imageUrl} className="h-full w-full object-cover" alt="" />
                                </div>
                                <div>
                                  <div className="font-bold text-sm text-gray-900 dark:text-white">{row.gadgetName}</div>
                                  <div className="text-xs text-gray-500 line-clamp-1 font-medium">{row.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-primary-600">{row.email}</td>
                            <td className="px-6 py-5 text-xs text-gray-500 font-bold uppercase tracking-wider">{new Date(row.date).toLocaleDateString()}</td>
                          </>
                        )}
                        {activeView === 'reviews' && (
                          <>
                            <td className="px-6 py-5">
                               {(() => {
                                 const product = products.find(p => String(p.id) === String(row.productId));
                                 return product ? (
                                   <div className="flex items-center gap-2 max-w-[150px]">
                                     <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border dark:border-gray-700">
                                       <img src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl} className="h-full w-full object-cover" alt="" />
                                     </div>
                                     <div className="text-[10px] font-black truncate text-gray-700 dark:text-gray-300">{product.name}</div>
                                   </div>
                                 ) : (
                                   <span className="text-[10px] text-gray-400 font-bold">PID: {row.productId}</span>
                                 );
                               })()}
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-bold text-xs text-gray-900 dark:text-white">{row.name}</div>
                              <div className="text-xs text-gray-500 italic mt-1 line-clamp-2 font-medium">"{row.text}"</div>
                            </td>
                            <td className="px-6 py-5">
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
              className="relative w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl dark:bg-gray-900 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight">{editingProduct ? 'Edit Gadget' : 'Publish New Gadget'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
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
                  placeholder="Describe the gadget's features and specifications..."
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`rounded-xl px-4 py-2 text-xs font-black transition-all border-2 ${
                          formData.categories.includes(cat)
                            ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20'
                            : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Image Assets (URLs)</label>
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://example.com/gadget-image.jpg"
                          value={url}
                          onChange={e => updateImageUrl(index, e.target.value)}
                          required={index === 0}
                        />
                        {formData.imageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageUrlField(index)}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl dark:hover:bg-red-900/20 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      {url && (
                        <div className="mt-2 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-2 h-40 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950">
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
                    className="mt-2 rounded-xl border-dashed border-2 hover:border-primary-500 font-bold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Image
                  </Button>
                </div>
              </form>

              <div className="flex gap-4 pt-8 border-t dark:border-gray-800 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-2xl h-14 font-black text-lg"
                  onClick={() => setIsModalOpen(false)}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] rounded-2xl h-14 font-black text-lg shadow-xl shadow-primary-500/20"
                  onClick={(e) => {
                     // Trigger form submit manually since button is outside form if using flex layout for height
                     const form = document.querySelector('form');
                     if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }}
                  loading={submitting}
                  disabled={submitting}
                >
                  {editingProduct ? 'Save Changes' : 'Publish Gadget'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
