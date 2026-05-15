import { useState, useEffect } from 'react';

export interface SocialNetwork {
  id: string;
  name: string;
  slug: string;
  url: string;
  is_active: boolean;
}

export function useSocialNetworks() {
  const [networks, setNetworks] = useState<SocialNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/db?table=SocialNetwork&active=true');
        if (res.ok) {
          const data = await res.json();
          setNetworks(data);
        }
      } catch (e) {
        console.error('Failed to load social networks:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return { networks, isLoading };
}

export function SocialIcon({ slug, className = 'w-5 h-5' }: { slug: string; className?: string }) {
  return <img src={`/icons/social/${slug}.svg`} alt={slug} className={className} />;
}

export function SocialLinks({ className = 'flex items-center gap-2' }: { className?: string }) {
  const { networks, isLoading } = useSocialNetworks();

  if (isLoading || networks.length === 0) return null;

  return (
    <div className={className}>
      {networks.map((network) => (
        <a
          key={network.id}
          href={network.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform"
          aria-label={network.name}
        >
          <SocialIcon slug={network.slug} className="w-8 h-8" />
        </a>
      ))}
    </div>
  );
}
