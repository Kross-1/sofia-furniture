import { usePageSEO } from '../hooks/usePageSEO';

interface PageH1Props {
  fallback: string;
  className?: string;
  'data-text'?: string;
}

export function PageH1({ fallback, className, 'data-text': dataText }: PageH1Props) {
  const { seo } = usePageSEO();
  const text = seo?.h1_header || fallback;

  return (
    <h1 className={className} data-text={dataText}>
      {text}
    </h1>
  );
}
