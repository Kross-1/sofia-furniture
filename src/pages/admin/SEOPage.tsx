import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface SEOPage {
  id: string;
  url_path: string;
  title: string;
  meta_description: string;
  h1_header: string;
  is_indexed: boolean;
}

export default function SEOPage() {
  const [pages, setPages] = useState<SEOPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadSEO();
  }, []);

  const loadSEO = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/db?table=PageSEO');
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (e) {
      console.error('Failed to load SEO data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (page: SEOPage) => {
    setSavingId(page.id);
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'PageSEO_update',
          ...page
        }),
      });
      if (res.ok) {
        loadSEO(); // Refresh
      }
    } catch (e) {
      console.error('Failed to save SEO:', e);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground mb-6">Настройка SEO страниц</h1>
      
      <div className="space-y-8">
        {pages.map((page) => (
          <div key={page.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-accent">{page.url_path}</h3>
              <button
                onClick={() => handleSave(page)}
                disabled={savingId === page.id}
                className="btn-accent text-sm flex items-center gap-2"
              >
                {savingId === page.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title (Заголовок для поиска)</label>
                <input
                  type="text"
                  value={page.title || ''}
                  onChange={(e) => setPages(p => p.map(item => item.id === page.id ? {...item, title: e.target.value} : item))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">H1 (Главный заголовок на странице)</label>
                <input
                  type="text"
                  value={page.h1_header || ''}
                  onChange={(e) => setPages(p => p.map(item => item.id === page.id ? {...item, h1_header: e.target.value} : item))}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Meta Description (Описание для поиска)</label>
                <textarea
                  value={page.meta_description || ''}
                  onChange={(e) => setPages(p => p.map(item => item.id === page.id ? {...item, meta_description: e.target.value} : item))}
                  className="input-field resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Предпросмотр в поиске */}
              <div className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-2">Предпросмотр в поиске (Яндекс/Google):</p>
                <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-xl font-medium mb-1 truncate">
                  {page.title || 'Заголовок страницы'}
                </div>
                <div className="text-green-800 dark:text-[#81c995] text-sm truncate">mahachkala-mebel.ru{page.url_path}</div>
                <div className="text-foreground/80 text-sm mt-1">
                  {page.meta_description || 'Здесь будет описание страницы, которое привлечет пользователя...'}
                </div>
              </div>

              {/* Предпросмотр на сайте */}
              <div className="p-4 bg-card rounded-lg border border-accent/20">
                <p className="text-xs text-muted-foreground mb-2">Предпросмотр заголовка на сайте (H1):</p>
                <h1 className="text-3xl font-bold text-foreground font-serif mt-2">
                  {page.h1_header || 'Заголовок H1 на странице'}
                </h1>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={page.is_indexed}
                  onChange={(e) => setPages(p => p.map(item => item.id === page.id ? {...item, is_indexed: e.target.checked} : item))}
                  className="w-4 h-4 rounded border-input"
                />
                <span className="text-sm font-medium">Индексировать страницу (разрешить Яндексу/Google заходить сюда)</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
