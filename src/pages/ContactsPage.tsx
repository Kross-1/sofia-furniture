import { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, Mail } from 'lucide-react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { usePageContent } from '../hooks/usePageContent';
import { getMediaItems } from '../lib/db';

const STORAGE_KEY = 'sofia_media_items';

interface MediaItem {
  key: string;
  label: string;
  description: string;
  value: string;
  type?: 'image' | 'video';
}

export default function ContactsPage() {
  const { trackPhoneClick } = useAnalytics();
  const { getText } = usePageContent();
  const [media, setMedia] = useState<Record<string, MediaItem[]>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const items = await getMediaItems('contacts');
        setMedia({ contacts: items.map((item: any) => ({
          key: item.section,
          label: item.section,
          description: '',
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

  const getMedia = (key: string) => {
    const items = media['contacts'] || [];
    const item = items.find((m) => m.key === key);
    return item?.value || '';
  };

  const exteriorImage = getMedia('contacts_exterior');

  

  const handlePhoneClick = (displayNumber: string) => {
    trackPhoneClick(displayNumber, 'Страница контактов');
  };

  const phone1 = getText('contacts-phone-1');
  const phone2 = getText('contacts-phone-2');
  const formatPhone = (phone: string) => phone.replace(/[^+\d]/g, '');

  return (
    <main className="pt-24 pb-16 bg-background min-h-screen">
      <div className="container-custom">
        <div className="mb-12">
          <h1
            className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4"
            data-text="contacts-title"
          >
            {getText('contacts-title')}
          </h1>
          <p className="text-muted-foreground text-lg" data-text="contacts-subtitle">
            {getText('contacts-subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch mb-12">
          <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-8 flex-1 flex flex-col">
              <h2
                className="font-serif text-xl font-bold text-foreground mb-8"
                data-text="contacts-info-title"
              >
                {getText('contacts-info-title')}
              </h2>

              <div className="flex flex-col gap-8 flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1" data-text="contacts-address-label">
                      {getText('contacts-address-label')}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed" data-text="address">
                      {getText('contacts-address-text')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1" data-text="contacts-phone-label">
                      {getText('contacts-phone-label')}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {phone1 && (
                        <a
                          href={`tel:${formatPhone(phone1)}`}
                          className="text-accent hover:underline font-medium"
                          onClick={() => handlePhoneClick(phone1)}
                          data-text="phone-1"
                        >
                          {phone1}
                        </a>
                      )}
                      {phone2 && (
                        <a
                          href={`tel:${formatPhone(phone2)}`}
                          className="text-accent hover:underline font-medium"
                          onClick={() => handlePhoneClick(phone2)}
                          data-text="phone-2"
                        >
                          {phone2}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1" data-text="contacts-time-label">
                      {getText('contacts-time-label')}
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed" data-text="contacts-time-text">
                      {getText('contacts-time-text')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1" data-text="contacts-email-label">
                      {getText('contacts-email-label')}
                    </h3>
                    <a
                      href={`mailto:${getText('contacts-email-text')}`}
                      className="text-accent hover:underline font-medium"
                      data-text="contacts-email-text"
                    >
                      {getText('contacts-email-text')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex-1 min-h-[400px] lg:min-h-0">
              <iframe
                src="https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3Ab0f6bdba1bf40e61eb94b3385213c766d1d00889f4b9b4a464485f23875b0b5b&width=500&height=400&lang=ru_RU&scroll=true"
                width="100%"
                height="100%"
                frameBorder="0"
                title={getText('contacts-map-title')}
                allowFullScreen
                className="w-full h-full"
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>

        {/* Exterior Image Banner */}
        {exteriorImage ? (
          <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
            <img
              src={exteriorImage}
              alt="Мебельный салон Сафия"
              className="w-full h-[300px] md:h-[400px] object-cover"
            />
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-muted/30 flex items-center justify-center" style={{ height: '300px' }}>
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Загрузите фото салона в разделе «Контент»</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
