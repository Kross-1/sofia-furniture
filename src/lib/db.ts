const API = '/api/db';
const CACHE_TTL = 30000;

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function invalidateCache(table: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(table)) {
      cache.delete(key);
    }
  }
}

async function fetchAPI(endpoint: string, options?: RequestInit, cacheKey?: string) {
  if (!options && cacheKey) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  let res: Response;
  try {
    res = await fetch(`${API}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (e) {
    throw new Error('Network error: unable to connect to server');
  }
  if (!res.ok) {
    let err: { error?: string } = {};
    try {
      err = await res.json();
    } catch {
      err = { error: res.statusText };
    }
    throw new Error(err.error || `Server error (${res.status})`);
  }
  const data = await res.json();
  if (!Array.isArray(data) && data?.error) {
    throw new Error(data.error);
  }

  if (cacheKey && Array.isArray(data)) {
    setCached(cacheKey, data);
  }

  return data;
}

function getCategoryId(categoryName: string): string {
  const map: Record<string, string> = {
    'Спальные гарнитуры': '468a0859-8f3d-4bd4-80df-8084dbdde175',
    'ТВ тумбы': '3dd8bc4c-94c1-4d7f-8587-915515741787',
    'Консоли': 'e10123b4-e724-4cb8-940e-52cee03a4956',
    'Столы': 'fd30f952-4fe5-47c7-a2db-5afac550ddef',
    'Стулья': 'd7560113-5da3-4ad0-bc1d-92e7198c74d5',
    'Холлы': '5be7b0fb-3326-4ea2-be42-c37085b11cf7',
    'Диваны': '4b0beeca-988c-4207-a2bf-e25e18675491',
  };
  return map[categoryName] || map['Спальные гарнитуры'];
}

export async function getProducts(): Promise<any[]> {
  const products = await fetchAPI('?table=Product', undefined, 'Product');
  return products.map((p: any, i: number) => ({
    ...p,
    id: p.id || i + 1,
    category: p.category || '',
  }));
}

export async function addProduct(product: any): Promise<any> {
  const body = {
    table: 'Product',
    name: product.name,
    categoryId: product.categoryId || getCategoryId(product.category || ''),
    price: Number(product.price) || 0,
    image: product.image || '',
    images: product.images || [],
    videos: product.videos || [],
    material: product.material || null,
    description: product.description || null,
  };
  const result = await fetchAPI('', { method: 'POST', body: JSON.stringify(body) });
  invalidateCache('Product');
  return { ...result, id: result.id || Date.now(), category: product.category || '' };
}

export async function updateProductDB(id: number | string, updates: any): Promise<any> {
  const result = await fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'Product', id: String(id), ...updates }),
  });
  invalidateCache('Product');
  return result;
}

export async function deleteProductDB(id: number | string): Promise<void> {
  await fetchAPI(`?table=Product&id=${id}`, { method: 'DELETE' });
  invalidateCache('Product');
}

export async function getMediaItems(page?: string): Promise<any[]> {
  const key = page ? `MediaItem:${page}` : 'MediaItem';
  const params = page ? `?table=MediaItem&page=${page}` : '?table=MediaItem';
  return fetchAPI(params, undefined, key);
}

export async function saveMediaItem(page: string, section: string, type: string, url: string): Promise<any> {
  const result = await fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'MediaItem', page, section, type, url }),
  });
  invalidateCache('MediaItem');
  return result;
}

export async function deleteMediaItem(id: string): Promise<void> {
  await fetchAPI(`?table=MediaItem&id=${id}`, { method: 'DELETE' });
  invalidateCache('MediaItem');
}

export async function getMessages(): Promise<any[]> {
  return fetchAPI('?table=Message', undefined, 'Message');
}

export async function saveMessage(name: string, phone: string, comment?: string, product?: string): Promise<any> {
  const result = await fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'Message', name, phone, comment, product }),
  });
  invalidateCache('Message');
  return result;
}

export async function updateMessageStatus(id: string, status: string): Promise<any> {
  const result = await fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'Message_update', id, status }),
  });
  invalidateCache('Message');
  return result;
}

export async function deleteMessage(id: string): Promise<void> {
  await fetchAPI(`?table=Message&id=${id}`, { method: 'DELETE' });
  invalidateCache('Message');
}

export async function getSiteSettings(): Promise<any[]> {
  return fetchAPI('?table=SiteSetting', undefined, 'SiteSetting');
}

export async function saveSiteSetting(key: string, value: string): Promise<any> {
  const result = await fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'SiteSetting', key, value }),
  });
  invalidateCache('SiteSetting');
  return result;
}

export async function checkAuth(login: string, password: string): Promise<any> {
  return fetchAPI(`?table=User&login=${login}&password=${password}`);
}
