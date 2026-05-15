import { useState, useEffect, useCallback } from 'react';
import {
  Send,
  MessageCircle,
  Youtube,
  Instagram,
  Globe,
  Save,
  RefreshCw,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

interface SocialNetwork {
  id: string;
  name: string;
  slug: string;
  url: string;
  is_active: boolean;
  createdAt: string;
}

const networkIcons: Record<string, React.ElementType> = {
  telegram: Send,
  whatsapp: MessageCircle,
  vk: Globe,
  instagram: Instagram,
  youtube: Youtube,
};

const networkColors: Record<string, { bg: string; border: string; icon: string; hover: string }> = {
  telegram: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', icon: 'text-sky-500', hover: 'hover:border-sky-500/60' },
  whatsapp: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'text-green-500', hover: 'hover:border-green-500/60' },
  vk: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-500', hover: 'hover:border-blue-500/60' },
  instagram: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', icon: 'text-pink-500', hover: 'hover:border-pink-500/60' },
  youtube: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-500', hover: 'hover:border-red-500/60' },
};

export default function SocialNetworksPage() {
  const [networks, setNetworks] = useState<SocialNetwork[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadNetworks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/db?table=SocialNetwork');
      if (res.ok) {
        const data = await res.json();
        setNetworks(data);
      }
    } catch (e) {
      console.error('Failed to load social networks:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNetworks();
  }, [loadNetworks]);

  const handleToggle = async (network: SocialNetwork) => {
    if (!network.url || network.url.trim() === '' || network.url === `https://${network.slug}.com/` || network.url === `https://t.me/` || network.url === `https://wa.me/`) {
      setEditingId(network.id);
      setEditUrl(network.url);
      return;
    }

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'SocialNetwork_update',
          id: network.id,
          is_active: !network.is_active,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setNetworks(prev => prev.map(n => n.id === updated.id ? updated : n));
      }
    } catch (e) {
      console.error('Failed to toggle network:', e);
    }
  };

  const handleSaveUrl = async (id: string) => {
    setSavingId(id);
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'SocialNetwork_update',
          id,
          url: editUrl,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setNetworks(prev => prev.map(n => n.id === updated.id ? updated : n));
        setEditingId(null);
        setEditUrl('');
      }
    } catch (e) {
      console.error('Failed to save URL:', e);
    } finally {
      setSavingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditUrl('');
  };

  const getIcon = (slug: string) => {
    const Icon = networkIcons[slug] || Globe;
    return <Icon className="w-6 h-6" />;
  };

  const getColors = (slug: string) => {
    return networkColors[slug] || { bg: 'bg-muted', border: 'border-border', icon: 'text-muted-foreground', hover: 'hover:border-accent/60' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Социальные сети
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Настройте ссылки и включите отображение на сайте
          </p>
        </div>
        <button
          onClick={loadNetworks}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {networks.map((network) => {
          const colors = getColors(network.slug);
          const isEditing = editingId === network.id;
          const hasValidUrl = network.url && network.url.trim() !== '' && !network.url.endsWith('.com/') && !network.url.endsWith('wa.me/') && !network.url.endsWith('t.me/');

          return (
            <div
              key={network.id}
              className={`bg-card text-card-foreground border rounded-xl p-5 shadow-sm transition-all ${colors.border} ${colors.hover}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${colors.bg} ${colors.border}`}>
                    <span className={colors.icon}>
                      {getIcon(network.slug)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{network.name}</h3>
                    <p className="text-xs text-muted-foreground">@{network.slug}</p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(network)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    network.is_active && hasValidUrl
                      ? 'bg-accent'
                      : 'bg-muted border border-border'
                  }`}
                  aria-label={`Toggle ${network.name}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      network.is_active && hasValidUrl ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* URL Input */}
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Ссылка на профиль
                    </label>
                    <input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder={`https://${network.slug}.com/username`}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveUrl(network.id)}
                      disabled={savingId === network.id || !editUrl.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingId === network.id ? (
                        <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Сохранить
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <a
                      href={network.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline truncate flex items-center gap-1 max-w-[80%]"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {network.url || 'Не указана'}
                    </a>
                    <button
                      onClick={() => {
                        setEditingId(network.id);
                        setEditUrl(network.url);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Изменить
                    </button>
                  </div>
                  {!hasValidUrl && (
                    <p className="text-xs text-amber-500 mt-2">
                      Укажите ссылку, чтобы включить сеть
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview */}
      {networks.some(n => n.is_active) && (
        <div className="mt-8 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4 text-foreground">Предпросмотр на сайте</h2>
          <div className="flex items-center gap-3 flex-wrap">
            {networks.filter(n => n.is_active).map((network) => {
              const colors = getColors(network.slug);
              return (
                <a
                  key={network.id}
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all hover:scale-110 ${colors.bg} ${colors.border} ${colors.icon}`}
                >
                  {getIcon(network.slug)}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
