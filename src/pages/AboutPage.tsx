import { Check, Heart, Star, Users } from 'lucide-react';
import { usePageContent } from '../hooks/usePageContent';
import { useEffect, useState } from 'react';
import { getMediaItems } from '../lib/db';

const features = [
  { icon: Heart, titleKey: 'about-adv-style', descKey: 'about-adv-style-desc' },
  { icon: Star, titleKey: 'about-adv-experience', descKey: 'about-adv-experience-desc' },
  { icon: Users, titleKey: 'about-adv-clients', descKey: 'about-adv-clients-desc' },
  { icon: Check, titleKey: 'about-adv-guarantee', descKey: 'about-adv-guarantee-desc' },
];

const STORAGE_KEY = 'sofia_media_items';

interface MediaItem {
  key: string;
  label: string;
  value: string;
  type: 'image' | 'video';
}

function ImageBlock({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full min-h-[240px] bg-muted/40 flex items-center justify-center rounded-2xl border border-border">
        <span className="text-muted-foreground text-sm">Изображение не загружено</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-lg bg-muted">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ objectFit: 'cover' }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

export default function AboutPage() {
  const { getText } = usePageContent();
  const [media, setMedia] = useState<Record<string, MediaItem[]>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const items = await getMediaItems('about');
        setMedia({ about: items.map((item: any) => ({
          key: item.section,
          label: item.section,
          value: item.url,
          type: item.type || 'image',
        }))});
      } catch {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setMedia(JSON.parse(saved));
      }
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  const aboutItems = media['about'] || [];
  const getMedia = (key: string) => {
    const item = aboutItems.find((m) => m.key === key);
    return item?.value || '';
  };

  const heroSrc = getMedia('about_hero');
  const gallery1 = getMedia('about_gallery_1');
  const gallery2 = getMedia('about_gallery_2');
  const gallery3 = getMedia('about_gallery_3');

  return (
    <main className="pt-24 pb-16 bg-background">
      <div className="container-custom">
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span
                className="inline-block px-4 py-2 bg-accent/15 text-accent rounded-full text-sm font-semibold mb-6 border border-accent/30"
                data-text="about-badge"
              >
                {getText('about-badge')}
              </span>
              <h1
                className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight"
                data-text="about-title"
              >
                {getText('about-title')}
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed" data-text="about-text-1">
                {getText('about-text-1')}
              </p>
              <p className="text-muted-foreground leading-relaxed" data-text="about-text-2">
                {getText('about-text-2')}
              </p>
            </div>

            <div className="relative">
              <div className="w-full" style={{ minHeight: '320px' }}>
                <ImageBlock src={heroSrc} alt="Мебельный салон Сафия" />
              </div>
              <div className="absolute -bottom-6 -left-6 cta-gold text-white p-6 rounded-xl shadow-xl z-10">
                <p className="text-3xl font-bold" data-text="about-years">
                  {getText('about-years-badge')}
                </p>
                <p className="text-sm" data-text="about-years-text">
                  {getText('about-years-text')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary rounded-2xl mb-16 border border-border">
          <div className="max-w-3xl mx-auto text-center px-6">
            <h2
              className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6"
              data-text="about-mission-title"
            >
              {getText('about-mission-title')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed" data-text="about-mission-text">
              {getText('about-mission-text')}
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2
            className="font-serif text-2xl md:text-3xl font-bold text-foreground text-center mb-12"
            data-text="about-features-title"
          >
            {getText('about-features-title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 hover:border-accent/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mb-4 border border-accent/25">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground" data-text={feature.titleKey}>
                  {getText(feature.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground" data-text={feature.descKey}>
                  {getText(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2
            className="font-serif text-2xl md:text-3xl font-bold text-foreground text-center mb-12"
            data-text="about-gallery-title"
          >
            {getText('about-gallery-title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[gallery1, gallery2, gallery3].map((src, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <ImageBlock src={src} alt={`Наш салон ${i + 1}`} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
