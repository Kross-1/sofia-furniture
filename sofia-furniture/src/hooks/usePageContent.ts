import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';

// Типы
export interface PageTextItem {
  id: string;
  page: string;
  section: string;
  label: string;
  text: string;
  htmlKey: string;
  isGlobal?: boolean;
  locations?: string[];
  order?: number;
}

export interface IconItem {
  id: string;
  name: string;
  category: string;
  iconType: string;
  location: string;
  color: string;
  order: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  iconType: string;
  iconUrl?: string;
  link: string;
  order: number;
  iconFile?: string | null;
  slug?: string;
}

export interface ProductCategoryItem {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  linkedFromHomepage: boolean;
  homepageCategoryId?: string;
  order: number;
}

export function usePageContent() {
  const [texts, setTexts] = useState<PageTextItem[]>([]);
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [content, cats] = await Promise.all([
          api.getContent(),
          api.getCategories().catch(() => []),
        ]);
        if (cancelled) return;

        const list: PageTextItem[] = Array.isArray(content)
          ? content.map((d: any) => {
              const id = d.item_key || d.key;
              const page = d.page || (id ? id.split('-')[0] : '');
              const section = d.section || '';
              return {
                id,
                page,
                section,
                label: id,
                text: d.item_value ?? d.value ?? '',
                htmlKey: id,
              };
            })
          : [];
        setTexts(list);

        const cList: CategoryItem[] = Array.isArray(cats)
          ? cats.map((c: any, i: number) => ({
              id: c.id,
              name: c.name,
              iconType: c.iconFile || c.iconType || c.icon,
              link: `/catalog?category=${encodeURIComponent(c.slug || c.name)}`,
              order: typeof c.sortOrder === 'number' ? c.sortOrder : i + 1,
              iconFile: c.iconFile,
              slug: c.slug,
            }))
          : [];
        setCategories(cList);

        const pcList: ProductCategoryItem[] = cList.map((c, i) => ({
          id: c.id,
          name: c.name,
          slug: c.slug || c.name,
          enabled: true,
          linkedFromHomepage: true,
          homepageCategoryId: c.id,
          order: c.order ?? i + 1,
        }));
        setProductCategories(pcList);

        setError(null);
      } catch (e: any) {
        if (!cancelled) {
          console.error('usePageContent load error:', e?.message);
          setError(e?.message || 'load error');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const textMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of texts) m.set(t.id, t.text);
    return m;
  }, [texts]);

  const getText = useCallback((id: string): string => textMap.get(id) ?? '', [textMap]);

  const updateText = useCallback(async (id: string, newText: string) => {
    setTexts(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
    try {
      await api.saveContent({ item_key: id, item_value: newText });
    } catch (e) {
      console.error('saveContent failed', e);
    }
  }, []);

  const getIcon = useCallback((id: string) => icons.find(i => i.id === id), [icons]);

  const getCategories = useCallback(() => categories, [categories]);

  const getProductCategories = useCallback(() => productCategories, [productCategories]);

  const getEnabledProductCategories = useCallback(
    () => productCategories.filter(c => c.enabled),
    [productCategories]
  );

  const getTextsForPage = useCallback(
    (page: string) => texts.filter(t => t.page === page),
    [texts]
  );

  // Стабы для совместимости со старой админкой
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noop = useCallback((..._args: any[]) => {}, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stubArr = useCallback((..._args: any[]) => [] as any[], []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stubIcon = useCallback((..._args: any[]) => undefined as any, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stubCat = useCallback((..._args: any[]) => ({}) as any, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stubPC = useCallback((..._args: any[]) => ({}) as any, []);

  return {
    // Данные
    texts, getText, updateText, isLoading, error,
    icons, getIcon,
    categories, getCategories,
    productCategories, getProductCategories, getEnabledProductCategories,
    getTextsForPage,

    // Совместимость со старой админкой
    findDuplicateTexts: stubArr,
    resetToDefaults: noop,
    getAllPagesForEditor: stubArr,

    updateIcon: noop,
    addIcon: stubIcon,
    deleteIcon: noop,
    resetIconsToDefaults: noop,
    getIconsByCategory: stubArr,

    updateCategory: noop,
    addCategory: stubCat,
    deleteCategory: noop,
    resetCategoriesToDefaults: noop,

    addProductCategory: stubPC,
    updateProductCategory: noop,
    deleteProductCategory: noop,
    resetProductCategoriesToDefaults: noop,
    syncProductCategoryFromHomepage: stubPC,
    unlinkProductCategoryFromHomepage: noop,
  };
}
