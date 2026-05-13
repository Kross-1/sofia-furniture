import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cblbgliuzbeobjiqsend.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNibGJnbGl1emJlb2JqaXFzZW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTI4NjIsImV4cCI6MjA5NDIyODg2Mn0.ojPtNYjsOcIEUl3_IYtTC6IkvkEQt1dlpsSPXNSgbRk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export async function fetchSiteContent(page?: string): Promise<SiteContent[]> {
  let query = supabase.from('site_content').select('*');
  if (page) {
    query = query.eq('page', page);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function saveSiteContent(page: string, section: string, key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('site_content')
    .upsert({ page, section, key, value }, { onConflict: 'page,section,key' });
  if (error) throw error;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('id');
  if (error) throw error;
  return data || [];
}

export async function saveProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: number, updates: Partial<Product>): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchContactRequests(): Promise<ContactRequest[]> {
  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveContactRequest(request: { name: string; phone: string; comment?: string }): Promise<void> {
  const { error } = await supabase.from('contact_requests').insert(request);
  if (error) throw error;
}

export async function updateContactRequestStatus(id: number, status: string): Promise<void> {
  const { error } = await supabase
    .from('contact_requests')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}