// Supabase configuration (for future use)
// The admin panel currently works with local/demo data
// To connect to Supabase, install: pnpm add @supabase/supabase-js

// Database types
export interface User {
  id: string;
  email: string;
  role: 'developer' | 'admin';
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  material?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}

export interface SiteContent {
  id: string;
  page: string;
  section: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface ContactRequest {
  id: number;
  name: string;
  phone: string;
  comment?: string;
  status: 'new' | 'processed';
  created_at: string;
}
