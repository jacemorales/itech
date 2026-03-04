import type { Product } from '../types';

const SERPER_API_KEY = '31f4fb942fb9c3eb7b67e17d729ed039f6cb3bf4';

export const serperService = {
  async searchShopping(query: string): Promise<Product[]> {
    try {
      const response = await fetch('https://google.serper.dev/shopping', {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: query })
      });

      const data = await response.json();

      if (!data.shopping) return [];

      return data.shopping.map((item: any) => {
        // Extract numeric price from strings like "$6.99"
        const numericPrice = typeof item.price === 'string'
          ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
          : (typeof item.price === 'number' ? item.price : 0);

        return {
          id: item.productId || `external-${Math.random().toString(36).substr(2, 9)}`,
          name: item.title,
          description: `Source: ${item.source}`,
          price: numericPrice,
          categories: [],
          imageUrl: item.imageUrl,
          isExternal: true,
          rating: item.rating,
          ratingCount: item.ratingCount,
          source: item.source,
          link: item.link
        };
      });
    } catch (error) {
      console.error('Error fetching shopping results from Serper:', error);
      return [];
    }
  }
};
