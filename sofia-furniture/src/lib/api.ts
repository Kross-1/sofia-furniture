// src/lib/api.ts

const API_BASE = '/api';

export const api = {
  getContent: async () => {
    const response = await fetch(`${API_BASE}/content`);
    if (!response.ok) throw new Error('Failed to fetch content');
    return await response.json();
  },

  saveContent: async (data) => {
    const response = await fetch(`${API_BASE}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save content');
    return await response.json();
  },

  getProducts: async () => {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  },
};
