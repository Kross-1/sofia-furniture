import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, products as defaultProducts } from '../data/products';
import { usePageContent } from '../hooks/usePageContent';
import { Category } from '../data/products';

// Default materials
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
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  addMaterial: (material: string) => void;
  updateContent: (page: string, section: string, key: string, value: string) => void;
  resetData: () => void;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

const STORAGE_KEY = 'sofia_furniture_data';

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const { getEnabledProductCategories } = usePageContent();

  const [siteData, setSiteData] = useState<SiteData>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parsing fails, use default data
      }
    }

    // Return default data structure
    return {
      products: defaultProducts,
      materials: defaultMaterials,
      content: {},
    };
  });

  // Get dynamic categories from usePageContent
  const categories: Category[] = getEnabledProductCategories().map((pc, index) => ({
    id: pc.slug,
    name: pc.name,
    icon: 'Grid3X3',
    sort_order: pc.order || index + 1,
  }));

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      const dataStr = JSON.stringify(siteData);
      if (dataStr.length > 4 * 1024 * 1024) {
        console.warn('Site data too large, skipping localStorage save');
        return;
      }
      localStorage.setItem(STORAGE_KEY, dataStr);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded - data not saved');
      }
    }
  }, [siteData]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newId = Math.max(0, ...siteData.products.map(p => p.id)) + 1;
    const newProduct = { ...product, id: newId } as Product;
    setSiteData(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
  };

  const updateProduct = (id: number, updates: Partial<Product>) => {
    setSiteData(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  };

  const deleteProduct = (id: number) => {
    setSiteData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }));
  };

  const addMaterial = (material: string) => {
    if (!siteData.materials.includes(material)) {
      setSiteData(prev => ({
        ...prev,
        materials: [...prev.materials, material],
      }));
    }
  };

  const updateContent = (page: string, section: string, key: string, value: string) => {
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
