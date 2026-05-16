import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePageContent } from '../hooks/usePageContent';

export function SEOManager() {
  const location = useLocation();
  const { getText } = usePageContent();
  const [seo, setSeo] = useState<any>(null);

  useEffect(() => {
    const loadSeo = async () => {
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
      }
    };
    loadSeo();
  }, [location.pathname]);

  const title = seo?.title || 'Сафия — Мебельный салон в Махачкале';
  const description = seo?.meta_description || 'Широкий ассортимент качественной мебели и ковров ручной работы. Более 10 лет радуем жителей Махачкалы стильными решениями для дома.';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </Helmet>
  );
}
