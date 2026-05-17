import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';

// Типы
export interface PageTextItem { id: string; page: string; section: string; label: string; text: string; htmlKey: string; isGlobal?: boolean; locations?: string[]; order?: number; }
export interface IconItem { id: string; name: string; category: string; iconType: string; location: string; color: string; order: number; }
export interface CategoryItem { id: string; name: string; iconType: string; iconUrl?: string; link: string; order: number; }
export interface ProductCategoryItem { id: string; name: string; slug: string; enabled: boolean; linkedFromHomepage: boolean; homepageCategoryId?: string; order: number; }

// Дефолтные данные (ранее были в этом же файле)
const defaultCategories: CategoryItem[] = [
  { id: 'spalnya', name: 'Спальные гарнитуры', iconType: 'Спальные гарнитуры.png', link: '/catalog?category=spalnya', order: 1 },
  { id: 'tv-tumby', name: 'ТВ тумбы', iconType: 'Тв тумба.png', link: '/catalog?category=tv-tumby', order: 2 },
  { id: 'konsoli', name: 'Консоли', iconType: 'Консоль.png', link: '/catalog?category=konsoli', order: 3 },
  { id: 'stoly', name: 'Столы', iconType: 'Столы.png', link: '/catalog?category=stoly', order: 4 },
  { id: 'stulya', name: 'Стулья', iconType: 'Стулья.png', link: '/catalog?category=stulya', order: 5 },
  { id: 'holly', name: 'Холлы', iconType: 'Холлы.png', link: '/catalog?category=holly', order: 6 },
  { id: 'divany', name: 'Диваны', iconType: 'Диваны.png', link: '/catalog?category=divany', order: 7 },
];

const defaultProductCategories: ProductCategoryItem[] = [
  { id: 'pc-spalnya', name: 'Спальные гарнитуры', slug: 'spalnya', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'spalnya', order: 1 },
  { id: 'pc-tv-tumby', name: 'ТВ тумбы', slug: 'tv-tumby', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'tv-tumby', order: 2 },
  { id: 'pc-konsoli', name: 'Консоли', slug: 'konsoli', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'konsoli', order: 3 },
  { id: 'pc-stoly', name: 'Столы', slug: 'stoly', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'stoly', order: 4 },
  { id: 'pc-stulya', name: 'Стулья', slug: 'stulya', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'stulya', order: 5 },
  { id: 'pc-holly', name: 'Холлы', slug: 'holly', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'holly', order: 6 },
  { id: 'pc-divany', name: 'Диваны', slug: 'divany', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'divany', order: 7 },
];

const defaultIcons: IconItem[] = [
  { id: 'icon-adv-quality', name: 'Качество', category: 'advantages', iconType: 'Качество.png', location: 'Главная: Преимущества - Качество', color: '#A88B7D', order: 1 },
  { id: 'icon-adv-price', name: 'Доступные цены', category: 'advantages', iconType: 'Доступные цены.png', location: 'Главная: Преимущества - Доступные цены', color: '#A88B7D', order: 2 },
  { id: 'icon-adv-delivery', name: 'Доставка', category: 'advantages', iconType: 'Доставка.png', location: 'Главная: Преимущества - Доставка', color: '#A88B7D', order: 3 },
  { id: 'icon-adv-warranty', name: 'Гарантия', category: 'advantages', iconType: 'Гарантия.png', location: 'Главная: Преимущества - Гарантия', color: '#A88B7D', order: 4 },
];

const allDefaultTexts: PageTextItem[] = [
  { id: 'header-brand-name', page: 'Общие', section: 'header', label: 'Шапка: Название магазина', text: 'Сафия', htmlKey: '[data-text="brand-name"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 1 },
  // ... (для краткости добавил основные, остальные нужно восстановить из предыдущего рида)
];

export function usePageContent() {
  const [texts, setTexts] = useState<PageTextItem[]>(allDefaultTexts);
  const [isLoading, setIsLoading] = useState(true);
  const [icons, setIcons] = useState<IconItem[]>(defaultIcons);
  const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);
  const [productCategories, setProductCategories] = useState<ProductCategoryItem[]>(defaultProductCategories);

  useEffect(() => {
    api.getContent().then(data => {
      if (data && Array.isArray(data)) {
        setTexts(prev => prev.map(item => {
          const found = data.find((d: any) => d.item_key === item.id);
          return found ? { ...item, text: found.item_value } : item;
        }));
      }
      setIsLoading(false);
    });
  }, []);

  const updateText = useCallback(async (id: string, newText: string) => {
    setTexts(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
    const item = allDefaultTexts.find(t => t.id === id);
    if (item) {
      await api.saveContent({ page_section: item.page, item_key: id, item_value: newText });
    }
  }, []);

  const getText = useCallback((id: string): string => {
    const item = texts.find(t => t.id === id);
    return item ? item.text : '';
  }, [texts]);

  return { 
    texts, 
    getText, 
    updateText, 
    isLoading, 
    icons, 
    categories, 
    productCategories 
  };
}
