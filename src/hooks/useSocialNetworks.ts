import { useState, useEffect } from 'react';
import { Send, MessageCircle, Youtube, Instagram, Globe } from 'lucide-react';

export interface SocialNetwork {
  id: string;
  name: string;
  slug: string;
  url: string;
  is_active: boolean;
}

const icons: Record<string, React.ElementType> = {
  telegram: Send,
  whatsapp: MessageCircle,
  vk: Globe,
  instagram: Instagram,
  youtube: Youtube,
};

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
  const Icon = icons[slug] || Globe;
  return <Icon className={className} />;
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
          className="text-foreground/60 hover:text-accent transition-colors"
          aria-label={network.name}
        >
          <SocialIcon slug={network.slug} />
        </a>
      ))}
    </div>
  );
}
