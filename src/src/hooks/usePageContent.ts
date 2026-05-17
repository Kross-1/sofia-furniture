import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

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

const allDefaultTexts: PageTextItem[] = [
  // ... восстановите данные из предыдущего read, если нужно, здесь для примера:
  { id: 'header-brand-name', page: 'Общие', section: 'header', label: 'Шапка: Название', text: 'Сафия', htmlKey: '[data-text="brand-name"]', isGlobal: true, locations: ['Шапка сайта'], order: 1 }
];

export function usePageContent() {
  const [texts, setTexts] = useState<PageTextItem[]>(allDefaultTexts);
  const [isLoading, setIsLoading] = useState(true);

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
      await api.saveContent({
        page_section: item.page,
        item_key: id,
        item_value: newText
      });
    }
  }, []);

  const getText = useCallback((id: string): string => {
    const item = texts.find(t => t.id === id);
    return item ? item.text : '';
  }, [texts]);

  return { texts, getText, updateText, isLoading };
}
