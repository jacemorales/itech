import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { googleSheetsService } from '../services/googleSheets';
import { toast } from 'sonner';

export const CustomRequestFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    gadgetName: '',
    description: '',
    imageUrl: '',
    email: ''
  });

  useEffect(() => {
    // Show animated text tooltip for 5 seconds on page load
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 1000);

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await googleSheetsService.submitCustomRequest(formData);
    if (success) {
      toast.success('Your request has been submitted! We will reach out to you soon.');
      setIsOpen(false);
      setFormData({ gadgetName: '', description: '', imageUrl: '', email: '' });
    } else {
      toast.error('Failed to submit request. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="bg-primary-600 text-white px-4 py-2 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 mb-2"
            >
              Request for custom gadgets
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-primary-600 border-r-[10px] border-r-transparent absolute -bottom-2 right-4" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 text-white p-4 rounded-full shadow-2xl hover:bg-primary-700 transition-colors flex items-center justify-center"
        >
          <MessageSquarePlus className="h-8 w-8" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl dark:bg-gray-900 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Send className="h-6 w-6 text-primary-600" />
                  Request Custom Gadget
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Gadget Name"
                  placeholder="What gadget are you looking for?"
                  value={formData.gadgetName}
                  onChange={(e) => setFormData(prev => ({ ...prev, gadgetName: e.target.value }))}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <TextArea
                  label="Description"
                  placeholder="Give us some details about the gadget..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
                <div className="space-y-4">
                  <Input
                    label="Online Image URL (Optional)"
                    placeholder="https://example.com/gadget.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  />
                  {formData.imageUrl && (
                    <div className="mt-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-2 h-40 flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-2xl py-6 text-lg font-bold h-14 shadow-lg"
                  loading={submitting}
                >
                  Submit Request
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
