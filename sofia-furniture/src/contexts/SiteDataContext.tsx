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
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  addMaterial: (material: string) => void;
  updateContent: (page: string, section: string, key: string, value: string) => void;
  resetData: () => void;
  isLoading: boolean;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [siteData, setSiteData] = useState<SiteData>({
    products: [],
    materials: [],
    content: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Получаем данные из API (Postgres)
    api.getProducts().then((data) => {
      setSiteData(prev => ({ ...prev, products: data }));
      setIsLoading(false);
    }).catch(err => {
        console.error("Failed to load products:", err);
        setIsLoading(false);
    });
  }, []);

  // Методы обновления теперь также должны отправлять данные в API
  const addProduct = (product: Omit<Product, 'id'>) => {
    // В будущем - запрос к API для записи
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
    setSiteData(prev => ({
      ...prev,
      materials: [...prev.materials, material],
    }));
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
    // Перезагрузка страницы, чтобы сбросить стейт
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
        isLoading
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
