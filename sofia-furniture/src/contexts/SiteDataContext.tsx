import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../data/products';
import { api } from '../lib/api';

interface SiteData {
  products: Product[];
  materials: string[];
  content: Record<string, Record<string, string>>;
}

interface SiteDataContextType {
  products: Product[];
  materials: string[];
  content: Record<string, Record<string, string>>;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addMaterial: (material: string) => void;
  updateContent: (page: string, section: string, key: string, value: string) => void;
  resetData: () => void;
  isLoading: boolean;
  error: string | null;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [siteData, setSiteData] = useState<SiteData>({
    products: [],
    materials: [],
    content: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getProducts();
        if (!cancelled) {
          const list: Product[] = Array.isArray(data) ? data : [];
          const matSet = new Set<string>();
          for (const p of list) {
            if (p.material) {
              String(p.material).split(',').forEach(m => matSet.add(m.trim()));
            }
          }
          setSiteData(prev => ({ ...prev, products: list, materials: Array.from(matSet).sort() }));
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error('Failed to load products:', e?.message);
          setError(e?.message || 'Failed to load products');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const addProduct = (_product: Omit<Product, 'id'>) => {
    console.warn('addProduct: API write not implemented');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setSiteData(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  };

  const deleteProduct = (id: string) => {
    setSiteData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }));
  };

  const addMaterial = (material: string) => {
    setSiteData(prev => ({
      ...prev,
      materials: prev.materials.includes(material) ? prev.materials : [...prev.materials, material].sort(),
    }));
  };

  const updateContent = (page: string, section: string, key: string, value: string) => {
    setSiteData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [page]: {
          ...(prev.content[page] || {}),
          [`${section}:${key}`]: value,
        },
      },
    }));
  };

  const resetData = () => {
    window.location.reload();
  };

  return (
    <SiteDataContext.Provider
      value={{
        ...siteData,
        addProduct,
        updateProduct,
        deleteProduct,
        addMaterial,
        updateContent,
        resetData,
        isLoading,
        error,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (context === undefined) {
    throw new Error('useSiteData must be used within a SiteDataProvider');
  }
  return context;
}
