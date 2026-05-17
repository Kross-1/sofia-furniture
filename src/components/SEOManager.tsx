import { Helmet } from 'react-helmet-async';
import { usePageSEO } from '../hooks/usePageSEO';

export function SEOManager() {
  const { seo, loading } = usePageSEO();

  const title = seo?.title || 'Сафия — Мебельный салон в Махачкале';
  const description = seo?.meta_description || 'Широкий ассортимент качественной мебели и ковров ручной работы. Более 10 лет радуем жителей Махачкалы стильными решениями для дома.';

  if (loading) return null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </Helmet>
  );
}
