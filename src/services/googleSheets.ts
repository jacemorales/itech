import axios from 'axios';
import type { Product, Review, CustomRequest } from '../types';

// The URL of the Google Apps Script web app
const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbze4f-5J-pQGp4haOQzSR9oIGsIoB5N_Nikw5zMrKBEBpbY0jrw9LnU05Ux_UVuR0g/exec';

export const googleSheetsService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(`${GOOGLE_SCRIPT_URL}?action=getProducts`);
      const data = response.data;
      return data.map((p: any) => ({
        ...p,
        imageUrl: p.imageUrl && p.imageUrl.includes(',') ? p.imageUrl.split(',') : p.imageUrl
      }));
    } catch (error) {
      console.error('Error fetching products from Google Sheets:', error);
      return [];
    }
  },

  async getReviews(productId: string): Promise<Review[]> {
    try {
      const response = await axios.get(`${GOOGLE_SCRIPT_URL}?action=getReviews&productId=${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews from Google Sheets:', error);
      return [];
    }
  },

  async addReview(review: Omit<Review, 'id' | 'date'>): Promise<boolean> {
    try {
      await axios.post(GOOGLE_SCRIPT_URL, {
        action: 'addReview',
        ...review,
        date: new Date().toISOString().split('T')[0]
      });
      return true;
    } catch (error) {
      console.error('Error adding review to Google Sheets:', error);
      return false;
    }
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<boolean> {
    try {
      await axios.post(GOOGLE_SCRIPT_URL, {
        action: 'addProduct',
        ...product,
        imageUrl: Array.isArray(product.imageUrl) ? product.imageUrl.join(',') : product.imageUrl
      });
      return true;
    } catch (error) {
      console.error('Error adding product to Google Sheets:', error);
      return false;
    }
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<boolean> {
    try {
      const submissionData = {
        ...product,
        imageUrl: Array.isArray(product.imageUrl) ? product.imageUrl.join(',') : product.imageUrl
      };
      await axios.post(GOOGLE_SCRIPT_URL, {
        action: 'updateProduct',
        id,
        ...submissionData
      });
      return true;
    } catch (error) {
      console.error('Error updating product in Google Sheets:', error);
      return false;
    }
  },

  async submitCustomRequest(request: Omit<CustomRequest, 'id' | 'date'>): Promise<boolean> {
    try {
      await axios.post(GOOGLE_SCRIPT_URL, {
        action: 'addCustomRequest',
        ...request,
        date: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error submitting custom request to Google Sheets:', error);
      return false;
    }
  },

  async addOrder(order: any): Promise<boolean> {
    try {
      await axios.post(GOOGLE_SCRIPT_URL, {
        action: 'addOrder',
        ...order,
        date: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error adding order to Google Sheets:', error);
      return false;
    }
  }
};
