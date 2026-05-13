import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cblbgliuzbeobjiqsend.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNibGJnbGl1emJlb2JqaXFzZW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTI4NjIsImV4cCI6MjA5NDIyODg2Mn0.ojPtNYjsOcIEUl3_IYtTC6IkvkEQt1dlpsSPXNSgbRk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchProducts() {
  try {
    const { data, error } = await supabase.from('products').select('*').order('id');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('fetchProducts error:', e);
    return [];
  }
}

export async function saveProduct(product) {
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProductDB(id, updates) {
  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteProductDB(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchSiteContent(page) {
  try {
    let query = supabase.from('site_content').select('*');
    if (page) query = query.eq('page', page);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('fetchSiteContent error:', e);
    return [];
  }
}

export async function saveSiteContent(page, section, key, value) {
  const { error } = await supabase.from('site_content').upsert({ page, section, key, value }, { onConflict: 'page,section,key' });
  if (error) throw error;
}