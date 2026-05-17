import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageSEO {
  id: string;
  url_path: string;
  title: string;
  meta_description: string;
  h1_header: string;
  is_indexed: boolean;
}

export function usePageSEO() {
  const location = useLocation();
  const [seo, setSeo] = useState<PageSEO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSeo = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/db?table=PageSEO&path=${location.pathname}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setSeo(data[0]);
          } else {
            setSeo(null);
          }
        }
      } catch (e) {
        console.error('Failed to load SEO:', e);
        setSeo(null);
      } finally {
        setLoading(false);
      }
    };
    loadSeo();
  }, [location.pathname]);

  return { seo, loading };
}
