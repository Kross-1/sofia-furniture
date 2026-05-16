import { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

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
      
      <div className="space-y-6">
        {pages.map((page) => (
          <div key={page.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-accent">{page.url_path}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (Заголовок)</label>
                <input
                  type="text"
                  value={page.title || ''}
                  onChange={(e) => setPages(p => p.map(item => item.id === page.id ? {...item, title: e.target.value} : item))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">H1 (Заголовок страницы)</label>
                <input
                  type="text"
                  value={page.h1_header || ''}
                  onChange={(e) => setPages(p => p.map(item => item.id === page.id ? {...item, h1_header: e.target.value} : item))}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea
                  value={page.meta_description || ''}
                  onChange={(e) => setPages(p => p.map(item => item.id === page.id ? {...item, meta_description: e.target.value} : item))}
                  className="input-field resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={page.is_indexed}
                  onChange={(e) => setPages(p => p.map(item => item.id === page.id ? {...item, is_indexed: e.target.checked} : item))}
                  className="w-4 h-4 rounded border-input"
                />
                <span className="text-sm">Индексировать страницу</span>
              </label>

              <button
                onClick={() => handleSave(page)}
                disabled={savingId === page.id}
                className="btn-accent text-sm flex items-center gap-2"
              >
                {savingId === page.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
