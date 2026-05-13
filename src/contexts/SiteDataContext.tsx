import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../data/products';
import { usePageContent } from '../hooks/usePageContent';
import { getProducts, addProduct, updateProductDB, deleteProductDB } from '../lib/db';

const defaultMaterials = [
  'Дерево', 'МДФ', 'ДСП', 'Металл', 'Ткань', 'Кожа', 'Шерсть', 'Вискоза', 'Велюр', 'Замша',
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
    products: [],
    materials: defaultMaterials,
    content: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        console.log('Loading from Vercel Postgres...');
        
        const productsData = await getProducts();
        console.log('Products from DB:', productsData);

        const stored = localStorage.getItem(STORAGE_KEY);
        let savedProducts = [];
        
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            savedProducts = parsed.products || [];
          } catch {}
        }

        const finalProducts = productsData.length > 0 ? productsData : savedProducts;

        setSiteData({
          products: finalProducts as Product[],
          materials: defaultMaterials,
          content: {},
        });

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            products: finalProducts,
            materials: defaultMaterials,
            content: {}
          }));
        } catch {}
      } catch (e) {
        console.error('Error loading data:', e);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try { setSiteData(JSON.parse(stored)); } catch {}
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    }

    if (!isInitialized) loadData();
  }, [isInitialized]);

  useEffect(() => {
    if (!isLoading && isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
      } catch {}
    }
  }, [siteData, isLoading, isInitialized]);

  const addProductHandler = async (product: Omit<Product, 'id'>) => {
    console.log('Adding product:', product);
    try {
      const newProduct = await addProduct(product);
      console.log('Product added:', newProduct);
      setSiteData(prev => ({
        ...prev,
        products: [...prev.products, newProduct as Product]
      }));
    } catch (e) {
      console.error('Error adding product:', e);
      const newId = Math.max(0, ...siteData.products.map(p => p.id)) + 1;
      const newProduct = { ...product, id: newId } as Product;
      setSiteData(prev => ({
        ...prev,
        products: [...prev.products, newProduct]
      }));
    }
  };

  const updateProductHandler = async (id: number, updates: Partial<Product>) => {
    try {
      await updateProductDB(id, updates);
      setSiteData(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
      }));
    } catch (e) {
      console.error('Error updating product:', e);
      setSiteData(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
      }));
    }
  };

  const deleteProductHandler = async (id: number) => {
    try {
      await deleteProductDB(id);
      setSiteData(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id)
      }));
    } catch (e) {
      console.error('Error deleting product:', e);
      setSiteData(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id)
      }));
    }
  };

  const addMaterial = (material: string) => {
    if (!siteData.materials.includes(material)) {
      setSiteData(prev => ({ ...prev, materials: [...prev.materials, material] }));
    }
  };

  const updateContent = async (page: string, section: string, key: string, value: string) => {
    setSiteData(prev => ({
      ...prev,
      content: { ...prev.content, [page]: { ...(prev.content[page] || {}), [key]: value } }
    }));
  };

  const resetData = () => {
    setSiteData({ products: [], materials: defaultMaterials, content: {} });
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <SiteDataContext.Provider value={{
      products: siteData.products,
      materials: siteData.materials,
      content: siteData.content,
      isLoading,
      addProduct: addProductHandler,
      updateProduct: updateProductHandler,
      deleteProduct: deleteProductHandler,
      addMaterial,
      updateContent,
      resetData
    }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) throw new Error('useSiteData must be used within SiteDataProvider');
  return context;
}