const API = '/api/db';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API error');
  }
  return res.json();
}

export async function getProducts(): Promise<any[]> {
  return fetchAPI('?table=Product');
}

export async function addProduct(product: any): Promise<any> {
  return fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'Product', ...product }),
  });
}

export async function updateProduct(id: string, updates: any): Promise<any> {
  return fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'Product', id, ...updates }),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return fetchAPI(`?table=Product&id=${id}`, { method: 'DELETE' });
}

export async function getMediaItems(page?: string): Promise<any[]> {
  const params = page ? `?table=MediaItem&page=${page}` : '?table=MediaItem';
  return fetchAPI(params);
}

export async function saveMediaItem(page: string, section: string, type: string, url: string): Promise<any> {
  return fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'MediaItem', page, section, type, url }),
  });
}

export async function deleteMediaItem(id: string): Promise<void> {
  return fetchAPI(`?table=MediaItem&id=${id}`, { method: 'DELETE' });
}

export async function getMessages(): Promise<any[]> {
  return fetchAPI('?table=Message');
}

export async function saveMessage(name: string, phone: string, comment?: string, product?: string): Promise<any> {
  return fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'Message', name, phone, comment, product }),
  });
}

export async function updateMessageStatus(id: string, status: string): Promise<any> {
  return fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'Message', id, status }),
  });
}

export async function deleteMessage(id: string): Promise<void> {
  return fetchAPI(`?table=Message&id=${id}`, { method: 'DELETE' });
}

export async function getSiteSettings(): Promise<any[]> {
  return fetchAPI('?table=SiteSetting');
}

export async function saveSiteSetting(key: string, value: string): Promise<any> {
  return fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'SiteSetting', key, value }),
  });
}

export async function checkAuth(login: string, password: string): Promise<any> {
  return fetchAPI(`?table=User&login=${login}&password=${password}`);
}
