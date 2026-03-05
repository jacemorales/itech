import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t dark:border-gray-800">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="iTech Gadgets" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-primary-600 tracking-tight">iTech <span className="text-gray-900 dark:text-white">Gadgets</span></span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xs">
              The premier destination for the latest and greatest tech gadgets. Quality guaranteed, satisfaction delivered.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary-600" />
                <span className="text-gray-600 dark:text-gray-400">Covenant University</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-600" />
                <span className="text-gray-600 dark:text-gray-400">07078850843</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-600" />
                <span className="text-gray-600 dark:text-gray-400">jacemorales54321@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t dark:border-gray-800 mt-12 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} iTech Gadgets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
