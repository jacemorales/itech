import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { CustomRequestFab } from './components/CustomRequestFab';
import { Toaster } from 'sonner';

// Pages
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';

const AppContent: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }, [theme]);

  const openCart = () => setIsCartOpen(true);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Routes>
        <Route path="/" element={
          <>
            <Navbar onOpenCart={openCart} theme={theme} onToggleTheme={toggleTheme} />
            <main className="flex-grow">
              <Home />
            </main>
            <Footer />
            <CustomRequestFab />
          </>
        } />
        <Route path="/product/:id" element={
          <>
            <Navbar onOpenCart={openCart} theme={theme} onToggleTheme={toggleTheme} />
            <main className="flex-grow">
              <ProductDetails />
            </main>
            <Footer />
            <CustomRequestFab />
          </>
        } />
        <Route path="/checkout" element={
          <>
            <Navbar onOpenCart={openCart} theme={theme} onToggleTheme={toggleTheme} />
            <main className="flex-grow">
              <Checkout />
            </main>
            <Footer />
          </>
        } />
        <Route path="/admin" element={
          <main className="flex-grow">
            <Admin theme={theme} onToggleTheme={toggleTheme} />
          </main>
        } />
      </Routes>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Toaster position="bottom-right" richColors theme={theme} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router basename="/lancer/web">
      <ProductProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ProductProvider>
    </Router>
  );
};

export default App;
