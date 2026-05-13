import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, products as defaultProducts } from '../data/products';
import { usePageContent } from '../hooks/usePageContent';
import { Category } from '../data/products';
import { fetchSiteContent, saveSiteContent, fetchProducts, saveProduct, updateProduct, deleteProduct as deleteProductDB } from '../lib/supabase';

const defaultMaterials = [
  'Дерево',
  'МДФ',
  'ДСП',
  'Металл',
  'Ткань',
  'Кожа',
  'Шерсть',
  'Вискоза',
  'Велюр',
  'Замша',
];

interface SiteData {
  products: Product[];
  materials: string[];
  content: Record<string, Record<string, string>>;
}

interface SiteDataContextType {
  products: Product[];
  materials: string[];
  content: Record<string, Record<string, string>>;
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  addMaterial: (material: string) => void;
  updateContent: (page: string, section: string, key: string, value: string) => Promise<void>;
  resetData: () => void;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

const STORAGE_KEY = 'sofia_furniture_data';

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const { getEnabledProductCategories } = usePageContent();

  const [siteData, setSiteData] = useState<SiteData>({
    products: defaultProducts,
    materials: defaultMaterials,
    content: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const categories: Category[] = getEnabledProductCategories().map((pc, index) => ({
    id: pc.slug,
    name: pc.name,
    icon: 'Grid3X3',
    sort_order: pc.order || index + 1,
  }));

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        const [contentData, productsData] = await Promise.all([
          fetchSiteContent().catch(() => []),
          fetchProducts().catch(() => [])
        ]);

        const content: Record<string, Record<string, string>> = {};
        for (const item of contentData) {
          if (!content[item.page]) content[item.page] = {};
          content[item.page][item.key] = item.value;
        }

        setSiteData({
          products: productsData.length > 0 ? productsData : defaultProducts,
          materials: defaultMaterials,
          content,
        });

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const localData = JSON.parse(stored);
            if (productsData.length === 0 && localData.products) {
              setSiteData(prev => ({ ...prev, products: localData.products }));
            }
            if (Object.keys(content).length === 0 && localData.content) {
              setSiteData(prev => ({ ...prev, content: localData.content }));
            }
          } catch {}
        }
      } catch (e) {
        console.error('Error loading from Supabase:', e);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setSiteData(JSON.parse(stored));
          } catch {}
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    }

    if (!isInitialized) {
      loadData();
    }
  }, [isInitialized]);

  useEffect(() => {
    if (!isLoading && isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
      } catch {}
    }
  }, [siteData, isLoading, isInitialized]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newId = Math.max(0, ...siteData.products.map(p => p.id)) + 1;
    const newProduct = { ...product, id: newId } as Product;
    
    setSiteData(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));

    try {
      await saveProduct(product);
    } catch (e) {
      console.error('Error saving to Supabase:', e);
    }
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    setSiteData(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));

    try {
      await updateProduct(id, updates);
    } catch (e) {
      console.error('Error updating in Supabase:', e);
    }
  };

  const deleteProduct = async (id: number) => {
    setSiteData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }));

    try {
      await deleteProductDB(id);
    } catch (e) {
      console.error('Error deleting from Supabase:', e);
    }
  };

  const addMaterial = (material: string) => {
    if (!siteData.materials.includes(material)) {
      setSiteData(prev => ({
        ...prev,
        materials: [...prev.materials, material],
      }));
    }
  };

  const updateContent = async (page: string, section: string, key: string, value: string) => {
    setSiteData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [page]: {
          ...(prev.content[page] || {}),
          [key]: value,
        },
      },
    }));

    try {
      await saveSiteContent(page, section, key, value);
    } catch (e) {
      console.error('Error saving to Supabase:', e);
    }
  };

  const resetData = () => {
    const defaultData = {
      products: defaultProducts,
      materials: defaultMaterials,
      content: {},
    };
    setSiteData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <SiteDataContext.Provider
      value={{
        products: siteData.products,
        materials: siteData.materials,
        content: siteData.content,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        addMaterial,
        updateContent,
        resetData,
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