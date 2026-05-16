import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageContent } from '../hooks/usePageContent';
import { useEffect, useState, useRef } from 'react';
import { getMediaItems } from '../lib/db';



const advantages = [
  { key: 'adv-quality',  iconKey: 'icon-adv-quality',  fallback: 'Качество.png',         titleK: 'home-adv-quality-title',  descK: 'home-adv-quality-desc' },
  { key: 'adv-price',    iconKey: 'icon-adv-price',    fallback: 'Доступные цены.png',   titleK: 'home-adv-price-title',    descK: 'home-adv-price-desc' },
  { key: 'adv-delivery', iconKey: 'icon-adv-delivery', fallback: 'Доставка.png',         titleK: 'home-adv-delivery-title', descK: 'home-adv-delivery-desc' },
  { key: 'adv-warranty', iconKey: 'icon-adv-warranty', fallback: 'Гарантия.png',         titleK: 'home-adv-warranty-title', descK: 'home-adv-warranty-desc' },
];

interface MediaItem {
  key: string;
  label: string;
  description: string;
  value: string;
  type?: 'image' | 'video';
}

function VideoBackground({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover opacity-50 dark:opacity-30"
    />
  );
}

export default function HomePage() {
  const { getText, getIcon, getCategories, isLoaded } = usePageContent();
  const [media, setMedia] = useState<Record<string, MediaItem[]>>({});

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Загрузка...</div>;


  useEffect(() => {
    const load = async () => {
      const items = await getMediaItems('home');
      setMedia({ home: items.map((item: any) => ({
        key: item.section,
        label: item.section,
        description: '',
        value: item.url,
        type: item.type || 'image',
      }))});
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  const getMedia = (key: string) => {
    const items = media['home'] || [];
    const item = items.find((m) => m.key === key);
    return item?.value || '';
  };

  const heroBg = getMedia('hero_background');
  const heroVideo = getMedia('hero_video');
  const heroSrc = heroBg;

  const getCategoryIconSrc = (category: { iconType: string; iconUrl?: string }) => {
    if (category.iconUrl && (category.iconUrl.startsWith('http://') || category.iconUrl.startsWith('https://'))) {
      return category.iconUrl;
    }
    return `/icons/${category.iconType}`;
  };

  const categories = getCategories();

  return (
    <main className="bg-background">
      {/* ===== Hero Section ===== */}
      <section className="relative min-h-[90vh] flex items-center pt-20 hero-luxury overflow-hidden">
        {/* decorative gold blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/15 dark:bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/15 dark:bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="absolute inset-0">
          {heroVideo ? (
            <VideoBackground src={heroVideo} />
          ) : (
            <img
              src={heroSrc}
              alt=""
              aria-hidden
              className="w-full h-full object-cover opacity-40 dark:opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent dark:from-black/90 dark:via-black/60" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-accent/30"
              data-text="hero-badge"
            >
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              {getText('home-hero-badge')}
            </span>
            <h1
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
              data-text="hero-title"
            >
              {getText('home-hero-title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed" data-text="hero-subtitle">
              {getText('home-hero-subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/catalog"
                className="btn-accent inline-flex items-center justify-center gap-2"
                data-text="hero-btn"
              >
                {getText('home-hero-btn')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contacts"
                className="btn-outline inline-flex items-center justify-center gap-2"
                data-text="hero-btn-contacts"
              >
                {getText('home-hero-btn-contacts')}
              </Link>
            </div>
          </div>
        </div>

        
      </section>

      {/* ===== Features Section ===== */}
      <section className="py-20 bg-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2
              className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4"
              data-text="features-title"
            >
              {getText('home-features-title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" data-text="features-subtitle">
              {getText('home-features-subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv) => {
              const customIcon = getIcon(adv.iconKey);
              const iconSrc = customIcon ? `/icons/${customIcon.iconType}` : `/icons/${adv.fallback}`;
              return (
                <div
                  key={adv.key}
                  className="group p-6 rounded-2xl bg-card text-card-foreground border border-border hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden border border-accent/20">
                    <img
                      src={iconSrc}
                      alt={getText(adv.titleK)}
                      className="w-9 h-9 object-contain"
                      loading="lazy"
                      style={{ filter: 'brightness(0) saturate(100%) invert(63%) sepia(58%) saturate(580%) hue-rotate(2deg) brightness(95%) contrast(89%)' }}
                    />
                  </div>
                  <h3
                    className="font-semibold text-lg text-foreground mb-2 text-center"
                    data-text={adv.key}
                  >
                    {getText(adv.titleK)}
                  </h3>
                  <p className="text-muted-foreground text-sm text-center" data-text={`${adv.key}-desc`}>
                    {getText(adv.descK)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Categories Section ===== */}
      <section className="py-20 bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2
              className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4"
              data-text="categories-title"
            >
              {getText('home-categories-title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" data-text="categories-subtitle">
              {getText('home-categories-subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((category) => {
              const iconSrc = getCategoryIconSrc(category);
              return (
                <Link
                  key={category.id}
                  to={category.link}
                  className="group bg-card text-card-foreground rounded-2xl p-5 lg:p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1 border border-border hover:border-accent/40"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden border border-accent/20 transition-transform duration-300 group-hover:scale-110">
                    <img
                      src={iconSrc}
                      alt={category.name}
                      className="w-9 h-9 object-contain"
                      loading="lazy"
                      style={{ filter: 'brightness(0) saturate(100%) invert(63%) sepia(58%) saturate(580%) hue-rotate(2deg) brightness(95%) contrast(89%)' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icons/Диваны.png';
                      }}
                    />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm lg:text-base">{category.name}</h3>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/catalog"
              className="btn-accent inline-flex items-center gap-2"
              data-text="categories-btn"
            >
              {getText('home-categories-btn')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-20 cta-gold text-white">
        <div className="container-custom text-center">
          <h2
            className="font-serif text-3xl md:text-4xl font-bold mb-4 text-white"
            data-text="cta-title"
          >
            {getText('home-cta-title')}
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8 text-lg" data-text="cta-subtitle">
            {getText('home-cta-subtitle')}
          </p>
          <Link
            to="/request"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-700 font-semibold rounded-lg
              hover:bg-amber-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            data-text="cta-btn"
          >
            {getText('home-cta-btn')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
