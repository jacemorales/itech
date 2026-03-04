import type { Product, Review, CustomRequest } from '../types';

// The URL of the Google Apps Script web app
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbze4f-5J-pQGp4haOQzSR9oIGsIoB5N_Nikw5zMrKBEBpbY0jrw9LnU05Ux_UVuR0g/exec';

export const googleSheetsService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getProducts`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.map((p: any) => ({
        ...p,
        imageUrl: Array.isArray(p.imageUrl) ? p.imageUrl : (typeof p.imageUrl === 'string' && p.imageUrl.includes(',') ? p.imageUrl.split(',') : [p.imageUrl])
      }));
    } catch (error) {
      console.error('Error fetching products from Google Sheets:', error);
      return [];
    }
  },

  async getReviews(productId: string): Promise<Review[]> {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getReviews&productId=${productId}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.map((r: any) => ({
        ...r,
        name: r.userName || r.name || 'Anonymous',
        text: r.comment || r.text || ''
      }));
    } catch (error) {
      console.error('Error fetching reviews from Google Sheets:', error);
      return [];
    }
  },

  async addReview(review: Omit<Review, 'id' | 'date'>): Promise<boolean> {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addReview',
          productId: review.productId,
          userName: review.name,
          comment: review.text,
          rating: review.rating,
          date: new Date().toISOString().split('T')[0]
        })
      });
      return true;
    } catch (error) {
      console.error('Error adding review to Google Sheets:', error);
      return false;
    }
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<boolean> {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addProduct',
          ...product,
          imageUrl: Array.isArray(product.imageUrl) ? product.imageUrl.join(',') : product.imageUrl
        })
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
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateProduct',
          id,
          ...submissionData
        })
      });
      return true;
    } catch (error) {
      console.error('Error updating product in Google Sheets:', error);
      return false;
    }
  },

  async submitCustomRequest(request: Omit<CustomRequest, 'id' | 'date'>): Promise<boolean> {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addCustomRequest',
          ...request,
          date: new Date().toISOString()
        })
      });
      return true;
    } catch (error) {
      console.error('Error submitting custom request to Google Sheets:', error);
      return false;
    }
  },

  async addOrder(order: any): Promise<boolean> {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addOrder',
          ...order,
          date: new Date().toISOString()
        })
      });
      return true;
    } catch (error) {
      console.error('Error adding order to Google Sheets:', error);
      return false;
    }
  },

  async addExternalOrder(order: any): Promise<boolean> {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addExternalOrder',
          ...order,
          date: new Date().toISOString()
        })
      });
      return true;
    } catch (error) {
      console.error('Error adding external order to Google Sheets:', error);
      return false;
    }
  },

  async getAllReviews(): Promise<Review[]> {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAllReviews`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.map((r: any) => ({
        ...r,
        name: r.userName || r.name || 'Anonymous',
        text: r.comment || r.text || ''
      }));
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      return [];
    }
  },

  async getAllOrders(): Promise<any[]> {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getOrders`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  },

  async getAllExternalOrders(): Promise<any[]> {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getExternalOrders`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('Error fetching all external orders:', error);
      return [];
    }
  },

  async getAllCustomRequests(): Promise<any[]> {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getCustomRequests`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('Error fetching all custom requests:', error);
      return [];
    }
  }
};
