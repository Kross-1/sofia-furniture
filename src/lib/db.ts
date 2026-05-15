const API = '/api/db';

async function fetchAPI(endpoint: string, options?: RequestInit) {
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
  const products = await fetchAPI('?table=Product');
  // map UUIDs back to numeric IDs for compatibility
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
  return { ...result, id: result.id || Date.now(), category: product.category || '' };
}

export async function updateProductDB(id: number | string, updates: any): Promise<any> {
  return fetchAPI('', {
    method: 'POST',
    body: JSON.stringify({ table: 'Product', id: String(id), ...updates }),
  });
}

export async function deleteProductDB(id: number | string): Promise<void> {
  await fetchAPI(`?table=Product&id=${id}`, { method: 'DELETE' });
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
  await fetchAPI(`?table=MediaItem&id=${id}`, { method: 'DELETE' });
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
    body: JSON.stringify({ table: 'Message_update', id, status }),
  });
}

export async function deleteMessage(id: string): Promise<void> {
  await fetchAPI(`?table=Message&id=${id}`, { method: 'DELETE' });
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
